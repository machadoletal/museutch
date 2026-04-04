/**
 * calcRanking.js
 *
 * Agrega itens brutos do acervo por pessoa, respeitando filtro de ano.
 * Cada item associado a uma pessoa conta como 1 pérola para ela.
 */
import { parseAno } from './groupPearls'

/**
 * Retorna o ranking de pessoas ordenado do maior para o menor.
 *
 * @param {object[]} groups  — array de grupos retornados por usePearls
 * @param {number|'Todos'} ano — ano para filtrar, ou 'Todos'
 * @returns {{ rank, pessoa, count, pct }[]}
 */
export function calcRanking(groups, ano = 'Todos') {
  const items = groups.flatMap(g => g.items)

  const filtered = ano === 'Todos'
    ? items
    : items.filter(item => parseAno(item.data) === Number(ano))

  const counts = {}
  for (const item of filtered) {
    const pessoa = item.pessoa?.trim()
    if (!pessoa) continue
    counts[pessoa] = (counts[pessoa] || 0) + 1
  }

  const sorted = Object.entries(counts)
    .map(([pessoa, count]) => ({ pessoa, count }))
    .sort((a, b) => b.count - a.count)

  const max = sorted[0]?.count || 1

  return sorted.map((entry, idx) => ({
    rank:   idx + 1,
    pessoa: entry.pessoa,
    count:  entry.count,
    pct:    Math.round((entry.count / max) * 100),
  }))
}

/**
 * Extrai os anos disponíveis nos itens, ordenados do mais recente.
 */
export function getAvailableYears(groups) {
  const items = groups.flatMap(g => g.items)
  const years = new Set(items.map(i => parseAno(i.data)).filter(Boolean))
  return Array.from(years).sort((a, b) => b - a)
}

/**
 * Resumo rápido do recorte atual.
 */
export function calcSummary(ranking, ano) {
  const total = ranking.reduce((acc, r) => acc + r.count, 0)
  return {
    totalPerolas: total,
    totalPessoas: ranking.length,
    lider:        ranking[0]?.pessoa || '—',
    liderCount:   ranking[0]?.count  || 0,
    ano,
  }
}
