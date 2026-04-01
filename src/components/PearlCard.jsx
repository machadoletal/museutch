import { useState } from 'react'

const TIPO_CONFIG = {
  texto:  { icon: '✍️', label: 'Texto',  color: 'text-blue-400',   bg: 'bg-blue-400/10',   border: 'border-blue-400/20'   },
  imagem: { icon: '🖼️', label: 'Imagem', color: 'text-green-400',  bg: 'bg-green-400/10',  border: 'border-green-400/20'  },
  audio:  { icon: '🎵', label: 'Áudio',  color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20' },
  video:  { icon: '🎬', label: 'Vídeo',  color: 'text-red-400',    bg: 'bg-red-400/10',    border: 'border-red-400/20'    },
}

/** Formata "2021-08-20" → "20 ago 2021" */
function formatDate(dateStr) {
  if (!dateStr) return ''
  const [year, month, day] = dateStr.split('-')
  const months = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez']
  return `${parseInt(day)} ${months[parseInt(month) - 1]} ${year}`
}

/**
 * PearlCard — Card individual de uma pérola no grid
 */
export default function PearlCard({ pearl, onClick }) {
  const [hovered, setHovered] = useState(false)
  const tipo = TIPO_CONFIG[pearl.tipo] || TIPO_CONFIG.texto

  return (
    <article
      onClick={() => onClick(pearl)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="
        relative group cursor-pointer rounded-xl border border-museum-border
        bg-museum-card overflow-hidden
        transition-all duration-300
        hover:border-museum-accent/40 hover:shadow-lg hover:shadow-black/40
        hover:-translate-y-0.5
        animate-slide-up
      "
    >
      {/* Barra de cor no topo */}
      <div className={`h-0.5 w-full bg-gradient-to-r from-museum-accent/0 via-museum-accent to-museum-accent/0 transition-opacity duration-300 ${hovered ? 'opacity-100' : 'opacity-0'}`} />

      <div className="p-5">
        {/* Header do card: data + badge de tipo */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <time className="text-xs text-museum-muted font-mono">
            {formatDate(pearl.data)}
          </time>
          <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${tipo.bg} ${tipo.color} ${tipo.border} shrink-0`}>
            <span>{tipo.icon}</span>
            <span>{tipo.label}</span>
          </span>
        </div>

        {/* Nome da pessoa */}
        <div className="flex items-center gap-2 mb-2">
          <Avatar name={pearl.pessoa} />
          <span className="text-sm font-medium text-museum-accent">{pearl.pessoa}</span>
        </div>

        {/* Título */}
        <h2 className="font-serif text-base font-semibold text-museum-text leading-snug mb-2 group-hover:text-pearl-200 transition-colors">
          {pearl.titulo}
        </h2>

        {/* Preview do conteúdo (só para texto) */}
        {pearl.tipo === 'texto' && pearl.conteudo && (
          <blockquote className="text-sm text-museum-muted italic border-l-2 border-museum-accent/30 pl-3 leading-relaxed line-clamp-3">
            "{pearl.conteudo}"
          </blockquote>
        )}

        {/* Preview para imagem com arquivo */}
        {pearl.tipo === 'imagem' && pearl.arquivo && (
          <div className="rounded-lg overflow-hidden bg-museum-surface aspect-video flex items-center justify-center">
            <img
              src={pearl.arquivo}
              alt={pearl.titulo}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )}

        {/* Placeholder visual para imagem sem arquivo */}
        {pearl.tipo === 'imagem' && !pearl.arquivo && (
          <div className="rounded-lg bg-museum-surface aspect-video flex items-center justify-center text-museum-muted/30 text-3xl">
            🖼️
          </div>
        )}

        {/* Placeholder para áudio */}
        {pearl.tipo === 'audio' && (
          <div className="rounded-lg bg-museum-surface p-3 flex items-center gap-3 mt-2">
            <div className="w-8 h-8 rounded-full bg-purple-400/10 border border-purple-400/20 flex items-center justify-center text-purple-400 text-xs">▶</div>
            <div className="flex-1 space-y-1.5">
              <div className="h-1 rounded-full bg-museum-border overflow-hidden">
                <div className="h-full w-1/3 bg-purple-400/40 rounded-full" />
              </div>
              <div className="h-1 rounded-full bg-museum-border overflow-hidden">
                <div className="h-full w-2/3 bg-purple-400/20 rounded-full" />
              </div>
            </div>
          </div>
        )}

        {/* Placeholder para vídeo */}
        {pearl.tipo === 'video' && (
          <div className="rounded-lg bg-museum-surface aspect-video flex items-center justify-center mt-2">
            {pearl.thumbnail ? (
              <img src={pearl.thumbnail} alt={pearl.titulo} className="w-full h-full object-cover rounded-lg" />
            ) : (
              <div className="text-museum-muted/30 text-4xl">🎬</div>
            )}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-black/50 border border-white/20 flex items-center justify-center text-white text-sm">▶</div>
            </div>
          </div>
        )}

        {/* Tags */}
        {pearl.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {pearl.tags.slice(0, 3).map(tag => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 rounded-full bg-museum-surface border border-museum-border text-museum-muted"
              >
                #{tag}
              </span>
            ))}
            {pearl.tags.length > 3 && (
              <span className="text-xs text-museum-muted/60">+{pearl.tags.length - 3}</span>
            )}
          </div>
        )}
      </div>
    </article>
  )
}

/** Avatar circular com inicial do nome */
function Avatar({ name }) {
  const initial = name?.[0]?.toUpperCase() || '?'
  // Gera cor determinística a partir do nome
  const hue = (name || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360
  return (
    <div
      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
      style={{ backgroundColor: `hsl(${hue}, 60%, 40%)` }}
    >
      {initial}
    </div>
  )
}
