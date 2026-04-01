/**
 * dataLoader.js
 *
 * Abstração para carregamento de dados do Museu das Pérolas.
 *
 * Suporta dois modos:
 *   1. JSON local (padrão) — importe pearls.json direto
 *   2. Google Sheets — exporte a planilha como JSON público e configure a URL abaixo
 *
 * Para conectar ao Google Sheets:
 *   1. Abra a planilha > Arquivo > Compartilhar > Publicar na web
 *   2. Escolha formato CSV ou use a URL de API abaixo
 *   3. Cole a URL em SHEETS_JSON_URL
 *   4. Mude USE_GOOGLE_SHEETS para true
 *
 * URL do Google Sheets (JSON):
 *   https://opensheet.elk.sh/{SPREADSHEET_ID}/{SHEET_NAME}
 *   (serviço gratuito que converte Google Sheets público em JSON)
 */

const USE_GOOGLE_SHEETS = false

// Substitua pelos seus dados ao ativar integração com Google Sheets
const SHEETS_JSON_URL = 'https://opensheet.elk.sh/SEU_SPREADSHEET_ID/Perolas'

/**
 * Normaliza um registro vindo do Google Sheets (onde tudo é string)
 * para o mesmo formato usado pelo JSON local.
 */
function normalizeSheetRow(row) {
  return {
    id:        row.id || '',
    data:      row.data || '',
    ano:       parseInt(row.ano, 10) || null,
    pessoa:    row.pessoa || '',
    titulo:    row.titulo || '',
    descricao: row.descricao || '',
    tipo:      row.tipo || 'texto',
    conteudo:  row.conteudo || null,
    arquivo:   row.arquivo || null,
    url_midia: row.url_midia || null,
    thumbnail: row.thumbnail || null,
    // Tags: o Sheets entrega como string separada por vírgula
    tags:      row.tags ? row.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    fonte:     row.fonte || null,
    observacoes: row.observacoes || null,
  }
}

/**
 * Carrega todas as pérolas da fonte configurada.
 * Retorna um array de objetos normalizados.
 */
export async function loadPearls() {
  if (USE_GOOGLE_SHEETS) {
    const res = await fetch(SHEETS_JSON_URL)
    if (!res.ok) throw new Error('Erro ao carregar dados do Google Sheets')
    const rows = await res.json()
    return rows.map(normalizeSheetRow)
  }

  // Modo local: importa o JSON direto (sem fetch)
  const { default: data } = await import('../data/pearls.json')
  return data
}
