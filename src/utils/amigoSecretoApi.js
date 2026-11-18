/**
 * Cliente do backend do Amigo Secreto (Google Apps Script — ver
 * apps-script/amigo-secreto.gs). A URL do web app vem de VITE_AMIGO_SECRETO_URL.
 *
 * POST com Content-Type text/plain evita o preflight CORS, que o Apps Script
 * não suporta.
 */
export const AMIGO_URL = import.meta.env.VITE_AMIGO_SECRETO_URL || ''

async function parse(res) {
  let data
  try { data = await res.json() } catch { throw new Error('Resposta inválida do servidor.') }
  if (!data.ok) throw new Error(data.erro || 'Algo deu errado.')
  return data
}

export async function carregarStatus() {
  return parse(await fetch(AMIGO_URL))
}

export async function enviar(acao, dados) {
  const res = await fetch(AMIGO_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ acao, ...dados }),
  })
  return parse(res)
}
