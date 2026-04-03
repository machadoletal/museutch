import { useState } from 'react'
import Header from './components/Header'
import FilterBar from './components/FilterBar'
import PearlCard from './components/PearlCard'
import SequenceModal from './components/SequenceModal'
import EmptyState from './components/EmptyState'
import { usePearls } from './hooks/usePearls'

export default function App() {
  const [selectedGroup, setSelectedGroup] = useState(null)

  const {
    groups, loading, error,
    pessoas, anos, tipos,
    search,       setSearch,
    filterPessoa, setFilterPessoa,
    filterAno,    setFilterAno,
    filterTipo,   setFilterTipo,
    resetFilters, hasActiveFilters,
    totalCount,
  } = usePearls()

  return (
    <div className="min-h-screen bg-museum-bg text-museum-text scrollbar-museum">
      <Header totalCount={totalCount} />

      <FilterBar
        search={search}             setSearch={setSearch}
        filterPessoa={filterPessoa} setFilterPessoa={setFilterPessoa} pessoas={pessoas}
        filterAno={filterAno}       setFilterAno={setFilterAno}       anos={anos}
        filterTipo={filterTipo}     setFilterTipo={setFilterTipo}     tipos={tipos}
        resetFilters={resetFilters} hasActiveFilters={hasActiveFilters}
        resultCount={groups.length}
      />

      <main className="max-w-5xl mx-auto px-4 py-8">
        {loading && <LoadingGrid />}

        {!loading && (error || groups.length === 0) && (
          <EmptyState hasFilters={hasActiveFilters} onReset={resetFilters} error={error} />
        )}

        {!loading && !error && groups.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map(group => (
              <PearlCard
                key={group.grupo_id}
                group={group}
                onClick={setSelectedGroup}
              />
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-museum-border mt-16 py-8 text-center text-xs text-museum-muted/30">
        Museu TCH &bull; Arquivo Afetivo &bull; Desde 2020
      </footer>

      {selectedGroup && (
        <SequenceModal
          group={selectedGroup}
          onClose={() => setSelectedGroup(null)}
        />
      )}
    </div>
  )
}

function LoadingGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-museum-border bg-museum-card p-5 space-y-3 animate-pulse">
          <div className="shimmer h-3 w-24 rounded" />
          <div className="shimmer h-4 w-32 rounded" />
          <div className="shimmer h-14 w-full rounded" />
        </div>
      ))}
    </div>
  )
}
