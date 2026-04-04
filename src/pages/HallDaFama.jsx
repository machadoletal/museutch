import { useState, useMemo } from 'react'
import { usePearls } from '../hooks/usePearls'
import { getAllPersons, calcPerfil } from '../utils/calcPerfil'
import { calcAllFifaStats, ARCHETYPE_LABEL } from '../utils/calcFifaStats'
import { calcWordFreq } from '../utils/wordCloud'
import MediaRenderer from '../components/MediaRenderer'
import FifaCard from '../components/FifaCard'

// Paleta de cores para word cloud
const WORD_COLORS = [
  '#d4802a','#e8a84e','#c06620',
  '#7c9fff','#5b7fde',
  '#9b7fe8','#c084fc',
  '#4ade80','#6ee7b7',
  '#f87171','#fb923c',
]

const FONT_SIZES = ['text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl']

const MEDALS = { 1: '🥇', 2: '🥈', 3: '🥉' }

function personColor(name) {
  const hue = (name || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 360
  return `hsl(${hue}, 55%, 42%)`
}

function Avatar({ name, size = 'md' }) {
  const sizes = { sm: 'w-8 h-8 text-sm', md: 'w-10 h-10 text-base', lg: 'w-16 h-16 text-2xl', xl: 'w-20 h-20 text-3xl' }
  return (
    <div
      className={`${sizes[size]} rounded-full flex items-center justify-center font-bold text-white shrink-0`}
      style={{ backgroundColor: personColor(name) }}
    >
      {name?.[0]?.toUpperCase() || '?'}
    </div>
  )
}

// ─── Componentes do Perfil ────────────────────────────────────────────────────

function StatCard({ label, value, accent }) {
  return (
    <div className={`rounded-xl border p-4 ${accent ? 'border-museum-accent/30 bg-museum-accent/5' : 'border-museum-border bg-museum-surface'}`}>
      <div className={`font-bold text-lg truncate ${accent ? 'text-museum-accent' : 'text-museum-text'}`}>{value}</div>
      <div className="text-xs text-museum-muted/60 mt-1">{label}</div>
    </div>
  )
}

function FifaStatBar({ label, value, color }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-mono text-museum-muted w-10 shrink-0 text-right">{label}</span>
      <div className="flex-1 h-4 bg-museum-border/40 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full flex items-center justify-end pr-2 transition-all duration-700"
          style={{ width: `${value}%`, backgroundColor: color, minWidth: '2rem' }}
        >
          <span className="text-[10px] font-bold text-white">{value}</span>
        </div>
      </div>
    </div>
  )
}

function WordCloudView({ items }) {
  const words = useMemo(() => calcWordFreq(items), [items])
  if (words.length === 0) return null

  return (
    <section>
      <SectionTitle icon="💬" title="Nuvem de palavras" />
      <div className="rounded-xl border border-museum-border bg-museum-surface p-5 flex flex-wrap gap-x-3 gap-y-2 justify-center items-center min-h-[100px]">
        {words.map(({ word, size }, idx) => (
          <span
            key={word}
            className={`${FONT_SIZES[size - 1]} font-medium leading-tight cursor-default select-none transition-opacity hover:opacity-80`}
            style={{ color: WORD_COLORS[idx % WORD_COLORS.length] }}
          >
            {word}
          </span>
        ))}
      </div>
    </section>
  )
}

