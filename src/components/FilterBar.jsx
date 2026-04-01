import { Search, X, ArrowUpDown } from 'lucide-react'

const TIPO_LABELS = {
  Todos:  'Todos os tipos',
  texto:  '✍️ Texto',
  imagem: '🖼️ Imagem',
  audio:  '🎵 Áudio',
  video:  '🎬 Vídeo',
}

/**
 * FilterBar — Barra de filtros e busca
 */
export default function FilterBar({
  search, setSearch,
  filterPessoa, setFilterPessoa, pessoas,
  filterAno, setFilterAno, anos,
  filterTipo, setFilterTipo, tipos,
  sortOrder, setSortOrder,
  resetFilters, hasActiveFilters,
  resultCount,
}) {
  return (
    <div className="sticky top-0 z-20 bg-museum-bg/95 backdrop-blur border-b border-museum-border">
      <div className="max-w-5xl mx-auto px-4 py-3 space-y-3">

        {/* Linha 1: busca + ordenação */}
        <div className="flex gap-2">
          {/* Campo de busca */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-museum-muted pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar pérola, pessoa, tag..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-museum-surface border border-museum-border rounded-lg text-museum-text placeholder:text-museum-muted/50 focus:outline-none focus:border-museum-accent/50 focus:ring-1 focus:ring-museum-accent/20 transition"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-museum-muted hover:text-museum-text transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Botão de ordenação */}
          <button
            onClick={() => setSortOrder(o => o === 'desc' ? 'asc' : 'desc')}
            title={sortOrder === 'desc' ? 'Mais recente primeiro' : 'Mais antigo primeiro'}
            className="flex items-center gap-1.5 px-3 py-2 text-xs text-museum-muted border border-museum-border rounded-lg bg-museum-surface hover:text-museum-accent hover:border-museum-accent/40 transition whitespace-nowrap"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {sortOrder === 'desc' ? 'Mais recente' : 'Mais antigo'}
            </span>
          </button>
        </div>

        {/* Linha 2: filtros dropdown */}
        <div className="flex flex-wrap gap-2 items-center">
          <Select
            value={filterPessoa}
            onChange={setFilterPessoa}
            options={pessoas}
            placeholder="Pessoa"
          />
          <Select
            value={filterAno}
            onChange={setFilterAno}
            options={anos.map(a => String(a))}
            placeholder="Ano"
          />
          <Select
            value={filterTipo}
            onChange={setFilterTipo}
            options={tipos}
            placeholder="Tipo"
            labelMap={TIPO_LABELS}
          />

          {/* Contador de resultados + limpar */}
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-museum-muted">
              {resultCount} resultado{resultCount !== 1 ? 's' : ''}
            </span>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-xs text-museum-accent hover:underline flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Limpar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Select({ value, onChange, options, placeholder, labelMap = {} }) {
  const isActive = value !== 'Todos'
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className={`
        text-xs px-3 py-2 rounded-lg border bg-museum-surface cursor-pointer
        focus:outline-none focus:ring-1 focus:ring-museum-accent/20 transition
        ${isActive
          ? 'border-museum-accent/60 text-museum-accent'
          : 'border-museum-border text-museum-muted hover:border-museum-border/80 hover:text-museum-text'
        }
      `}
    >
      <option value="Todos">{placeholder}: Todos</option>
      {options.filter(o => o !== 'Todos').map(o => (
        <option key={o} value={o}>
          {labelMap[o] || o}
        </option>
      ))}
    </select>
  )
}
