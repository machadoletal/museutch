/**
 * MediaPlayer — Renderiza o conteúdo de mídia de acordo com o tipo da pérola.
 * Suporta: texto, imagem, áudio e vídeo (arquivo local ou URL externa).
 */
export default function MediaPlayer({ pearl }) {
  const { tipo, conteudo, arquivo, url_midia, titulo } = pearl

  if (tipo === 'texto') {
    return (
      <div className="rounded-xl border border-museum-border bg-museum-surface p-6">
        <blockquote className="font-serif text-lg md:text-xl italic text-museum-text leading-relaxed text-center">
          "{conteudo}"
        </blockquote>
      </div>
    )
  }

  if (tipo === 'imagem') {
    const src = arquivo || url_midia
    if (!src) return <MediaPlaceholder icon="🖼️" label="Imagem não disponível" />
    return (
      <div className="rounded-xl overflow-hidden border border-museum-border">
        <img
          src={src}
          alt={titulo}
          className="w-full max-h-[70vh] object-contain bg-museum-surface"
        />
      </div>
    )
  }

  if (tipo === 'audio') {
    const src = arquivo || url_midia
    if (!src) return <MediaPlaceholder icon="🎵" label="Áudio não disponível" />
    return (
      <div className="rounded-xl border border-museum-border bg-museum-surface p-6 flex flex-col items-center gap-4">
        <div className="text-4xl">🎵</div>
        <audio
          controls
          className="w-full max-w-md"
          style={{ accentColor: '#d4802a' }}
        >
          <source src={src} />
          Seu navegador não suporta reprodução de áudio.
        </audio>
      </div>
    )
  }

  if (tipo === 'video') {
    // Vídeo local
    if (arquivo) {
      return (
        <div className="rounded-xl overflow-hidden border border-museum-border bg-black aspect-video">
          <video controls className="w-full h-full">
            <source src={arquivo} />
            Seu navegador não suporta reprodução de vídeo.
          </video>
        </div>
      )
    }

    // URL externa (YouTube embed, etc)
    if (url_midia) {
      // Converte URLs normais do YouTube para embed
      const embedUrl = toEmbedUrl(url_midia)
      return (
        <div className="rounded-xl overflow-hidden border border-museum-border bg-black aspect-video">
          <iframe
            src={embedUrl}
            title={titulo}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      )
    }

    return <MediaPlaceholder icon="🎬" label="Vídeo não disponível" />
  }

  return null
}

function MediaPlaceholder({ icon, label }) {
  return (
    <div className="rounded-xl border border-museum-border bg-museum-surface aspect-video flex flex-col items-center justify-center gap-2 text-museum-muted">
      <span className="text-4xl opacity-30">{icon}</span>
      <span className="text-sm">{label}</span>
    </div>
  )
}

/** Converte URL do YouTube para embed se necessário */
function toEmbedUrl(url) {
  if (!url) return url
  // Já é embed
  if (url.includes('youtube.com/embed') || url.includes('youtu.be/embed')) return url
  // https://youtu.be/ID
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/)
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`
  // https://www.youtube.com/watch?v=ID
  const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]+)/)
  if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`
  return url
}
