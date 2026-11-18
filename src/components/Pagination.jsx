import { ChevronLeft, ChevronRight } from 'lucide-react'

/** Páginas a exibir: sempre a primeira, a última e a vizinhança da atual (com reticências). */
function pageList(current, total) {
  const pages = new Set([1, total, current - 1, current, current + 1])
  const sorted = [...pages].filter(p => p >= 1 && p <= total).sort((a, b) => a - b)
  const out = []
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push('…' + p)
    out.push(p)
  })
  return out
}

const btn =
  'min-w-9 h-9 px-2 rounded-full text-xs font-medium border transition-colors flex items-center justify-center'

export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null
  return (
    <nav aria-label="Paginação" className="mt-10 flex items-center justify-center gap-1.5 flex-wrap">
      <button
        className={`${btn} border-museum-border text-museum-muted hover:border-museum-accent/40 hover:text-museum-text disabled:opacity-30 disabled:pointer-events-none`}
        onClick={() => onChange(page - 1)} disabled={page === 1} aria-label="Página anterior"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {pageList(page, totalPages).map(p =>
        typeof p === 'string' ? (
          <span key={p} className="px-1 text-museum-muted/50 text-xs select-none">…</span>
        ) : (
          <button
            key={p} onClick={() => onChange(p)} aria-current={p === page ? 'page' : undefined}
            className={`${btn} ${p === page
              ? 'bg-museum-accent border-museum-accent text-white shadow-md shadow-museum-accent/20'
              : 'border-museum-border text-museum-muted hover:border-museum-accent/40 hover:text-museum-text'}`}
          >
            {p}
          </button>
        )
      )}

      <button
        className={`${btn} border-museum-border text-museum-muted hover:border-museum-accent/40 hover:text-museum-text disabled:opacity-30 disabled:pointer-events-none`}
        onClick={() => onChange(page + 1)} disabled={page === totalPages} aria-label="Próxima página"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </nav>
  )
}
