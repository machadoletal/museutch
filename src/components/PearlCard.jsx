import MediaRenderer from './MediaRenderer'

const TIPO_CONFIG = {
  texto:  { icon: '✍️', label: 'Texto',    color: 'text-blue-400',   bg: 'bg-blue-400/10',   border: 'border-blue-400/20'   },
  imagem: { icon: '🖼️', label: 'Imagem',   color: 'text-green-400',  bg: 'bg-green-400/10',  border: 'border-green-400/20'  },
  audio:  { icon: '🎵', label: 'Áudio',    color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20' },
  video:  { icon: '🎬', label: 'Vídeo',    color: 'text-red-400',    bg: 'bg-red-400/10',    border: 'border-red-400/20'    },
  mixed:  { icon: '🎭', label: 'Sequência', color: 'text-pearl-400',  bg: 'bg-pearl-400/10',  border: 'border-pearl-400/20'  },
}

/** Formata "dd/mm/yyyy" ou "yyyy-mm-dd" → "14 jun 2021" */
function formatDate(str) {
  if (!str) return ''
  const months = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez']
  let d, m, y
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    ;[y, m, d] = str.split('-')
  } else {
    ;[d, m, y] = str.split('/')
  }
  return `${parseInt(d)} ${months[parseInt(m) - 1]} ${y}`
}

/** Avatar circular com inicial do nome */
function Avatar({ name, size = 'sm' }) {
  const initial = name?.[0]?.toUpperCase() || '?'
  const hue = (name || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 360
  const sz = size === 'sm' ? 'w-5 h-5 text-xs' : 'w-6 h-6 text-sm'
  return (
    <div
      className={`${sz} rounded-full flex items-center justify-center font-bold text-white shrink-0`}
      style={{ backgroundColor: `hsl(${hue}, 55%, 38%)` }}
    >
      {initial}
    </div>
  )
}

/**
 * PearlCard — representa uma entrada do museu.
 * Pode ser uma entrada simples (1 item) ou uma sequência (N itens).
 * onClick → abre o SequenceModal.
 */
export default function PearlCard({ group, onClick }) {
  const { items, isSequence, pessoas, tipos, data, tipo } = group

  // Badge de tipo: "mixed" se sequência com tipos variados
  const tipoKey = isSequence && tipos.length > 1 ? 'mixed' : tipo
  const tipoCfg = TIPO_CONFIG[tipoKey] || TIPO_CONFIG.texto

  // Item principal para preview: destaque marcado na planilha, ou o primeiro item
  const mainItem = group.destaqueItem ?? items[0]

  return (
    <article
      onClick={() => onClick(group)}
      className="
        relative group cursor-pointer rounded-xl border border-museum-border
        bg-museum-card overflow-hidden
        transition-all duration-300
        hover:border-museum-accent/40 hover:shadow-lg hover:shadow-black/40
        hover:-translate-y-0.5 animate-slide-up
      "
    >
      {/* Linha de destaque no hover */}
      <div className="h-0.5 bg-gradient-to-r from-museum-accent/0 via-museum-accent to-museum-accent/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="p-5">
        {/* Linha 1: data + badge de tipo */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <time className="text-xs text-museum-muted font-mono">{formatDate(data)}</time>
          <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border shrink-0 ${tipoCfg.bg} ${tipoCfg.color} ${tipoCfg.border}`}>
            {tipoCfg.icon} {tipoCfg.label}
          </span>
        </div>

        {/* Pessoas */}
        <div className="flex items-center gap-1.5 flex-wrap mb-3">
          {pessoas.slice(0, 3).map(p => (
            <div key={p} className="flex items-center gap-1">
              <Avatar name={p} />
              <span className="text-xs font-medium text-museum-accent">{p}</span>
            </div>
          ))}
          {pessoas.length > 3 && (
            <span className="text-xs text-museum-muted">+{pessoas.length - 3}</span>
          )}
        </div>

        {/* Preview do conteúdo principal */}
        <MediaRenderer item={mainItem} compact />

        {/* Indicador de sequência */}
        {isSequence && (
          <div className="mt-3 flex items-center gap-1.5 text-xs text-museum-muted border-t border-museum-border pt-3">
            <span className="text-museum-accent">▸</span>
            <span>{group.itemCount} mensagens — clique para ver a sequência</span>
          </div>
        )}
      </div>
    </article>
  )
}
