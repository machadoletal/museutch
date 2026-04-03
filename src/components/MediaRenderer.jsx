/**
 * MediaRenderer
 *
 * Renderiza o conteúdo de um único item conforme seu tipo:
 *   texto  → quote estilizado
 *   imagem → imagem com clique para ampliar
 *   audio  → player HTML5 nativo
 *   video  → iframe embed ou <video>
 *
 * Props:
 *   item       — objeto normalizado com tipo, conteudo_texto, url_midia
 *   compact    — modo reduzido (para preview nos cards)
 */
export default function MediaRenderer({ item, compact = false }) {
  const { tipo, conteudo_texto: texto, url_midia: url } = item

  if (tipo === 'texto') {
    return (
      <blockquote
        className={`
          font-serif italic leading-relaxed text-museum-text
          border-l-2 border-museum-accent/50 pl-3
          ${compact ? 'text-sm line-clamp-3' : 'text-base md:text-lg'}
        `}
      >
        {texto ? `"${texto}"` : <span className="text-museum-muted/40">sem conteúdo</span>}
      </blockquote>
    )
  }

  if (tipo === 'imagem') {
    if (!url) return <MediaMissing icon="🖼️" />
    return compact
      ? (
        <div className="rounded-lg overflow-hidden bg-museum-surface aspect-video">
          <img src={url} alt="" className="w-full h-full object-cover" loading="lazy" />
        </div>
      )
      : (
        <a href={url} target="_blank" rel="noopener noreferrer" className="block rounded-xl overflow-hidden border border-museum-border">
          <img src={url} alt="" className="w-full max-h-[70vh] object-contain bg-museum-surface" loading="lazy" />
        </a>
      )
  }

  if (tipo === 'audio') {
    if (!url) return <MediaMissing icon="🎵" />
    if (compact) {
      return (
        <div className="flex items-center gap-2 text-purple-400 text-xs bg-purple-400/10 border border-purple-400/20 rounded-lg px-3 py-2">
          <span>🎵</span> <span>Áudio</span>
        </div>
      )
    }
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
    if (!url) return <MediaMissing icon="🎬" />
    if (compact) {
      return (
        <div className="flex items-center gap-2 text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
          <span>🎬</span> <span>Vídeo</span>
        </div>
      )
    }
    const embedUrl = toEmbedUrl(url)
    // URL externa que pode ser embutida
    if (embedUrl !== url || url.includes('youtube') || url.includes('youtu.be') || url.includes('vimeo')) {
      return (
        <div className="rounded-xl overflow-hidden border border-museum-border aspect-video bg-black">
          <iframe
            src={embedUrl}
            title="vídeo"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
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

function MediaMissing({ icon }) {
  return (
    <div className="rounded-xl border border-museum-border bg-museum-surface aspect-video flex items-center justify-center text-museum-muted/30 text-4xl">
      {icon}
    </div>
  )
}

function toEmbedUrl(url) {
  if (!url) return url
  if (url.includes('/embed/')) return url
  const short = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/)
  if (short) return `https://www.youtube.com/embed/${short[1]}`
  const watch = url.match(/[?&]v=([a-zA-Z0-9_-]+)/)
  if (watch) return `https://www.youtube.com/embed/${watch[1]}`
  const vimeo = url.match(/vimeo\.com\/(\d+)/)
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`
  return url
}
