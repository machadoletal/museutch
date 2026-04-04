import { useState, useMemo } from 'react'
import { usePearls } from '../hooks/usePearls'
import { calcRanking, getAvailableYears, calcSummary } from '../utils/calcRanking'

const MEDALS = { 1: '🥇', 2: '🥈', 3: '🥉' }

/** Cor determinística por nome */
function personColor(name) {
  const hue = (name || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 360
  return `hsl(${hue}, 55%, 42%)`
}

/** Avatar circular */
function Avatar({ name }) {
  const initial = name?.[0]?.toUpperCase() || '?'
  return (
    <div
      className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
      style={{ backgroundColor: personColor(name) }}
    >
      {initial}
    </div>
  )
}

export default function Ranking() {
  const { groups, loading, error } = usePearls()
  const [selectedYear, setSelectedYear] = useState('Todos')

  const years      = useMemo(() => getAvailableYears(groups), [groups])
  const ranking    = useMemo(() => calcRanking(groups, selectedYear), [groups, selectedYear])
  const summary    = useMemo(() => calcSummary(ranking, selectedYear), [ranking, selectedYear])

  return (
    <div className="min-h-screen bg-museum-bg text-museum-text flex flex-col">
      {/* Cabeçalho da página */}
      <div className="border-b border-museum-border">
        <div className="max-w-2xl mx-auto px-4 py-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="h-px flex-1 max-w-[60px] bg-gradient-to-r from-transparent to-museum-accent/40" />
            <span className="text-xl select-none">🏆</span>
            <div className="h-px flex-1 max-w-[60px] bg-gradient-to-l from-transparent to-museum-accent/40" />
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-museum-text">
            Ranking do <span className="text-museum-accent italic">Museu TCH</span>
          </h1>
          <p className="mt-2 text-museum-muted text-sm">
            Quem mais contribuiu para o acervo do grupo.
          </p>
        </div>
      </div>

      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-8 space-y-6">
        {loading && <LoadingSkeleton />}
        {error   && <p className="text-center text-red-400 text-sm">{error}</p>}

        {!loading && !error && (
          <>
            {/* Filtro de ano */}
            <div className="flex flex-wrap gap-2 justify-center">
              {['Todos', ...years].map(y => (
                <button
                  key={y}
                  onClick={() => setSelectedYear(y)}
                  className={`
                    px-4 py-1.5 rounded-full text-xs font-medium border transition-all duration-150
                    ${selectedYear === y
                      ? 'bg-museum-accent text-white border-museum-accent shadow-md shadow-museum-accent/20'
                      : 'text-museum-muted border-museum-border hover:border-museum-accent/40 hover:text-museum-text'
                    }
                  `}
                >
                  {y === 'Todos' ? 'Todos os anos' : y}
                </button>
              ))}
            </div>

            {/* Cards de resumo */}
            <div className="grid grid-cols-3 gap-3">
              <SummaryCard
                label="Pérolas"
                value={summary.totalPerolas}
                icon="💎"
              />
              <SummaryCard
                label="Pessoas"
                value={summary.totalPessoas}
                icon="👥"
              />
              <SummaryCard
                label="Líder"
                value={summary.lider}
                sub={`${summary.liderCount} pérola${summary.liderCount !== 1 ? 's' : ''}`}
                icon="🥇"
                highlight
              />
            </div>

            {/* Ranking */}
            {ranking.length === 0 ? (
              <p className="text-center text-museum-muted text-sm py-10">
                Nenhuma pérola encontrada para este recorte.
              </p>
            ) : (
              <div className="space-y-2.5">
                {ranking.map(entry => (
                  <RankingRow key={entry.pessoa} entry={entry} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function SummaryCard({ label, value, sub, icon, highlight }) {
  return (
    <div className={`
      rounded-xl border p-3 md:p-4 text-center
      ${highlight ? 'border-museum-accent/30 bg-museum-accent/5' : 'border-museum-border bg-museum-card'}
    `}>
      <div className="text-lg mb-1">{icon}</div>
      <div className={`font-serif font-bold truncate text-sm md:text-base ${highlight ? 'text-museum-accent' : 'text-museum-text'}`}>
        {value}
      </div>
      {sub && <div className="text-xs text-museum-muted mt-0.5">{sub}</div>}
      <div className="text-xs text-museum-muted/60 mt-1">{label}</div>
    </div>
  )
}

function RankingRow({ entry }) {
  const { rank, pessoa, count, pct } = entry
  const isTop3  = rank <= 3
  const medal   = MEDALS[rank]
  const color   = personColor(pessoa)

  return (
    <div className={`
      rounded-xl border p-4 transition-all duration-200
      ${isTop3
        ? 'border-museum-accent/25 bg-museum-card shadow-sm shadow-museum-accent/5'
        : 'border-museum-border bg-museum-card'
      }
    `}>
      <div className="flex items-center gap-3 mb-2.5">
        {/* Posição */}
        <div className="w-7 text-center shrink-0">
          {medal
            ? <span className="text-xl">{medal}</span>
            : <span className="text-sm font-mono text-museum-muted">{rank}</span>
          }
        </div>

        {/* Avatar + nome */}
        <Avatar name={pessoa} />
        <span className={`font-medium flex-1 ${isTop3 ? 'text-museum-text' : 'text-museum-text/80'}`}>
          {pessoa}
        </span>

        {/* Contagem */}
        <span className={`text-sm font-mono font-semibold shrink-0 ${isTop3 ? 'text-museum-accent' : 'text-museum-muted'}`}>
          {count} <span className="font-normal text-xs">pérola{count !== 1 ? 's' : ''}</span>
        </span>
      </div>

      {/* Barra de progresso */}
      <div className="ml-10 h-1.5 rounded-full bg-museum-border overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color, opacity: isTop3 ? 1 : 0.6 }}
        />
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="flex gap-2 justify-center">
        {[1,2,3,4].map(i => <div key={i} className="shimmer h-7 w-20 rounded-full" />)}
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[1,2,3].map(i => <div key={i} className="shimmer h-20 rounded-xl" />)}
      </div>
      {[1,2,3,4,5].map(i => <div key={i} className="shimmer h-16 rounded-xl" />)}
    </div>
  )
}
