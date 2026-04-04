/**
 * calcPerfil.js
 * Agrega estatísticas detalhadas por pessoa a partir dos grupos do acervo.
 */
import { parseAno } from './groupPearls'

function parseDate(str) {
  if (!str) return new Date(0)
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return new Date(str)
  const [d, m, y] = str.split('/')
  if (y) return new Date(`${y}-${m?.padStart(2,'0')}-${d?.padStart(2,'0')}`)
  return new Date(0)
}

function formatDateShort(str) {
  if (!str) return '—'
  const months = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez']
  let d, m, y
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    ;[y, m, d] = str.split('-')
  } else {
    ;[d, m, y] = (str || '').split('/')
  }
  if (!y) return str
  return `${parseInt(d)} ${months[parseInt(m) - 1]} ${y}`
}

const TIPO_LABEL = { texto: 'Texto', imagem: 'Imagem', audio: 'Áudio', video: 'Vídeo' }

/**
 * Retorna lista de todas as pessoas com contagem, ordenada por total desc.
 */
export function getAllPersons(groups) {
  const allItems = groups.flatMap(g => g.items)
  const counts = {}
  for (const item of allItems) {
    const p = item.pessoa?.trim()
    if (!p) continue
    counts[p] = (counts[p] || 0) + 1
  }
  return Object.entries(counts)
    .map(([pessoa, total], _, arr) => ({
      pessoa,
      total,
      rank: 0, // preenchido abaixo
    }))
    .sort((a, b) => b.total - a.total)
    .map((entry, idx) => ({ ...entry, rank: idx + 1 }))
}

/**
 * Calcula o perfil completo de uma pessoa.
 */
export function calcPerfil(groups, pessoa) {
  const allItems  = groups.flatMap(g => g.items)
  const items     = allItems.filter(i => i.pessoa?.trim() === pessoa)
  const totalAll  = allItems.filter(i => i.pessoa?.trim()).length

  if (items.length === 0) return null

  // --- participação ---
  const total        = items.length
  const participacao = totalAll > 0 ? Math.round((total / totalAll) * 100) : 0

  // --- datas ---
  const datesValid = items.map(i => ({ raw: i.data, parsed: parseDate(i.data) }))
    .filter(d => d.parsed.getTime() > 0)
    .sort((a, b) => a.parsed - b.parsed)
  const primeiro = datesValid[0]?.raw || null
  const primeiroItem = items.find(i => i.data === datesValid[0]?.raw) || items[0]

  // --- anos ---
  const byYear = {}
  items.forEach(i => {
    const ano = parseAno(i.data)
    if (ano) byYear[ano] = (byYear[ano] || 0) + 1
  })
  const anosAtivos = Object.keys(byYear).length
  const anoMaisAtivo = Object.entries(byYear).sort((a, b) => b[1] - a[1])[0]?.[0] || '—'

  // --- distribuição por ano (para o gráfico) ---
  const distribuicao = Object.entries(byYear)
    .map(([ano, count]) => ({ ano: Number(ano), count }))
    .sort((a, b) => a.ano - b.ano)

  // --- tipo mais frequente ---
  const byTipo = {}
  items.forEach(i => { if (i.tipo) byTipo[i.tipo] = (byTipo[i.tipo] || 0) + 1 })
  const tipoFrequente = TIPO_LABEL[Object.entries(byTipo).sort((a, b) => b[1] - a[1])[0]?.[0]] || '—'

  // --- top pérolas (texto longo primeiro, depois outros) ---
  const textItems = items
    .filter(i => i.tipo === 'texto' && i.conteudo_texto?.trim())
    .sort((a, b) => (b.conteudo_texto?.length || 0) - (a.conteudo_texto?.length || 0))
  const otherItems = items.filter(i => i.tipo !== 'texto')
  const topItems = [...textItems, ...otherItems].slice(0, 5)

  return {
    pessoa,
    total,
    participacao,
    anosAtivos,
    primeiro:      formatDateShort(primeiro),
    anoMaisAtivo,
    tipoFrequente,
    distribuicao,
    primeiroItem,
    items, // todos os itens (para word cloud)
  }
}
