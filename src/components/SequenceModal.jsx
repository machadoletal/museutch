import { useEffect, useState } from 'react'
import { X, Calendar, Link2, Check } from 'lucide-react'
import MediaRenderer from './MediaRenderer'

/** Formata data para exibição completa */
function formatDate(str) {
  if (!str) return ''
  const months = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro']
  let d, m, y
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    ;[y, m, d] = str.split('-')
  } else {
    ;[d, m, y] = str.split('/')
  }
  return `${parseInt(d)} de ${months[parseInt(m) - 1]} de ${y}`
}

/** Avatar com inicial e cor determinística */
function Avatar({ name }) {
  const initial = name?.[0]?.toUpperCase() || '?'
  const hue = (name || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 360
  return (
    <div
      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
      style={{ backgroundColor: `hsl(${hue}, 55%, 38%)` }}
    >
      {initial}
    </div>
  )
}

/**
 * SequenceModal
 *
 * Modal de detalhe para uma entrada do museu.
 * - Entrada simples: exibe o item com contexto completo.
 * - Sequência: exibe uma timeline vertical com todos os itens.
 */
export default function SequenceModal({ group, onClose }) {
  // Fecha com Escape + bloqueia scroll
  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const [copied, setCopied] = useState(false)

  if (!group) return null

  const { items, isSequence, pessoas, data, grupo, grupo_id } = group

  function copyLink() {
    const { origin, pathname } = window.location
    const url = `${origin}${pathname}#${grupo_id}`
    const done = () => { setCopied(true); setTimeout(() => setCopied(false), 2000) }
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url).then(done).catch(done)
    } else {
      const ta = document.createElement('textarea')
      ta.value = url
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      done()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="
        relative w-full max-w-xl max-h-[90vh] overflow-y-auto
        bg-museum-card border border-museum-border rounded-2xl shadow-2xl
        animate-scale-in scrollbar-museum
      ">
        {/* Barra decorativa no topo */}
        <div className="h-1 bg-gradient-to-r from-museum-accent/0 via-museum-accent to-museum-accent/0 rounded-t-2xl" />

        {/* Ações: copiar link + fechar */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
          <button
            onClick={copyLink}
            title="Copiar link desta pérola"
            className="flex items-center gap-1.5 px-2.5 py-2 rounded-full bg-museum-surface border border-museum-border text-xs text-museum-muted hover:text-museum-text hover:border-museum-accent/40 transition"
          >
            {copied
              ? <><Check className="w-3.5 h-3.5 text-museum-accent" /> Copiado</>
              : <><Link2 className="w-3.5 h-3.5" /> Link</>
            }
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-museum-surface border border-museum-border text-museum-muted hover:text-museum-text hover:border-museum-accent/40 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 md:p-8">
          {/* Cabeçalho */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-museum-muted mb-4">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatDate(data)}</span>
            {grupo && <><span className="text-museum-border">·</span><span>{grupo}</span></>}
          </div>

          {/* Pessoas do grupo */}
          <div className="flex items-center gap-2 flex-wrap mb-6">
            {pessoas.map(p => (
              <div key={p} className="flex items-center gap-1.5">
                <Avatar name={p} />
                <span className="text-sm font-medium text-museum-accent">{p}</span>
              </div>
            ))}
          </div>

          {/* Conteúdo: timeline se sequência, único se não */}
          {isSequence ? (
            <Timeline items={items} />
          ) : (
            <SingleItem item={items[0]} />
          )}

          {/* ID discreta */}
          <p className="mt-8 text-right text-xs text-museum-muted/20 font-mono">#{grupo_id}</p>
        </div>
      </div>
    </div>
  )
}

/** Renderiza item único com espaço para contexto */
function SingleItem({ item }) {
  return (
    <div className="space-y-4">
      {item.titulo && (
        <h2 className="font-serif text-xl font-bold text-museum-text">{item.titulo}</h2>
      )}
      <MediaRenderer item={item} compact={false} />
      {item.observacoes && (
        <p className="text-xs text-museum-muted italic border-l-2 border-museum-border pl-3">
          {item.observacoes}
        </p>
      )}
    </div>
  )
}

/** Timeline vertical de múltiplos itens */
function Timeline({ items }) {
  return (
    <div className="relative">
      {/* Linha vertical */}
      <div className="absolute left-3.5 top-0 bottom-0 w-px bg-museum-border" />

      <div className="space-y-6">
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1
          return (
            <div key={item.item_id || idx} className="relative flex gap-4">
              {/* Ponto na linha do tempo */}
              <div className="relative z-10 shrink-0">
                <div className={`
                  w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs
                  ${isLast
                    ? 'bg-museum-accent border-museum-accent text-white'
                    : 'bg-museum-surface border-museum-border text-museum-muted'
                  }
                `}>
                  {idx + 1}
                </div>
              </div>

              {/* Conteúdo do item */}
              <div className="flex-1 pb-2">
                {/* Pessoa(s) do item */}
                {item.pessoas_item?.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    {item.pessoas_item.map(p => (
                      <div key={p} className="flex items-center gap-1.5">
                        <Avatar name={p} />
                        <span className="text-xs font-medium text-museum-accent">{p}</span>
                      </div>
                    ))}
                  </div>
                )}
                <MediaRenderer item={item} compact={false} />
                {item.observacoes && (
                  <p className="mt-2 text-xs text-museum-muted italic">{item.observacoes}</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
