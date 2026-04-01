import { useEffect } from 'react'
import { X, Calendar, User, Tag, MessageSquare } from 'lucide-react'
import MediaPlayer from './MediaPlayer'

const TIPO_CONFIG = {
  texto:  { icon: '✍️', label: 'Texto'  },
  imagem: { icon: '🖼️', label: 'Imagem' },
  audio:  { icon: '🎵', label: 'Áudio'  },
  video:  { icon: '🎬', label: 'Vídeo'  },
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const [year, month, day] = dateStr.split('-')
  const months = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro']
  return `${parseInt(day)} de ${months[parseInt(month) - 1]} de ${year}`
}

/**
 * PearlModal — Visualização detalhada de uma pérola
 */
export default function PearlModal({ pearl, onClose }) {
  // Fecha com Escape
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    // Bloqueia scroll do body
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  if (!pearl) return null

  const tipo = TIPO_CONFIG[pearl.tipo] || TIPO_CONFIG.texto

  return (
    // Overlay
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Painel do modal */}
      <div className="
        relative w-full max-w-2xl max-h-[90vh] overflow-y-auto
        bg-museum-card border border-museum-border rounded-2xl shadow-2xl
        animate-scale-in scrollbar-museum
      ">
        {/* Barra de cor no topo */}
        <div className="h-1 w-full bg-gradient-to-r from-museum-accent/0 via-museum-accent to-museum-accent/0 rounded-t-2xl" />

        {/* Botão fechar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-museum-surface border border-museum-border text-museum-muted hover:text-museum-text hover:border-museum-accent/40 transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 md:p-8">
          {/* Meta: tipo + data */}
          <div className="flex flex-wrap items-center gap-2 mb-4 text-sm text-museum-muted">
            <span>{tipo.icon} {tipo.label}</span>
            <span className="text-museum-border">·</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(pearl.data)}
            </span>
            {pearl.fonte && (
              <>
                <span className="text-museum-border">·</span>
                <span>{pearl.fonte}</span>
              </>
            )}
          </div>

          {/* Pessoa */}
          <div className="flex items-center gap-2 mb-3">
            <User className="w-4 h-4 text-museum-accent" />
            <span className="text-museum-accent font-medium">{pearl.pessoa}</span>
          </div>

          {/* Título */}
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-museum-text leading-tight mb-4">
            {pearl.titulo}
          </h2>

          {/* Descrição / contexto */}
          {pearl.descricao && (
            <p className="text-museum-muted text-sm leading-relaxed mb-5 border-l-2 border-museum-border pl-3">
              {pearl.descricao}
            </p>
          )}

          {/* Conteúdo de mídia */}
          <MediaPlayer pearl={pearl} />

          {/* Tags */}
          {pearl.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-5">
              <Tag className="w-3.5 h-3.5 text-museum-muted mt-0.5" />
              {pearl.tags.map(tag => (
                <span
                  key={tag}
                  className="text-xs px-2.5 py-1 rounded-full bg-museum-surface border border-museum-border text-museum-muted"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Observações */}
          {pearl.observacoes && (
            <div className="mt-5 p-3 rounded-lg bg-museum-surface border border-museum-border flex gap-2">
              <MessageSquare className="w-4 h-4 text-museum-muted shrink-0 mt-0.5" />
              <p className="text-xs text-museum-muted italic">{pearl.observacoes}</p>
            </div>
          )}

          {/* ID discreta */}
          <p className="mt-6 text-right text-xs text-museum-muted/30 font-mono">
            #{pearl.id}
          </p>
        </div>
      </div>
    </div>
  )
}
