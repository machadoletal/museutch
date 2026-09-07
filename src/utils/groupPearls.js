/**
 * groupPearls.js
 *
 * Agrupa o array flat de itens por grupo_id.
 * Cada grupo resultante é uma "entrada" do museu:
 *   - 1 item  → entrada única  (isSequence = false)
 *   - N itens → sequência      (isSequence = true)
 */

/**
 * Extrai o ano de uma string de data no formato "dd/mm/yyyy" ou "yyyy-mm-dd".
 */
export function parseAno(dataStr) {
  if (!dataStr) return null
  // yyyy-mm-dd
  if (/^\d{4}-\d{2}-\d{2}$/.test(dataStr)) return parseInt(dataStr.slice(0, 4), 10)
  // dd/mm/yyyy
  const parts = dataStr.split('/')
  if (parts.length === 3) {
    const y = parseInt(parts[2], 10)
    if (Number.isNaN(y)) return null
    return y < 100 ? 2000 + y : y
  }
  return null
}

/**
 * Converte "dd/mm/yyyy" ou "yyyy-mm-dd" para um Date (para ordenação).
 * Retorna epoch 0 se inválido.
 */
function parseDate(dataStr) {
  if (!dataStr) return new Date(0)
  if (/^\d{4}-\d{2}-\d{2}$/.test(dataStr)) return new Date(dataStr)
  const parts = dataStr.split('/')
  if (parts.length === 3) {
    const [d, m, y] = parts
    // Suporta ano com 2 dígitos ("20" → "2020")
    const year = y.length === 2 ? `20${y}` : y.padStart(4, '0')
    return new Date(`${year}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`)
  }
  return new Date(0)
}

/**
 * Agrupa itens por grupo_id e retorna array de EntradaAgrupada,
 * ordenadas da mais recente para a mais antiga.
 *
 * @param {object[]} items - array flat normalizado
 * @returns {EntradaAgrupada[]}
 */
export function groupPearls(items) {
  // Mapeia grupo_id → array de itens
  const map = new Map()
  for (const item of items) {
    if (!map.has(item.grupo_id)) map.set(item.grupo_id, [])
    map.get(item.grupo_id).push(item)
  }

  const grupos = []
  for (const [grupo_id, grupo_items] of map.entries()) {
    // Ordena os itens da sequência por `ordem`
    const sorted = [...grupo_items].sort((a, b) => a.ordem - b.ordem)

    // Usa os dados do primeiro item como referência do grupo
    const first = sorted[0]

    // Coleta pessoas únicas do grupo (mantendo ordem de aparição, suporta múltiplos por item)
    const pessoasSet = new Set(sorted.flatMap(i => i.pessoas_item))

    // Tipo predominante (para filtro por tipo)
    // Se houver vários tipos, retornamos o do primeiro item
    // mas guardamos todos para busca
    const tipos = [...new Set(sorted.map(i => i.tipo))]

    // Item de destaque para preview (sequências com "destaque: sim"), senão o primeiro
    const destaqueItem = sorted.find(i => i.destaque === 'sim') ?? first

    grupos.push({
      grupo_id,
      data:        first.data,
      ano:         parseAno(first.data),
      _date:       parseDate(first.data),  // usado só para ordenação
      grupo:       first.grupo,
      pessoas:     [...pessoasSet],
      // pessoa primária (do primeiro item) para filtro simples
      pessoa:      first.pessoa,
      tipo:        first.tipo,             // tipo do primeiro item
      tipos,                              // todos os tipos presentes
      isSequence:  sorted.length > 1,
      itemCount:   sorted.length,
      items:       sorted,
      destaqueItem,                       // item a exibir no preview da página principal
    })
  }

  // Ordena da entrada mais recente para a mais antiga
  return grupos.sort((a, b) => b._date - a._date)
}
