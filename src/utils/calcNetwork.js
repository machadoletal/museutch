/**
 * calcNetwork.js
 * Gera nodes e edges para o grafo de interações a partir dos grupos do acervo.
 * Considera apenas sequências (grupos com mais de um item).
 *
 * Deduplicação de pares: chave canônica `"A|B"` onde A < B lexicograficamente.
 * Cada vez que o par aparece em um grupo → peso +1.
 */

function personColor(name) {
  const hue = (name || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 360
  return `hsl(${hue}, 55%, 42%)`
}

/**
 * @param {object[]} groups — saída de groupPearls / usePearls
 * @returns {{ nodes: object[], links: object[] }}
 */
export function calcNetwork(groups) {
  const edgeMap  = new Map()  // "A|B" → weight
  const nodeMap  = new Map()  // name  → { id, val, totalWeight }

  for (const group of groups) {
    // Apenas sequências (mais de um item no grupo)
    if (group.itemCount <= 1) continue

    // Pessoas únicas presentes neste grupo
    const persons = [
      ...new Set(group.items.flatMap(i => i.pessoas_item ?? [])),
    ]

    if (persons.length < 2) continue

    // Registrar / incrementar contagem de aparições por nó
    for (const p of persons) {
      if (!nodeMap.has(p)) nodeMap.set(p, { id: p, val: 0, totalWeight: 0 })
      nodeMap.get(p).val += 1
    }

    // Gerar todos os pares únicos deste grupo
    for (let i = 0; i < persons.length - 1; i++) {
      for (let j = i + 1; j < persons.length; j++) {
        const [a, b] = [persons[i], persons[j]].sort()
        const key = `${a}|${b}`
        edgeMap.set(key, (edgeMap.get(key) || 0) + 1)
      }
    }
  }

  // Calcular totalWeight por nó (soma dos pesos de todas as suas arestas)
  for (const [key, weight] of edgeMap) {
    const [a, b] = key.split('|')
    if (nodeMap.has(a)) nodeMap.get(a).totalWeight += weight
    if (nodeMap.has(b)) nodeMap.get(b).totalWeight += weight
  }

  const nodes = [...nodeMap.values()].map(({ id, val, totalWeight }) => ({
    id,
    val,          // aparições em sequências (tamanho do nó)
    totalWeight,  // soma dos pesos das conexões
    color: personColor(id),
  }))

  const links = [...edgeMap.entries()].map(([key, weight]) => {
    const [source, target] = key.split('|')
    return { source, target, weight }
  })

  return { nodes, links }
}

/**
 * Retorna as top N conexões de um nó, ordenadas por peso decrescente.
 * @param {string} nodeId
 * @param {object[]} links
 * @param {number} n
 */
export function getTopConnections(nodeId, links, n = 5) {
  return links
    .filter(l => {
      const src = typeof l.source === 'object' ? l.source.id : l.source
      const tgt = typeof l.target === 'object' ? l.target.id : l.target
      return src === nodeId || tgt === nodeId
    })
    .map(l => {
      const src = typeof l.source === 'object' ? l.source.id : l.source
      const tgt = typeof l.target === 'object' ? l.target.id : l.target
      return { pessoa: src === nodeId ? tgt : src, weight: l.weight }
    })
    .sort((a, b) => b.weight - a.weight)
    .slice(0, n)
}
