import { useState, useEffect } from 'react'
import Header from './components/Header'
import TopNav from './components/TopNav'
import FilterBar from './components/FilterBar'
import PearlCard from './components/PearlCard'
import SequenceModal from './components/SequenceModal'
import EmptyState from './components/EmptyState'
import Pagination from './components/Pagination'
import ConversationCard from './components/ConversationCard'
import { LayoutGrid, MessagesSquare } from 'lucide-react'
import JogoDosConjuges from './pages/JogoDosConjuges'
import Ranking from './pages/Ranking'
import HallDaFama from './pages/HallDaFama'
import BracketDasPearls from './pages/BracketDasPearls'
import AmigoSecreto from './pages/AmigoSecreto'
import { usePearls } from './hooks/usePearls'

// Itens por página em cada modo de visualização
const PAGE_SIZE = { grade: 12, conversa: 10 }

function loadView() {
  try {
    const v = localStorage.getItem('museu-view')
    return v === 'conversa' ? 'conversa' : 'grade'
  } catch { return 'grade' }
}

export default function App() {
  const [page, setPage] = useState('home')
  const [selectedGroup, setSelectedGroup] = useState(null)

  const {
    groups, loading, error,
    pessoas, anos, grupos, tipos,
    search,       setSearch,
    filterPessoa, setFilterPessoa,
    filterAno,    setFilterAno,
    filterTipo,   setFilterTipo,
    filterGrupo,  setFilterGrupo,
    sortOrder,    setSortOrder,
    resetFilters, hasActiveFilters,
    totalCount, allGroups,
  } = usePearls()

  // Paginação. A página volta para 1 sozinha quando busca/filtros/ordem mudam
  // (comparando a "assinatura" dos filtros, sem precisar de efeito).
  const [view, setViewState] = useState(loadView)
  const pageSize = PAGE_SIZE[view]
  const filterSig = [search, filterPessoa, filterAno, filterTipo, filterGrupo, sortOrder, view].join('|')
  const [pageState, setPageState] = useState({ page: 1, sig: filterSig })
  const totalPages = Math.max(1, Math.ceil(groups.length / pageSize))
  const pagina = Math.min(pageState.sig === filterSig ? pageState.page : 1, totalPages)
  const pageGroups = groups.slice((pagina - 1) * pageSize, pagina * pageSize)

  function setView(v) {
    setViewState(v)
    try { localStorage.setItem('museu-view', v) } catch { /* sem localStorage: segue sem lembrar */ }
  }

  function goToPage(p) {
    setPageState({ page: p, sig: filterSig })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Deep-linking: #grupo_id abre a pérola correspondente
  function currentHashId() {
    return window.location.hash.replace(/^#/, '').trim()
  }

  // Abre a pérola do hash quando os dados carregam ou o hash muda (voltar/avançar)
  useEffect(() => {
    if (!allGroups.length) return
    function syncFromHash() {
      const id = currentHashId()
      if (!id) { setSelectedGroup(null); return }
      const found = allGroups.find(g => g.grupo_id === id)
      if (found) {
        setPage('home')
        setSelectedGroup(found)
      }
    }
    syncFromHash()
    window.addEventListener('hashchange', syncFromHash)
    return () => window.removeEventListener('hashchange', syncFromHash)
  }, [allGroups])

  // Mantém o hash em sincronia com a pérola aberta
  useEffect(() => {
    const id = selectedGroup?.grupo_id ?? ''
    if (id && currentHashId() !== id) {
      window.history.replaceState(null, '', `#${id}`)
    } else if (!id && currentHashId()) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search)
    }
  }, [selectedGroup])

  return (
    <div className="min-h-screen bg-museum-bg text-museum-text scrollbar-museum">
      <TopNav page={page} onNavigate={setPage} />

      {page === 'home' && (
        <>
          <Header totalCount={totalCount} />

          <FilterBar
            search={search}             setSearch={setSearch}
            filterPessoa={filterPessoa} setFilterPessoa={setFilterPessoa} pessoas={pessoas}
            filterAno={filterAno}       setFilterAno={setFilterAno}       anos={anos}
            filterTipo={filterTipo}     setFilterTipo={setFilterTipo}     tipos={tipos}
            filterGrupo={filterGrupo}   setFilterGrupo={setFilterGrupo}   grupos={grupos}
            sortOrder={sortOrder}       setSortOrder={setSortOrder}
            resetFilters={resetFilters} hasActiveFilters={hasActiveFilters}
            resultCount={groups.length}
          />

          <main className="max-w-5xl mx-auto px-4 py-8">
            {loading && <LoadingGrid />}

            {!loading && (error || groups.length === 0) && (
              <EmptyState hasFilters={hasActiveFilters} onReset={resetFilters} error={error} />
            )}

            {!loading && !error && groups.length > 0 && (
              <>
                <ViewToggle view={view} onChange={setView} />
                {view === 'grade' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pageGroups.map(group => (
                      <PearlCard
                        key={group.grupo_id}
                        group={group}
                        onClick={setSelectedGroup}
                      />
                    ))}
                  </div>
                ) : (
                  // Duas colunas balanceadas pelo próprio navegador (CSS columns): cada entrada
                  // fica inteira numa coluna e as colunas se ajustam para ter altura parecida.
                  <div className="columns-1 lg:columns-2 gap-5">
                    {pageGroups.map(group => (
                      <div key={group.grupo_id} className="break-inside-avoid mb-5">
                        <ConversationCard group={group} />
                      </div>
                    ))}
                  </div>
                )}
                <Pagination page={pagina} totalPages={totalPages} onChange={goToPage} />
              </>
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
        </>
      )}

      {page === 'jogo'    && <JogoDosConjuges />}
      {page === 'ranking' && <Ranking />}
      {page === 'hall'    && <HallDaFama />}
      {page === 'bracket' && <BracketDasPearls />}
      {page === 'amigo'   && <AmigoSecreto />}
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

function ViewToggle({ view, onChange }) {
  const opts = [
    { key: 'grade',    label: 'Grade',    Icon: LayoutGrid },
    { key: 'conversa', label: 'Conversa', Icon: MessagesSquare },
  ]
  return (
    <div className="mb-5 flex justify-end">
      <div className="inline-flex rounded-full border border-museum-border p-0.5 bg-museum-surface" role="group" aria-label="Modo de visualização">
        {opts.map(opt => {
          const { key, label } = opt
          const Icon = opt.Icon
          return (
          <button
            key={key}
            onClick={() => onChange(key)}
            aria-pressed={view === key}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              view === key ? 'bg-museum-accent text-white shadow-md shadow-museum-accent/20' : 'text-museum-muted hover:text-museum-text'
            }`}
          >
            <Icon className="w-3.5 h-3.5" /> {label}
          </button>
          )
        })}
      </div>
    </div>
  )
}
