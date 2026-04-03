/**
 * dataLoader.js
 *
 * Busca os dados do Google Sheets via opensheet.elk.sh e normaliza cada linha.
 * O endpoint retorna um array de objetos com os campos da planilha.
 */

const ENDPOINT =
  'https://opensheet.elk.sh/1YXzEHg7Rlyanyg5WITPS-b06ATM6nLt1SLk_O5Dx1Cg/museu_novo'

/**
 * Normaliza uma linha bruta vinda da API.
 * Todos os valores chegam como string — aqui convertemos os tipos necessários.
 */
function normalizeRow(raw) {
  return {
    grupo_id:      String(raw.grupo_id   ?? '').trim(),
    item_id:       String(raw.item_id    ?? '').trim(),
    data:          String(raw.data       ?? '').trim(),
    grupo:         String(raw.grupo      ?? '').trim(),
    pessoa:        String(raw.pessoa     ?? '').trim(),
    tipo:          String(raw.tipo       ?? 'texto').trim().toLowerCase(),
    conteudo_texto: String(raw.conteudo_texto ?? '').trim(),
    url_midia:     String(raw.url_midia  ?? '').trim(),
    ordem:         parseInt(raw.ordem, 10) || 0,
    sequencial:    String(raw.sequencial ?? 'nao').trim().toLowerCase(),
    // campos extras opcionais
    titulo:        String(raw.titulo     ?? '').trim(),
    tags:          String(raw.tags       ?? '').trim(),
    observacoes:   String(raw.observacoes ?? '').trim(),
  }
}

/**
 * Busca e normaliza todos os itens da planilha.
 * Retorna um array flat de itens normalizados.
 */
export async function fetchItems() {
  const res = await fetch(ENDPOINT)
  if (!res.ok) throw new Error(`Erro ao buscar dados: ${res.status} ${res.statusText}`)
  const raw = await res.json()
  if (!Array.isArray(raw)) throw new Error('Resposta inesperada da API')
  // Filtra linhas vazias (grupo_id obrigatório)
  return raw.map(normalizeRow).filter(item => item.grupo_id)
}
