import { useState, useEffect, useCallback } from 'react'
import { usePearls } from '../hooks/usePearls'

/** Formata data para exibição */
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

/** Avatar com inicial e cor determinística */
function Avatar({ name, size = 'md' }) {
  const initial = name?.[0]?.toUpperCase() || '?'
  const hue = (name || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 360
  const sz = size === 'lg' ? 'w-14 h-14 text-2xl' : 'w-8 h-8 text-sm'
  return (
    <div
      className={`${sz} rounded-full flex items-center justify-center font-bold text-white shrink-0`}
      style={{ backgroundColor: `hsl(${hue}, 55%, 38%)` }}
    >
      {initial}
    </div>
  )
}

export default function JogoDosConjuges() {
  const { groups, loading, error } = usePearls()

  // Filtra só pérolas de texto simples (não sequências)
  const [pool, setPool] = useState([])
  const [current, setCurrent] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const [score, setScore] = useState({ acertos: 0, tentativas: 0 })

  useEffect(() => {
    if (groups.length === 0) return
    const filtered = groups.filter(g => !g.isSequence && g.tipo === 'texto' && g.items[0]?.conteudo_texto?.trim())
    setPool(filtered)
  }, [groups])

  // Sorteia uma pérola aleatória diferente da atual
  const sortear = useCallback((poolAtual = pool) => {
    if (poolAtual.length === 0) return
    let candidates = poolAtual
    if (current && poolAtual.length > 1) {
      candidates = poolAtual.filter(g => g.grupo_id !== current.grupo_id)
    }
    const idx = Math.floor(Math.random() * candidates.length)
    setCurrent(candidates[idx])
    setRevealed(false)
  }, [pool, current])

  // Sorteia automaticamente quando o pool estiver pronto
  useEffect(() => {
    if (pool.length > 0 && !current) sortear(pool)
  }, [pool])

  function revelar() {
    setRevealed(true)
    setScore(s => ({ ...s, tentativas: s.tentativas + 1 }))
  }

  function proxima() {
    sortear()
  }

  const item = current?.items[0]
  const texto = item?.conteudo_texto || ''
  const pessoa = current?.pessoa || ''

  return (
    <div className="min-h-screen bg-museum-bg text-museum-text flex flex-col">
      {/* Cabeçalho da página */}
      <div className="border-b border-museum-border">
        <div className="max-w-2xl mx-auto px-4 py-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="h-px flex-1 max-w-[60px] bg-gradient-to-r from-transparent to-museum-accent/40" />
            <span className="text-museum-accent text-lg select-none">🎲</span>
            <div className="h-px flex-1 max-w-[60px] bg-gradient-to-l from-transparent to-museum-accent/40" />
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-museum-text">
            Jogo dos <span className="text-museum-accent italic">Cônjuges</span>
          </h1>
          <p className="mt-2 text-museum-muted text-sm">
            Leia a pérola e tente adivinhar quem falou isso.
          </p>
          {score.tentativas > 0 && (
            <p className="mt-2 text-xs text-museum-muted/50 font-mono">
              {score.tentativas} pérola{score.tentativas !== 1 ? 's' : ''} revelada{score.tentativas !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>

      {/* Área do jogo */}
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-xl">
          {loading && <LoadingCard />}

          {error && (
            <div className="text-center text-red-400 text-sm">{error}</div>
          )}

          {!loading && !error && pool.length === 0 && (
            <div className="text-center text-museum-muted text-sm">
              Nenhuma pérola de texto encontrada no acervo.
            </div>
          )}

          {!loading && !error && current && (
            <div className="animate-fade-in">
              {/* Card da frase */}
              <div className="rounded-2xl border border-museum-border bg-museum-card p-8 md:p-10 shadow-2xl shadow-black/40 relative overflow-hidden">
                {/* Detalhe decorativo */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-museum-accent/0 via-museum-accent/60 to-museum-accent/0" />

                {/* Data */}
                {current.data && (
                  <p className="text-xs text-museum-muted font-mono text-center mb-6">
                    {formatDate(current.data)}
                  </p>
                )}

                {/* Frase */}
                <blockquote className="font-serif text-xl md:text-2xl italic text-museum-text leading-relaxed text-center">
                  "{texto}"
                </blockquote>

                {/* Área do autor — renderização condicional, nome nunca fica no DOM oculto */}
                <div className="mt-8 flex justify-center items-center min-h-[56px]">
                  {revealed ? (
                    <div className="flex items-center gap-3 animate-fade-in">
                      <Avatar name={pessoa} size="lg" />
                      <span className="font-serif text-2xl font-semibold text-museum-accent">
                        {pessoa}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-full border-2 border-dashed border-museum-border flex items-center justify-center text-museum-muted/30 text-xl">
                        ?
                      </div>
                      <div className="space-y-2">
                        <div className="h-4 w-28 rounded bg-museum-border/50" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Botões */}
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                {!revealed ? (
                  <button
                    onClick={revelar}
                    className="
                      flex-1 py-3 px-6 rounded-xl font-medium text-sm
                      bg-museum-accent text-white
                      hover:bg-pearl-600 active:scale-95
                      transition-all duration-150 shadow-lg shadow-museum-accent/20
                    "
                  >
                    Revelar autor
                  </button>
                ) : (
                  <div className="flex-1 py-3 px-6 rounded-xl font-medium text-sm text-center bg-museum-surface border border-museum-border text-museum-muted cursor-default">
                    ✓ Revelado
                  </div>
                )}

                <button
                  onClick={proxima}
                  className="
                    flex-1 py-3 px-6 rounded-xl font-medium text-sm
                    border border-museum-border bg-museum-surface text-museum-text
                    hover:border-museum-accent/40 hover:text-museum-accent
                    active:scale-95 transition-all duration-150
                  "
                >
                  Nova pérola →
                </button>
              </div>

              {/* Contador do pool */}
              <p className="text-center text-xs text-museum-muted/30 mt-4 font-mono">
                {pool.length} pérolas disponíveis
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function LoadingCard() {
  return (
    <div className="rounded-2xl border border-museum-border bg-museum-card p-10 space-y-4 animate-pulse">
      <div className="shimmer h-3 w-24 rounded mx-auto" />
      <div className="shimmer h-6 w-full rounded" />
      <div className="shimmer h-6 w-4/5 rounded mx-auto" />
      <div className="shimmer h-6 w-3/5 rounded mx-auto" />
      <div className="shimmer h-14 w-14 rounded-full mx-auto mt-4" />
    </div>
  )
}
