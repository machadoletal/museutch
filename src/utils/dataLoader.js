/**
 * dataLoader.js
 *
 * Carrega as entradas do acervo a partir do pacote cifrado
 * (`museu-data.enc.json`, gerado no build) e as descriptografa no navegador
 * com a senha do site. Normaliza cada linha para o formato usado pelo app.
 */

import { decryptPayload } from './crypto'

const DATA_URL = `${import.meta.env.BASE_URL}museu-data.enc.json`
const PASSWORD_KEY = 'museu_pwd'

let _payloadPromise = null

/** Busca (uma vez) o pacote cifrado. */
function loadEncryptedPayload() {
  if (!_payloadPromise) {
    _payloadPromise = fetch(DATA_URL, { cache: 'no-cache' })
      .then(res => {
        if (!res.ok) throw new Error(`Erro ao carregar os dados: ${res.status}`)
        return res.json()
      })
      .catch(err => {
        _payloadPromise = null // permite nova tentativa
        throw err
      })
  }
  return _payloadPromise
}

export function getStoredPassword() {
  try {
    return sessionStorage.getItem(PASSWORD_KEY) || ''
  } catch {
    return ''
  }
}

export function clearStoredPassword() {
  try {
    sessionStorage.removeItem(PASSWORD_KEY)
  } catch {
    /* ignore */
  }
}

/**
 * Testa a senha contra o pacote cifrado. Se válida, guarda na sessão.
 * @returns {Promise<boolean>}
 */
export async function verifyPassword(password) {
  const payload = await loadEncryptedPayload()
  await decryptPayload(payload, password) // lança se a senha estiver errada
  try {
    sessionStorage.setItem(PASSWORD_KEY, password)
  } catch {
    /* sessionStorage indisponível — segue sem lembrar */
  }
  return true
}

/**
 * Normaliza uma linha bruta vinda da planilha.
 * Todos os valores chegam como string — aqui convertemos os tipos necessários.
 */
function normalizeRow(raw) {
  return {
    grupo_id:      String(raw.grupo_id   ?? '').trim(),
    item_id:       String(raw.item_id    ?? '').trim(),
    data:          String(raw.data       ?? '').trim(),
    grupo:         String(raw.grupo      ?? '').trim(),
    pessoa:        String(raw.pessoa     ?? '').trim(),
    pessoas_item:  String(raw.pessoa     ?? '').trim().split(',').map(s => s.trim()).filter(Boolean),
    tipo:          String(raw.tipo       ?? 'texto').trim().toLowerCase(),
    conteudo_texto: String(raw.conteudo_texto ?? '').trim(),
    url_midia:     String(raw.url_midia  ?? '').trim(),
    ordem:         parseInt(raw.ordem, 10) || 0,
    sequencial:    String(raw.sequencial ?? 'nao').trim().toLowerCase(),
    destaque:      String(raw.destaque   ?? 'nao').trim().toLowerCase(),
    // campos extras opcionais
    titulo:        String(raw.titulo     ?? '').trim(),
    tags:          String(raw.tags       ?? '').trim(),
    observacoes:   String(raw.observacoes ?? '').trim(),
  }
}

/**
 * Busca, descriptografa e normaliza todos os itens do acervo.
 * Usa a senha guardada na sessão (definida pelo cadeado de entrada).
 * @returns {Promise<object[]>} array flat de itens normalizados
 */
export async function fetchItems() {
  const password = getStoredPassword()
  if (!password) {
    const err = new Error('Acervo bloqueado — digite a senha.')
    err.code = 'LOCKED'
    throw err
  }

  const payload = await loadEncryptedPayload()
  const raw = await decryptPayload(payload, password)
  if (!Array.isArray(raw)) throw new Error('Formato de dados inesperado.')

  // Filtra linhas vazias (grupo_id obrigatório)
  return raw.map(normalizeRow).filter(item => item.grupo_id)
}
