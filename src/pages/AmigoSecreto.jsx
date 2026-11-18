import { useState, useEffect, useCallback } from 'react'
import { AMIGO_URL, carregarStatus, enviar } from '../utils/amigoSecretoApi'

const inputCls =
  'w-full rounded-lg border border-museum-border bg-museum-bg px-3 py-2 text-sm text-museum-text ' +
  'placeholder:text-museum-muted/40 focus:outline-none focus:border-museum-accent/60'
const btnCls =
  'rounded-full bg-museum-accent px-5 py-2 text-sm font-medium text-white shadow-md shadow-museum-accent/20 ' +
  'transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed'

function Card({ title, children }) {
  return (
    <section className="rounded-2xl border border-museum-border bg-museum-card p-6 shadow-xl shadow-black/30">
      <h2 className="font-serif text-xl font-bold mb-4">{title}</h2>
      {children}
    </section>
  )
}

function Msg({ msg }) {
  if (!msg) return null
  return (
    <p className={`mt-3 text-sm ${msg.tipo === 'erro' ? 'text-red-400' : 'text-emerald-400'}`}>{msg.texto}</p>
  )
}

export default function AmigoSecreto() {
  const [status, setStatus] = useState(null)
  const [loadError, setLoadError] = useState('')

  const recarregar = useCallback(async () => {
    try {
      setStatus(await carregarStatus())
      setLoadError('')
    } catch (e) {
      setLoadError(e.message)
    }
  }, [])

  useEffect(() => {
    // Carga inicial a partir de fonte externa (backend).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (AMIGO_URL) recarregar()
  }, [recarregar])

  return (
    <div className="min-h-screen bg-museum-bg text-museum-text">
      <div className="border-b border-museum-border">
        <div className="max-w-2xl mx-auto px-4 py-8 text-center">
          <span className="text-museum-accent text-lg select-none">🎁</span>
          <h1 className="font-serif text-3xl md:text-4xl font-bold mt-2">
            Amigo <span className="text-museum-accent italic">Secreto</span>
          </h1>
          <p className="mt-2 text-museum-muted text-sm">
            Inscreva-se, espere o sorteio e descubra quem você tirou.
          </p>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {!AMIGO_URL && (
          <Card title="Ainda não configurado">
            <p className="text-sm text-museum-muted">
              Falta publicar o backend e definir <code>VITE_AMIGO_SECRETO_URL</code>. Veja a seção
              “Amigo secreto” do README.
            </p>
          </Card>
        )}

        {AMIGO_URL && loadError && (
          <Card title="Não deu para carregar">
            <p className="text-sm text-red-400">{loadError}</p>
            <button className={`${btnCls} mt-4`} onClick={recarregar}>Tentar de novo</button>
          </Card>
        )}

        {AMIGO_URL && !loadError && !status && (
          <p className="text-center text-sm text-museum-muted animate-pulse">Carregando…</p>
        )}

        {status && (
          <>
            <Participantes status={status} />
            {status.sorteado ? <Resultado participantes={status.participantes} /> : (
              <>
                <Inscricao status={status} onChange={recarregar} />
                {status.participantes.length > 0 && (
                  <CancelarInscricao participantes={status.participantes} onChange={recarregar} />
                )}
              </>
            )}
            <Organizador status={status} onChange={recarregar} />
          </>
        )}
      </main>
    </div>
  )
}

function Participantes({ status }) {
  const { participantes, sorteado } = status
  return (
    <Card title={`Participantes (${participantes.length})`}>
      {participantes.length === 0 ? (
        <p className="text-sm text-museum-muted">Ninguém se inscreveu ainda. Seja a primeira pessoa!</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {participantes.map(n => (
            <span key={n} className="rounded-full border border-museum-border px-3 py-1 text-xs text-museum-muted">{n}</span>
          ))}
        </div>
      )}
      <p className="mt-4 text-xs text-museum-muted/60">
        {sorteado ? '🎉 O sorteio já foi realizado.' : 'Inscrições abertas.'}
      </p>
    </Card>
  )
}

