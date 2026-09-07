import { useState, useEffect } from 'react'
import { Lock, LoaderCircle } from 'lucide-react'
import { verifyPassword, getStoredPassword, clearStoredPassword } from '../utils/dataLoader'

/**
 * PasswordGate
 *
 * Cadeado de entrada do acervo. Só renderiza os filhos depois que a senha
 * correta é fornecida — é ela que descriptografa os dados no navegador.
 * A senha fica apenas em sessionStorage (some ao fechar a aba).
 */
export default function PasswordGate({ children }) {
  const [unlocked, setUnlocked] = useState(false)
  const [checking, setChecking] = useState(true)
  const [value, setValue] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Revalida uma senha já guardada (ex: recarregou a página)
  useEffect(() => {
    const stored = getStoredPassword()
    if (!stored) { setChecking(false); return }
    let cancelled = false
    verifyPassword(stored)
      .then(() => { if (!cancelled) setUnlocked(true) })
      .catch(() => { if (!cancelled) clearStoredPassword() })
      .finally(() => { if (!cancelled) setChecking(false) })
    return () => { cancelled = true }
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!value.trim() || submitting) return
    setSubmitting(true)
    setError('')
    try {
      await verifyPassword(value.trim())
      setUnlocked(true)
    } catch (err) {
      setError(err.code === 'WRONG_PASSWORD' ? 'Senha incorreta.' : 'Não foi possível carregar o acervo. Tente de novo.')
    } finally {
      setSubmitting(false)
    }
  }

  if (unlocked) return children

  return (
    <div className="min-h-screen bg-museum-bg text-museum-text flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center animate-fade-in">
        <div className="flex items-center justify-center gap-3 mb-5">
          <div className="h-px flex-1 max-w-[60px] bg-gradient-to-r from-transparent to-museum-accent/40" />
          <span className="text-museum-accent text-lg select-none">✦</span>
          <div className="h-px flex-1 max-w-[60px] bg-gradient-to-l from-transparent to-museum-accent/40" />
        </div>

        <h1 className="font-serif text-3xl font-bold tracking-tight">
          Museu <span className="text-museum-accent italic">TCH</span>
        </h1>
        <p className="mt-2 mb-8 text-xs text-museum-muted tracking-widest uppercase">
          Arquivo Afetivo &bull; Acervo privado
        </p>

        {checking ? (
          <div className="flex items-center justify-center gap-2 text-museum-muted text-sm py-3">
            <LoaderCircle className="w-4 h-4 animate-spin" /> Verificando…
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-museum-muted pointer-events-none" />
              <input
                type="password"
                autoFocus
                value={value}
                onChange={e => { setValue(e.target.value); setError('') }}
                placeholder="Digite a senha para acessar"
                className="
                  w-full pl-9 pr-3 py-2.5 text-sm
                  bg-museum-surface border border-museum-border rounded-lg
                  text-museum-text placeholder:text-museum-muted/40
                  focus:outline-none focus:border-museum-accent/50 focus:ring-1 focus:ring-museum-accent/20
                  transition
                "
              />
            </div>

            {error && <p className="text-xs text-red-400">{error}</p>}

            <button
              type="submit"
              disabled={submitting || !value.trim()}
              className="
                w-full py-2.5 text-sm font-medium rounded-lg
                bg-museum-accent/90 text-museum-bg
                hover:bg-museum-accent disabled:opacity-40 disabled:cursor-not-allowed
                transition flex items-center justify-center gap-2
              "
            >
              {submitting && <LoaderCircle className="w-4 h-4 animate-spin" />}
              Entrar
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
