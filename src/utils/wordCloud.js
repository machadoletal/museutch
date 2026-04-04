/**
 * wordCloud.js
 * Calcula frequência de palavras a partir de itens de texto.
 * Sem dependências externas — resultado usado para word cloud CSS.
 */

const STOPWORDS = new Set([
  'de','da','do','das','dos','num','numa','pra','pro','pros','pras',
  'que','e','o','a','os','as','um','uma','uns','umas',
  'em','com','para','por','no','na','nos','nas','ao','à','aos','às',
  'se','eu','tu','ele','ela','nós','vós','eles','elas',
  'me','te','lhe','nos','vos','lhes',
  'meu','minha','meus','minhas','seu','sua','seus','suas',
  'este','esta','estes','estas','esse','essa','esses','essas',
  'aquele','aquela','aqueles','aquelas','isso','isto','aquilo',
  'mas','ou','nem','pois','porque','então','porém','contudo','todavia',
  'não','sim','já','mais','menos','muito','pouco','bem','mal',
  'quando','como','onde','quem','qual','quais','quanto',
  'ser','ter','fazer','ir','vir','ver','dar','deu','vai','vou',
  'foi','era','está','estou','estão','tá','ta','né','aí',
  'só','tudo','nada','algo','alguém','ninguém','aqui','ali','lá',
  'hoje','ontem','agora','depois','antes','sempre','nunca','ainda',
  'sobre','entre','até','desde','durante','sem','sob','sobre',
])

/**
 * Normaliza uma string para comparação: lowercase + remove acentos.
 */
function normalizar(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
}

/**
 * Retorna as top N palavras mais frequentes dos itens de texto de uma pessoa.
 *
 * @param {object[]} items  — itens já filtrados pela pessoa
 * @param {number}   topN   — quantas palavras retornar (padrão 40)
 * @returns {{ word: string, count: number, size: number }[]}
 *          size: 1–5 (escala relativa para CSS)
 */
export function calcWordFreq(items, topN = 40) {
  const counts = {}

  for (const item of items) {
    if (item.tipo !== 'texto' || !item.conteudo_texto?.trim()) continue
    const words = normalizar(item.conteudo_texto)
      .split(/\s+/)
      .filter(w => w.length >= 3 && !STOPWORDS.has(w) && !/^\d+$/.test(w))
    for (const w of words) {
      counts[w] = (counts[w] || 0) + 1
    }
  }

  const sorted = Object.entries(counts)
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, topN)

  if (sorted.length === 0) return []

  const max = sorted[0].count
  const min = sorted[sorted.length - 1].count

  return sorted.map(({ word, count }) => ({
    word,
    count,
    // size 1–5 para escalonar o font-size no CSS
    size: min === max ? 3 : Math.round(1 + ((count - min) / (max - min)) * 4),
  }))
}