function Inscricao({ status, onChange }) {
  const [nome, setNome] = useState('')
  const [pin, setPin] = useState('')
  const [email, setEmail] = useState('')
  const [desejos, setDesejos] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState(null)
  const disponiveis = status.permitidos.filter(n => !status.participantes.includes(n))

  async function submit(e) {
    e.preventDefault()
    setBusy(true); setMsg(null)
    try {
      await enviar('inscrever', { nome, pin, email, desejos })
      setMsg({ tipo: 'ok', texto: 'Inscrição feita! Guarde seu PIN: com ele você também vê seu amigo aqui no site.' })
      setNome(''); setPin(''); setEmail(''); setDesejos('')
      onChange()
    } catch (err) {
      setMsg({ tipo: 'erro', texto: err.message })
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card title="Inscrição">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-xs text-museum-muted mb-1">Seu nome</label>
          <select className={inputCls} value={nome} onChange={e => setNome(e.target.value)} required>
            <option value="">Escolha seu nome…</option>
            {disponiveis.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-museum-muted mb-1">PIN secreto (6 a 20 caracteres)</label>
          <input className={inputCls} value={pin} onChange={e => setPin(e.target.value)} minLength={6} maxLength={20} required autoComplete="off" />
        </div>
        <div>
          <label className="block text-xs text-museum-muted mb-1">
            E-mail (você recebe seu amigo por e-mail quando sair o sorteio)
          </label>
          <input type="email" className={inputCls} value={email} onChange={e => setEmail(e.target.value)} maxLength={100} required />
        </div>
        <div>
          <label className="block text-xs text-museum-muted mb-1">Sugestões de presente (opcional)</label>
          <textarea className={inputCls} rows={3} value={desejos} onChange={e => setDesejos(e.target.value)} maxLength={300} />
        </div>
        <button type="submit" className={btnCls} disabled={busy}>Inscrever</button>
        <Msg msg={msg} />
      </form>
    </Card>
  )
}

function CancelarInscricao({ participantes, onChange }) {
  const [nome, setNome] = useState('')
  const [pin, setPin] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState(null)

  async function submit(e) {
    e.preventDefault()
    setBusy(true); setMsg(null)
    try {
      await enviar('sair', { nome, pin })
      setMsg({ tipo: 'ok', texto: 'Inscrição cancelada. Você pode se inscrever de novo acima.' })
      setNome(''); setPin('')
      onChange()
    } catch (err) {
      setMsg({ tipo: 'erro', texto: err.message })
    } finally {
      setBusy(false)
    }
  }

  return (
    <details className="rounded-2xl border border-museum-border bg-museum-card/50 p-4">
      <summary className="cursor-pointer text-sm text-museum-muted">Cancelar minha inscrição</summary>
      <form onSubmit={submit} className="mt-4 space-y-3">
        <select className={inputCls} value={nome} onChange={e => setNome(e.target.value)} required>
          <option value="">Escolha seu nome…</option>
          {participantes.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
        <input className={inputCls} placeholder="Seu PIN" value={pin} onChange={e => setPin(e.target.value)} required autoComplete="off" />
        <button type="submit" className={btnCls} disabled={busy}>Cancelar inscrição</button>
        <Msg msg={msg} />
      </form>
    </details>
  )
}

function Resultado({ participantes }) {
  const [nome, setNome] = useState('')
  const [pin, setPin] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState(null)
  const [res, setRes] = useState(null)

  async function submit(e) {
    e.preventDefault()
    setBusy(true); setMsg(null); setRes(null)
    try {
      setRes(await enviar('resultado', { nome, pin }))
    } catch (err) {
      setMsg({ tipo: 'erro', texto: err.message })
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card title="Descubra seu amigo secreto">
      <form onSubmit={submit} className="space-y-4">
        <select className={inputCls} value={nome} onChange={e => setNome(e.target.value)} required>
          <option value="">Escolha seu nome…</option>
          {participantes.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
        <input className={inputCls} placeholder="Seu PIN" value={pin} onChange={e => setPin(e.target.value)} required autoComplete="off" />
        <button type="submit" className={btnCls} disabled={busy}>Revelar</button>
        <Msg msg={msg} />
      </form>
      {res && (
        <div className="mt-6 text-center animate-fade-in">
          <p className="text-xs text-museum-muted uppercase tracking-widest">Você tirou</p>
          <p className="font-serif text-3xl font-bold text-museum-accent mt-1">{res.amigo}</p>
          {res.desejos && <p className="mt-3 text-sm text-museum-muted">💡 {res.desejos}</p>}
          <p className="mt-4 text-xs text-museum-muted/60">Shhh… é segredo! 🤫</p>
        </div>
      )}
    </Card>
  )
}

function Organizador({ status, onChange }) {
  const [chave, setChave] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState(null)

  async function sortear() {
    const refazer = status.sorteado
    const pergunta = refazer
      ? 'Já existe um sorteio. Refazer vai substituir todos os pares. Continuar?'
      : `Sortear agora com ${status.participantes.length} participantes? Depois disso ninguém mais pode se inscrever.`
    if (!window.confirm(pergunta)) return
    setBusy(true); setMsg(null)
    try {
      const r = await enviar('sortear', { chave, refazer })
      setMsg({
        tipo: 'ok',
        texto: `Sorteio realizado! ${r.emails} e-mail(s) enviado(s)${r.falhas ? `, ${r.falhas} falhou(aram)` : ''}. ` +
          'Quem quiser também pode ver o resultado nesta página com nome + PIN.',
      })
      onChange()
    } catch (err) {
      setMsg({ tipo: 'erro', texto: err.message })
    } finally {
      setBusy(false)
    }
  }

  return (
    <details className="rounded-2xl border border-museum-border bg-museum-card/50 p-4">
      <summary className="cursor-pointer text-sm text-museum-muted">Área do organizador</summary>
      <div className="mt-4 space-y-3">
        <input
          type="password" className={inputCls} placeholder="Chave do organizador"
          value={chave} onChange={e => setChave(e.target.value)} autoComplete="off"
        />
        <button className={btnCls} onClick={sortear} disabled={busy || !chave || status.participantes.length < 2}>
          {status.sorteado ? 'Refazer sorteio' : 'Realizar sorteio'}
        </button>
        <Msg msg={msg} />
      </div>
    </details>
  )
}
