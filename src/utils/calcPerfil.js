/**
 * calcPerfil.js
 * Agrega estatísticas detalhadas por pessoa a partir dos grupos do acervo.
 */
import { parseAno } from './groupPearls'

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
    for (const p of item.pessoas_item ?? []) {
      counts[p] = (counts[p] || 0) + 1
    }
  }
  return Object.entries(counts)
    .map(([pessoa, total]) => ({
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
  const items     = allItems.filter(i => i.pessoas_item?.includes(pessoa))
  const totalAll  = allItems.filter(i => i.pessoas_item?.length > 0).length

  if (items.length === 0) return null

  // --- participação ---
  const total        = items.length
  const participacao = totalAll > 0 ? Math.round((total / totalAll) * 100) : 0

  // --- primeiro registro (grupo_id numericamente mais baixo ligado à pessoa) ---
  const personGroups = groups.filter(g => g.pessoas.includes(pessoa))
  const oldestGroup = [...personGroups].sort((a, b) => {
    const aId = parseInt(a.grupo_id, 10)
    const bId = parseInt(b.grupo_id, 10)
    if (!isNaN(aId) && !isNaN(bId)) return aId - bId
    return String(a.grupo_id).localeCompare(String(b.grupo_id))
  })[0]
  const primeiroItem = oldestGroup?.destaqueItem || oldestGroup?.items?.[0] || items[0]
  const primeiro = oldestGroup?.data || null

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