function YearChart({ distribuicao }) {
  if (distribuicao.length === 0) return null
  const maxCount = Math.max(...distribuicao.map(d => d.count))

  return (
    <section>
      <SectionTitle icon="📅" title="Pérolas por ano" />
      <div className="rounded-xl border border-museum-border bg-museum-surface p-5 space-y-3">
        {distribuicao.map(({ ano, count }) => (
          <div key={ano} className="flex items-center gap-3">
            <span className="text-xs font-mono text-museum-muted w-10 shrink-0 text-right">{ano}</span>
            <div className="flex-1 h-5 bg-museum-border/40 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full flex items-center justify-end pr-2 transition-all duration-700"
                style={{ width: `${Math.round((count / maxCount) * 100)}%`, backgroundColor: '#d4802a', minWidth: '2rem' }}
              >
                <span className="text-[10px] font-bold text-white">{count}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function PrimeiroRegistro({ item, dataFormatada }) {
  if (!item) return null
  return (
    <section>
      <SectionTitle icon="📜" title="Primeiro registro" />
      <div className="rounded-xl border border-museum-border bg-museum-surface p-4 space-y-2">
        {dataFormatada && dataFormatada !== '—' && (
          <p className="text-xs text-museum-muted font-mono">{dataFormatada}</p>
        )}
        <MediaRenderer item={item} compact={false} />
      </div>
    </section>
  )
}

function SectionTitle({ icon, title }) {
  return (
    <h3 className="flex items-center gap-2 text-sm font-medium text-museum-muted uppercase tracking-wider mb-3">
      <span>{icon}</span>{title}
    </h3>
  )
}

// Cores para as barras de atributo FIFA por tier
const STAT_BAR_COLORS = {
  icon:   '#f0c840',
  gold:   '#d4802a',
  silver: '#7a9ab8',
  bronze: '#b87848',
}

function PersonProfile({ groups, pessoa, rank, overall, archetype, tier, stats, onBack }) {
  const perfil = useMemo(() => calcPerfil(groups, pessoa), [groups, pessoa])
  if (!perfil) return <p className="text-center text-museum-muted py-20">Perfil não encontrado.</p>

  const barColor = STAT_BAR_COLORS[tier] || '#d4802a'

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      {/* Botão voltar */}
      <button
        onClick={onBack}
        className="text-xs text-museum-muted hover:text-museum-accent transition flex items-center gap-1.5"
      >
        ← Hall da Fama
      </button>

      {/* Cabeçalho do perfil */}
      <div className="rounded-2xl border border-museum-border bg-museum-card p-6 flex flex-col sm:flex-row items-center sm:items-start gap-5">
        <Avatar name={pessoa} size="xl" />
        <div className="text-center sm:text-left flex-1">
          <div className="flex items-center justify-center sm:justify-start gap-2 mb-1 flex-wrap">
            {rank <= 3 && <span className="text-2xl">{MEDALS[rank]}</span>}
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-museum-text">{pessoa}</h2>
          </div>
          <div className="flex items-center justify-center sm:justify-start gap-2 mt-1 flex-wrap">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold"
              style={{ backgroundColor: `${STAT_BAR_COLORS[tier]}22`, color: STAT_BAR_COLORS[tier], border: `1px solid ${STAT_BAR_COLORS[tier]}55` }}
            >
              <span className="text-base leading-none">{overall}</span>
              <span className="opacity-70">·</span>
              <span>{archetype}</span>
              <span className="opacity-60 font-normal">— {ARCHETYPE_LABEL[archetype]}</span>
            </span>
          </div>
          <p className="text-xs text-museum-muted mt-2">
            {perfil.total} pérola{perfil.total !== 1 ? 's' : ''} &bull; #{rank} no ranking
          </p>
        </div>
      </div>

      {/* Atributos FIFA */}
      {stats && (
        <section>
          <SectionTitle icon="🎮" title="Atributos" />
          <div className="rounded-xl border border-museum-border bg-museum-surface p-5 space-y-3">
            {Object.entries(stats).map(([key, val]) => (
              <FifaStatBar key={key} label={key.toUpperCase()} value={val} color={barColor} />
            ))}
          </div>
        </section>
      )}

      {/* Grid de estatísticas */}
      <section>
        <SectionTitle icon="📊" title="Estatísticas" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="% do acervo"    value={`${perfil.participacao}%`} accent />
          <StatCard label="Anos no acervo" value={perfil.anosAtivos}               />
          <StatCard label="Tipo favorito"  value={perfil.tipoFrequente}             />
          <StatCard label="Ano mais ativo" value={perfil.anoMaisAtivo}              />
        </div>
      </section>

      {/* Primeiro registro */}
      <PrimeiroRegistro item={perfil.primeiroItem} dataFormatada={perfil.primeiro} />

      {/* Word cloud */}
      <WordCloudView items={perfil.items} />

      {/* Gráfico por ano */}
      <YearChart distribuicao={perfil.distribuicao} />
    </div>
  )
}

// ─── Página principal ────────────────────────────────────────────────────────

export default function HallDaFama() {
  const { groups, loading, error } = usePearls()
  const [selected, setSelected] = useState(null)

  const persons = useMemo(() => getAllPersons(groups), [groups])
  const fifaPersons = useMemo(
    () => (groups.length > 0 ? calcAllFifaStats(groups, persons) : []),
    [groups, persons],
  )

  return (
    <div className="min-h-screen bg-museum-bg text-museum-text flex flex-col">
      {!selected && (
        <>
          {/* Cabeçalho */}
          <div className="border-b border-museum-border">
            <div className="max-w-4xl mx-auto px-4 py-8 text-center">
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="h-px flex-1 max-w-[60px] bg-gradient-to-r from-transparent to-museum-accent/40" />
                <span className="text-xl">🌟</span>
                <div className="h-px flex-1 max-w-[60px] bg-gradient-to-l from-transparent to-museum-accent/40" />
              </div>
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-museum-text">
                Hall da <span className="text-museum-accent italic">Fama</span>
              </h1>
              <p className="mt-2 text-museum-muted text-sm">
                Clique em um card para ver o perfil completo.
              </p>
            </div>
          </div>

          {/* Grid de cards */}
          <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
            {loading && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="shimmer rounded-2xl" style={{ aspectRatio: '5 / 7' }} />
                ))}
              </div>
            )}

            {error && <p className="text-center text-red-400 text-sm">{error}</p>}

            {!loading && !error && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {fifaPersons.map(entry => (
                  <FifaCard
                    key={entry.pessoa}
                    entry={entry}
                    onClick={setSelected}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {selected && (
        <PersonProfile
          groups={groups}
          pessoa={selected.pessoa}
          rank={selected.rank}
          overall={selected.overall}
          archetype={selected.archetype}
          tier={selected.tier}
          stats={selected.stats}
          onBack={() => setSelected(null)}
        />
      )}
    </div>
  )
}
