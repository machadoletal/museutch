import { Link2, Check } from 'lucide-react'
import { useState } from 'react'
import MediaRenderer from './MediaRenderer'

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

function hueOf(name) {
  return (name || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 360
}

/**
 * ConversationCard — mostra a entrada inteira como uma conversa:
 * todas as mensagens em balões, sem precisar abrir nada.
 * Mensagens seguidas da mesma pessoa compartilham o nome.
 */
export default function ConversationCard({ group }) {
  const { items, data, dataFim, grupo, grupo_id } = group
  const [copied, setCopied] = useState(false)

  function copyLink() {
    const { origin, pathname } = window.location
    const url = `${origin}${pathname}#${grupo_id}`
    const done = () => { setCopied(true); setTimeout(() => setCopied(false), 2000) }
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(url).then(done).catch(done)
    else done()
  }

  return (
    <article className="rounded-2xl border border-museum-border bg-museum-card overflow-hidden animate-slide-up">
      <div className="h-0.5 bg-gradient-to-r from-museum-accent/0 via-museum-accent/60 to-museum-accent/0" />

      <header className="flex items-center justify-between gap-3 px-5 pt-4 pb-3 border-b border-museum-border/60">
        <div className="text-xs text-museum-muted">
          <time className="font-mono">{formatDate(data)}{dataFim && ` – ${formatDate(dataFim)}`}</time>
          {grupo && <span> · {grupo}</span>}
        </div>
        <button
          onClick={copyLink}
          title="Copiar link desta pérola"
          className="flex items-center gap-1.5 text-xs text-museum-muted hover:text-museum-text transition"
        >
          {copied
            ? <><Check className="w-3.5 h-3.5 text-museum-accent" /> Copiado</>
            : <><Link2 className="w-3.5 h-3.5" /> Link</>}
        </button>
      </header>

      <div className="px-4 sm:px-5 py-4 space-y-1.5">
        {items.map((item, idx) => {
          const sender = item.pessoas_item?.join(', ') || ''
          const anterior = idx > 0 ? items[idx - 1].pessoas_item?.join(', ') || '' : null
          const showName = sender && sender !== anterior
          const hue = hueOf(item.pessoas_item?.[0])
          return (
            <div key={item.item_id || idx} className={showName && idx > 0 ? 'pt-2.5' : undefined}>
              {showName && (
                <p className="text-xs font-semibold mb-1 ml-1" style={{ color: `hsl(${hue}, 60%, 62%)` }}>
                  {sender}
                </p>
              )}
              <div className={`rounded-2xl rounded-tl-md bg-museum-surface border border-museum-border space-y-2 ${
                item.tipo === 'audio' && !item.conteudo_texto
                  ? 'w-full max-w-[18rem] p-1.5'
                  : 'max-w-[92%] sm:max-w-[85%] px-4 py-2.5'
              }`}>
                {item.titulo && <p className="font-serif font-bold text-museum-text">{item.titulo}</p>}
                <MediaRenderer item={item} compact={false} chat />
                {item.observacoes && (
                  <p className="text-xs text-museum-muted italic border-l-2 border-museum-border pl-3">{item.observacoes}</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </article>
  )
}
