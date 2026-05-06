import { useState, useEffect } from 'react'
import { fetchItems } from '../utils/dataLoader'
import { groupPearls } from '../utils/groupPearls'
import MediaRenderer from '../components/MediaRenderer'
import {
  initBracket, pickAndAdvance,
  totalMatchups, countCompletedMatchups,
} from '../utils/buildBracket'

const STORAGE_STATE = 'museutch_bracket_v3'
const STORAGE_USER  = 'museutch_usuario'
const SEND_ENDPOINT = '' // URL do Google Apps Script — configurar depois

/** Uma entrada por grupo, com todos os itens do grupo. */
function buildEntries(items) {
  const groups = groupPearls(items)
  return groups
    .map(g => ({
      grupo_id: g.grupo_id,
      data:     g.data,
      grupo:    g.grupo,
      pessoas:  g.pessoas,
      items:    g.items,
    }))
    .filter(e => e.items.length > 0)
}

// ─── IdentifyScreen ───────────────────────────────────────────────────────────

function IdentifyScreen({ onStart, error }) {
  const [name, setName] = useState(() => localStorage.getItem(STORAGE_USER) || '')

  function handleSubmit(e) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    localStorage.setItem(STORAGE_USER, trimmed)
    onStart(trimmed)
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 gap-6">
      <div className="text-center space-y-2">
        <p className="text-4xl">⚔️</p>
        <h2 className="font-serif font-bold text-museum-text text-2xl">Bracket das Pérolas</h2>
        <p className="text-museum-muted text-sm max-w-xs leading-relaxed">
          Todas as entradas do acervo, frente a frente. Escolha a que preferir em cada confronto.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-3">
        <div>
          <label className="block text-xs text-museum-muted mb-1.5 uppercase tracking-wider font-medium">
            Quem está jogando?
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Seu nome..."
            autoFocus
            className="w-full rounded-xl border border-museum-border bg-museum-card text-museum-text placeholder-museum-muted/40 px-4 py-2.5 text-sm focus:outline-none focus:border-museum-accent/60 transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={!name.trim()}
          className="w-full rounded-xl bg-museum-accent text-white py-2.5 text-sm font-medium hover:bg-museum-accent/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          Começar Torneio
        </button>
      </form>

      {error && (
        <p className="text-xs text-red-400/70 text-center">{error}</p>
      )}
    </div>
  )
}

// ─── MatchupCard ──────────────────────────────────────────────────────────────

