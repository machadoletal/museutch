import { useState } from 'react'
import Header from './components/Header'
import FilterBar from './components/FilterBar'
import PearlCard from './components/PearlCard'
import PearlModal from './components/PearlModal'
import EmptyState from './components/EmptyState'
import { usePearls } from './hooks/usePearls'

export default function App() {
  const [selectedPearl, setSelectedPearl] = useState(null)

  const {
    pearls, loading, error,
    pessoas, anos, tipos,
    search, setSearch,
    filterPessoa, setFilterPessoa,
    filterAno, setFilterAno,
    filterTipo, setFilterTipo,
    sortOrder, setSortOrder,
    resetFilters, hasActiveFilters,
    totalCount,
  } = usePearls()

  return (
    <div className="min-h-screen bg-museum-bg text-museum-text scrollbar-museum">
      {/* Cabeçalho */}
      <Header totalCount={totalCount} />

      {/* Barra de filtros */}
      <FilterBar
        search={search} setSearch={setSearch}
        filterPessoa={filterPessoa} setFilterPessoa={setFilterPessoa} pessoas={pessoas}
        filterAno={filterAno} setFilterAno={setFilterAno} anos={anos}
        filterTipo={filterTipo} setFilterTipo={setFilterTipo} tipos={tipos}
        sortOrder={sortOrder} setSortOrder={setSortOrder}
        resetFilters={resetFilters} hasActiveFilters={hasActiveFilters}
        resultCount={pearls.length}
      />

      {/* Conteúdo principal */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        {loading && <LoadingGrid />}

        {error && (
          <div className="text-center py-20 text-red-400">
            <p className="text-sm">Erro ao carregar dados: {error}</p>
          </div>
        )}

        {!loading && !error && pearls.length === 0 && (
          <EmptyState hasFilters={hasActiveFilters} onReset={resetFilters} />
        )}

        {!loading && !error && pearls.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pearls.map(pearl => (
              <PearlCard
                key={pearl.id}
                pearl={pearl}
                onClick={setSelectedPearl}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer discreto */}
      <footer className="border-t border-museum-border mt-16 py-8 text-center text-xs text-museum-muted/40">
        Museu das Pérolas &bull; Arquivo Afetivo &bull; Desde 2020
      </footer>

      {/* Modal de detalhe */}
      {selectedPearl && (
        <PearlModal
          pearl={selectedPearl}
          onClose={() => setSelectedPearl(null)}
        />
      )}
    </div>
  )
}

/** Skeleton loader para o grid */
function LoadingGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-museum-border bg-museum-card p-5 space-y-3">
          <div className="shimmer h-3 w-24 rounded" />
          <div className="shimmer h-4 w-32 rounded" />
          <div className="shimmer h-5 w-full rounded" />
          <div className="shimmer h-12 w-full rounded" />
        </div>
      ))}
    </div>
  )
}
