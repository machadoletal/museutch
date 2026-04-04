import { useState } from 'react'
import { resolveMediaUrl } from '../utils/resolveMediaUrl'

/**
 * MediaRenderer
 *
 * Renderiza um item conforme seu tipo, resolvendo automaticamente
 * links do Google Drive para URLs embeddáveis.
 *
 * Props:
 *   item     — objeto com tipo, conteudo_texto, url_midia
 *   compact  — modo resumido para preview nos cards
 */
export default function MediaRenderer({ item, compact = false }) {
  const { tipo, conteudo_texto: texto, url_midia: rawUrl } = item
  const { url, useIframe } = resolveMediaUrl(rawUrl, tipo)

  if (tipo === 'texto') {
    return (
      <blockquote
        className={`
          font-serif italic leading-relaxed text-museum-text
          border-l-2 border-museum-accent/50 pl-3
          ${compact ? 'text-sm line-clamp-3' : 'text-base md:text-lg'}
        `}
      >
        {texto
          ? `"${texto}"`
          : <span className="text-museum-muted/40">sem conteúdo</span>
        }
      </blockquote>
    )
  }

  if (tipo === 'imagem') {
    if (!url) return <MediaMissing icon="🖼️" label="Imagem não disponível" />
    if (compact) {
      return (
        <div className="rounded-lg overflow-hidden bg-museum-surface aspect-video">
          <img
            src={url}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
            onError={e => { e.target.style.display = 'none' }}
          />
        </div>
      )
    }
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="block rounded-xl overflow-hidden border border-museum-border">
        <img
          src={url}
          alt=""
          className="w-full max-h-[70vh] object-contain bg-museum-surface"
          loading="lazy"
          onError={e => { e.target.parentElement.replaceWith(Object.assign(document.createElement('p'), { textContent: 'Imagem indisponível', className: 'text-museum-muted text-sm p-4' })) }}
        />
      </a>
    )
  }

  if (tipo === 'audio') {
    if (!url) return <MediaMissing icon="🎵" label="Áudio não disponível" />

    if (compact) {
      return (
        <div className="flex items-center gap-2 text-purple-400 text-xs bg-purple-400/10 border border-purple-400/20 rounded-lg px-3 py-2">
          <span>🎵</span><span>Áudio — clique para ouvir</span>
        </div>
      )
    }

    // Google Drive → iframe com player nativo do Drive
    if (useIframe) {
      return (
        <div className="rounded-xl overflow-hidden border border-museum-border bg-museum-surface">
          <iframe
            src={url}
            title="player de áudio"
            allow="autoplay"
            className="w-full"
            style={{ height: '80px', border: 'none' }}
          />
        </div>
      )
    }

    // Arquivo direto → player HTML5 nativo
    return (
      <div className="rounded-xl bg-museum-surface border border-museum-border p-4 flex flex-col items-center gap-3">
        <span className="text-3xl">🎵</span>
        <audio controls className="w-full max-w-md" style={{ accentColor: '#d4802a' }}>
          <source src={url} />
          Seu navegador não suporta áudio.
        </audio>
      </div>
    )
  }

  if (tipo === 'video') {
    if (!url) return <MediaMissing icon="🎬" label="Vídeo não disponível" />

    if (compact) {
      return (
        <div className="flex items-center gap-2 text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
          <span>🎬</span><span>Vídeo — clique para assistir</span>
        </div>
      )
    }

    // Google Drive preview ou YouTube/Vimeo embed → iframe
    if (useIframe) {
      return (
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
      )
    }

    // Arquivo de vídeo direto
    return (
      <div className="rounded-xl overflow-hidden border border-museum-border aspect-video bg-black">
        <video controls className="w-full h-full">
          <source src={url} />
          Seu navegador não suporta vídeo.
        </video>
      </div>
    )
  }

  return null
}

function MediaMissing({ icon, label }) {
  return (
    <div className="rounded-xl border border-museum-border bg-museum-surface aspect-video flex flex-col items-center justify-center gap-2 text-museum-muted/40">
      <span className="text-3xl">{icon}</span>
      <span className="text-xs">{label}</span>
    </div>
  )
}
