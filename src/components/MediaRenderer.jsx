import { useState } from 'react'
import { resolveMediaUrl } from '../utils/resolveMediaUrl'

function TextQuote({ texto, compact }) {
  return (
    <blockquote className={`
      font-serif italic leading-relaxed text-museum-text whitespace-pre-wrap
      border-l-2 border-museum-accent/50 pl-3
      ${compact ? 'text-sm line-clamp-3' : 'text-base md:text-lg'}
    `}>
      &ldquo;{texto}&rdquo;
    </blockquote>
  )
}

export default function MediaRenderer({ item, compact = false }) {
  const { tipo, conteudo_texto: texto, url_midia: rawUrl } = item
  const hasText  = texto?.trim().length > 0
  const hasMedia = rawUrl?.trim().length > 0

  if (tipo === 'texto') {
    return (
      <div className={hasText && hasMedia && !compact ? 'space-y-3' : undefined}>
        {hasText
          ? <TextQuote texto={texto} compact={compact} />
          : <span className="text-museum-muted/40 text-sm">sem conteúdo</span>}
        {hasMedia && !compact && <ImageRenderer rawUrl={rawUrl} compact={false} />}
      </div>
    )
  }

  if (tipo === 'imagem') {
    return (
      <div className={hasText ? 'space-y-2' : undefined}>
        <ImageRenderer rawUrl={rawUrl} compact={compact} />
        {hasText && <TextQuote texto={texto} compact={compact} />}
      </div>
    )
  }

  if (tipo === 'audio') {
    const { url, useIframe } = resolveMediaUrl(rawUrl, 'audio')
    if (!url) return <MediaMissing icon="🎵" label="Áudio não disponível" />

    if (compact) {
      return (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-purple-400 text-xs bg-purple-400/10 border border-purple-400/20 rounded-lg px-3 py-2">
            <span>🎵</span><span>Áudio — clique para ouvir</span>
          </div>
          {hasText && <TextQuote texto={texto} compact />}
        </div>
      )
    }

    const player = useIframe ? (
      <div className="rounded-xl overflow-hidden border border-museum-border bg-museum-surface">
        <iframe src={url} title="player de áudio" allow="autoplay" className="w-full" style={{ height: '80px', border: 'none' }} />
      </div>
    ) : (
      <div className="rounded-xl bg-museum-surface border border-museum-border p-4 flex flex-col items-center gap-3">
        <span className="text-3xl">🎵</span>
        <audio controls className="w-full max-w-md" style={{ accentColor: '#d4802a' }}>
          <source src={url} />
        </audio>
      </div>
    )
    return (
      <div className={hasText ? 'space-y-2' : undefined}>
        {player}
        {hasText && <TextQuote texto={texto} compact={compact} />}
      </div>
    )
  }

  if (tipo === 'video') {
    const { url, useIframe } = resolveMediaUrl(rawUrl, 'video')
    if (!url) return <MediaMissing icon="🎬" label="Vídeo não disponível" />

    if (compact) {
      return (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
            <span>🎬</span><span>Vídeo — clique para assistir</span>
          </div>
          {hasText && <TextQuote texto={texto} compact />}
        </div>
      )
    }

    const player = useIframe ? (
      <div className="rounded-xl overflow-hidden border border-museum-border aspect-video bg-black">
        <iframe
          src={url}
          title="player de vídeo"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
          style={{ border: 'none' }}
        />
      </div>
    ) : (
      <div className="rounded-xl overflow-hidden border border-museum-border aspect-video bg-black">
        <video controls className="w-full h-full">
          <source src={url} />
        </video>
      </div>
    )
    return (
      <div className={hasText ? 'space-y-2' : undefined}>
        {player}
        {hasText && <TextQuote texto={texto} compact={compact} />}
      </div>
    )
  }

  return null
}

/**
 * ImageRenderer com fallback: tenta thumbnail do Drive como <img>.
 * Se falhar (404, CORS, etc.), cai para o iframe /preview.
 */
function ImageRenderer({ rawUrl, compact }) {
  const [failed, setFailed] = useState(false)

  const { url: thumbUrl } = resolveMediaUrl(rawUrl, 'imagem', compact ? 'compact' : 'full')
  const { url: previewUrl } = resolveMediaUrl(rawUrl, 'video') // /preview para fallback

  if (!thumbUrl && !previewUrl) {
    return <MediaMissing icon="🖼️" label="Imagem não disponível" />
  }

  // Compact: preview no card com thumbnail como <img>
  if (compact) {
    if (failed) {
      // Fallback compacto: badge simples
      return (
        <div className="flex items-center gap-2 text-green-400 text-xs bg-green-400/10 border border-green-400/20 rounded-lg px-3 py-2">
          <span>🖼️</span><span>Imagem — clique para ver</span>
        </div>
      )
    }
    return (
      <div className="rounded-lg overflow-hidden bg-museum-surface aspect-video">
        <img
          src={thumbUrl}
          alt=""
          className="w-full h-full object-cover"
          loading="lazy"
          onError={() => setFailed(true)}
        />
      </div>
    )
  }

  // Full (modal): thumbnail como <img>, fallback para iframe /preview
  if (failed) {
    return (
      <div className="rounded-xl overflow-hidden border border-museum-border bg-museum-surface" style={{ minHeight: '300px' }}>
        <iframe
          src={previewUrl}
          title="imagem"
          className="w-full"
          style={{ height: '500px', border: 'none' }}
          allow="autoplay"
        />
      </div>
    )
  }

  return (
    <div className="rounded-xl overflow-hidden border border-museum-border bg-museum-surface">
      <img
        src={thumbUrl}
        alt=""
        className="w-full max-h-[70vh] object-contain"
        loading="lazy"
        onError={() => setFailed(true)}
      />
    </div>
  )
}

function MediaMissing({ icon, label }) {
  return (
    <div className="rounded-xl border border-museum-border bg-museum-surface aspect-video flex flex-col items-center justify-center gap-2 text-museum-muted/40">
      <span className="text-3xl">{icon}</span>
      <span className="text-xs">{label}</span>
    </div>
  )
}