function MatchupCard({ entry, onPick }) {
  const { items, pessoas, data } = entry
  const isSequence = items.length > 1

  return (
    <div className="flex-1 min-w-0 rounded-2xl border border-museum-border bg-museum-card p-5
      flex flex-col gap-3 overflow-y-auto">

      {/* Cabeçalho */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[10px] text-museum-muted/50 font-mono uppercase tracking-wider flex-1 truncate">
          {pessoas.join(', ')}
        </span>
        <span className="text-[10px] text-museum-muted/35 font-mono shrink-0">
          {data}
        </span>
      </div>

      {/* Todos os itens — áudio e vídeo ficam com player completo */}
      <div className="flex-1 flex flex-col gap-2.5">
        {items.map((item, i) => (
          <div key={i} className="flex flex-col gap-0.5">
            {isSequence && (
              <span className="text-[9px] text-museum-accent/50 font-mono uppercase tracking-wide">
                {(item.pessoas_item?.length ? item.pessoas_item : [item.pessoa]).join(', ')}
              </span>
            )}
            <MediaRenderer
              item={item}
              compact={item.tipo === 'imagem'}
            />
          </div>
        ))}
      </div>

      {/* Botão de voto separado do conteúdo */}
      <button
        onClick={onPick}
        className="shrink-0 w-full py-2 rounded-xl border border-museum-accent/30 text-museum-accent/70
          text-xs font-medium hover:bg-museum-accent hover:text-white hover:border-museum-accent
          active:scale-[0.98] transition-all duration-150"
      >
        Escolher esta ✦
      </button>
    </div>
  )
}

// ─── PlayingScreen ────────────────────────────────────────────────────────────

function PlayingScreen({ state, onPick }) {
  const { roundItems, matchupIndex, roundNumber, totalRounds, bracketSize } = state
  const entryA = roundItems[matchupIndex * 2]
  const entryB = roundItems[matchupIndex * 2 + 1]

  const matchupsInRound = Math.floor(roundItems.length / 2)
  const done  = countCompletedMatchups(roundNumber, matchupIndex, bracketSize)
  const total = totalMatchups(bracketSize)
  const pct   = Math.round((done / total) * 100)

  return (
    <div className="flex-1 flex flex-col min-h-0 p-4 gap-3">
      {/* Barra de progresso */}
      <div className="shrink-0 space-y-1.5">
        <div className="flex justify-between text-[10px] text-museum-muted/50 font-mono uppercase tracking-wide">
          <span>Round {roundNumber + 1}/{totalRounds} · Confronto {matchupIndex + 1}/{matchupsInRound}</span>
          <span>{pct}%</span>
        </div>
        <div className="h-1 bg-museum-border rounded-full overflow-hidden">
          <div
            className="h-full bg-museum-accent rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="shrink-0 text-center">
        <span className="text-[11px] text-museum-muted/35 font-mono uppercase tracking-widest">
          Qual você prefere?
        </span>
      </div>

      {/* Confronto */}
      <div className="flex-1 flex gap-3 min-h-0">
        <MatchupCard entry={entryA} onPick={() => onPick(entryA)} />

        <div className="shrink-0 flex items-center justify-center w-6">
          <span className="text-museum-muted/25 font-serif text-lg italic select-none">vs</span>
        </div>

        <MatchupCard entry={entryB} onPick={() => onPick(entryB)} />
      </div>
    </div>
  )
}

// ─── ChampionScreen ───────────────────────────────────────────────────────────

function ChampionScreen({ champion, usuario, onReset }) {
  const [sendStatus, setSendStatus] = useState('idle') // idle | sending | sent | error
  const isSequence = champion.items.length > 1

  async function handleSend() {
    if (!SEND_ENDPOINT) {
      setSendStatus('sent')
      return
    }
    setSendStatus('sending')
    try {
      const body = {
        usuario,
        grupo_id:  champion.grupo_id,
        campea:    champion.items
          .filter(i => i.tipo === 'texto' && i.conteudo_texto)
          .map(i => i.conteudo_texto)
          .join(' / '),
        pessoas:   champion.pessoas.join(', '),
        data:      champion.data,
        timestamp: new Date().toISOString(),
      }
      const res = await fetch(SEND_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error('Erro na resposta')
      setSendStatus('sent')
    } catch {
      setSendStatus('error')
    }
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 gap-6 text-center">
      <div className="space-y-2">
        <p className="text-4xl">🏆</p>
        <h2 className="font-serif font-bold text-museum-accent text-2xl">Campeã das Pérolas!</h2>
        {usuario && (
          <p className="text-museum-muted text-xs">
            Escolha de <span className="text-museum-text font-medium">{usuario}</span>
          </p>
        )}
      </div>

      <div className="w-full max-w-sm rounded-2xl border-2 border-museum-accent/40 bg-museum-card p-6 space-y-4">
        <div className="flex items-center gap-2 justify-center text-[10px] font-mono text-museum-muted/50">
          <span className="uppercase tracking-wider">{champion.pessoas.join(', ')}</span>
          <span className="text-museum-muted/25">·</span>
          <span>{champion.data}</span>
        </div>

        <div className="space-y-3 text-left">
          {champion.items.map((item, i) => (
            <div key={i} className="space-y-0.5">
              {isSequence && (
                <p className="text-[9px] text-museum-accent/60 font-mono uppercase tracking-wide">
                  {(item.pessoas_item?.length ? item.pessoas_item : [item.pessoa]).join(', ')}
                </p>
              )}
              <MediaRenderer item={item} compact={false} />
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center gap-2 w-full max-w-sm">
        {sendStatus === 'idle' && (
          <button
            onClick={handleSend}
            className="w-full rounded-xl bg-museum-accent text-white py-2.5 text-sm font-medium hover:bg-museum-accent/90 transition-all"
          >
            Enviar resultado
          </button>
        )}
        {sendStatus === 'sending' && (
          <button disabled className="w-full rounded-xl bg-museum-accent/60 text-white py-2.5 text-sm font-medium">
            Enviando...
          </button>
        )}
        {sendStatus === 'sent' && (
          <p className="text-xs text-green-400/80 font-medium py-1">✓ Resultado registrado!</p>
        )}
        {sendStatus === 'error' && (
          <div className="space-y-2 w-full">
            <p className="text-xs text-red-400/80">Erro ao enviar. Tente novamente.</p>
            <button
              onClick={handleSend}
              className="w-full rounded-xl bg-museum-accent text-white py-2.5 text-sm font-medium hover:bg-museum-accent/90 transition-all"
            >
              Tentar novamente
            </button>
          </div>
        )}

        <button
          onClick={onReset}
          className="w-full rounded-xl border border-museum-border text-museum-muted py-2.5 text-sm hover:text-museum-text hover:border-museum-accent/30 transition-all"
        >
          Jogar novamente
        </button>
      </div>
    </div>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function BracketDasPearls() {
  const [screen,    setScreen]    = useState('identify') // identify | loading | playing | champion
  const [usuario,   setUsuario]   = useState('')
  const [state,     setState]     = useState(null)
  const [champion,  setChampion]  = useState(null)
  const [loadError, setLoadError] = useState(null)

  // Restaurar estado salvo
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_STATE)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        const u = localStorage.getItem(STORAGE_USER) || ''
        setState(parsed)
        setUsuario(u)
        setScreen('playing')
      } catch {
        localStorage.removeItem(STORAGE_STATE)
      }
    }
  }, [])

  // Persistir estado durante o jogo
  useEffect(() => {
    if (state && screen === 'playing') {
      localStorage.setItem(STORAGE_STATE, JSON.stringify(state))
    }
  }, [state, screen])

  async function handleStart(name) {
    setUsuario(name)
    setScreen('loading')
    setLoadError(null)
    try {
      const items = await fetchItems()
      const entries = buildEntries(items)
      if (entries.length < 2) throw new Error('Entradas insuficientes para iniciar o torneio.')
      const initial = initBracket(entries)
      localStorage.removeItem(STORAGE_STATE)
      setState(initial)
      setScreen('playing')
    } catch (err) {
      setLoadError(err.message || 'Erro ao carregar o acervo.')
      setScreen('identify')
    }
  }

  function handlePick(winner) {
    const result = pickAndAdvance(state, winner)
    if (result.champion) {
      setChampion(result.champion)
      localStorage.removeItem(STORAGE_STATE)
      setScreen('champion')
    } else {
      setState(result.newState)
    }
  }

  function handleReset() {
    localStorage.removeItem(STORAGE_STATE)
    setChampion(null)
    setState(null)
    setLoadError(null)
    setScreen('identify')
  }

  return (
    <div className="min-h-screen bg-museum-bg text-museum-text flex flex-col">
      {/* Barra do topo */}
      <div className="shrink-0 px-5 py-2.5 flex items-center gap-2.5 border-b border-museum-border/30">
        <span className="text-sm">⚔️</span>
        <h1 className="font-serif font-bold text-museum-text text-sm">
          Bracket das <span className="text-museum-accent italic">Pérolas</span>
        </h1>
        {screen === 'playing' && state && (
          <button
            onClick={handleReset}
            className="ml-auto text-[10px] text-museum-muted/40 hover:text-museum-muted transition font-mono uppercase tracking-wide"
          >
            reiniciar
          </button>
        )}
      </div>

      {screen === 'identify' && <IdentifyScreen onStart={handleStart} error={loadError} />}

      {screen === 'loading' && (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full border-2 border-museum-accent border-t-transparent animate-spin" />
        </div>
      )}

      {screen === 'playing' && state && (
        <PlayingScreen state={state} onPick={handlePick} />
      )}

      {screen === 'champion' && champion && (
        <ChampionScreen champion={champion} usuario={usuario} onReset={handleReset} />
      )}
    </div>
  )
}
