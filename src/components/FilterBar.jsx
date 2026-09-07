import { Search, X, SortAsc, SortDesc } from 'lucide-react'

const TIPO_LABELS = {
  Todos:  'Todos os tipos',
  texto:  '✍️ Texto',
  imagem: '🖼️ Imagem',
  audio:  '🎵 Áudio',
  video:  '🎬 Vídeo',
}

export default function FilterBar({
  search, setSearch,
  filterPessoa, setFilterPessoa, pessoas,
  filterAno, setFilterAno, anos,
  filterTipo, setFilterTipo, tipos,
  filterGrupo, setFilterGrupo, grupos,
  sortOrder, setSortOrder,
  resetFilters, hasActiveFilters,
  resultCount,
}) {
  return (
    <div className="sticky top-0 z-20 bg-museum-bg/95 backdrop-blur border-b border-museum-border">
      <div className="max-w-5xl mx-auto px-4 py-3 space-y-3">

        {/* Busca */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-museum-muted pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por texto, pessoa..."
            className="
              w-full pl-9 pr-9 py-2 text-sm
              bg-museum-surface border border-museum-border rounded-lg
              text-museum-text placeholder:text-museum-muted/40
              focus:outline-none focus:border-museum-accent/50 focus:ring-1 focus:ring-museum-accent/20
              transition
            "
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

        {/* Filtros + contador */}
        <div className="flex flex-wrap items-center gap-2">
          <FilterSelect value={filterPessoa} onChange={setFilterPessoa} options={pessoas}           placeholder="Pessoa" />
          <FilterSelect value={filterAno}    onChange={setFilterAno}    options={anos.map(String)}  placeholder="Ano" />
          <FilterSelect value={filterTipo}   onChange={setFilterTipo}   options={tipos}             placeholder="Tipo" labelMap={TIPO_LABELS} />
          <FilterSelect value={filterGrupo}  onChange={setFilterGrupo}  options={grupos}            placeholder="Grupo" />

          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            title={sortOrder === 'desc' ? 'Mais recentes primeiro' : 'Mais antigas primeiro'}
            className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border border-museum-border bg-museum-surface text-museum-muted hover:text-museum-text cursor-pointer focus:outline-none focus:ring-1 focus:ring-museum-accent/20 transition"
          >
            {sortOrder === 'desc'
              ? <><SortDesc className="w-3.5 h-3.5" /> Mais recentes</>
              : <><SortAsc className="w-3.5 h-3.5" /> Mais antigas</>
            }
          </button>

          <div className="ml-auto flex items-center gap-2 text-xs text-museum-muted">
            <span>{resultCount} resultado{resultCount !== 1 ? 's' : ''}</span>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 text-museum-accent hover:underline"
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

function FilterSelect({ value, onChange, options, placeholder, labelMap = {} }) {
  const active = value !== 'Todos'
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className={`
        text-xs px-3 py-2 rounded-lg border bg-museum-surface cursor-pointer
        focus:outline-none focus:ring-1 focus:ring-museum-accent/20 transition
        ${active
          ? 'border-museum-accent/60 text-museum-accent'
          : 'border-museum-border text-museum-muted hover:text-museum-text'
        }
      `}
    >
      <option value="Todos">{placeholder}: Todos</option>
      {options.filter(o => o !== 'Todos').map(o => (
        <option key={o} value={o}>{labelMap[o] || o}</option>
      ))}
    </select>
  )
}
