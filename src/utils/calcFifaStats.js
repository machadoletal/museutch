/**
 * calcFifaStats.js
 * Calcula atributos estilo FIFA Ultimate Team para cada pessoa do acervo.
 * VOL, CONS, ICON, CAOS, MID, PROT → overall + arquétipo + tier visual.
 */
import { parseAno } from './groupPearls'

// Palavras caóticas / intensas em PT-BR (normalizadas sem acento)
const CAOS_WORDS = new Set([
  'kkk','kkkk','kkkkk','kkkkkk','kkkkkkk',
  'haha','hahaha','hauhua','hauhau','rsrs','rsrsrs','huehuehue',
  'socorro','deus','nossa','absurdo','inacreditavel','impossivel',
  'surto','surtou','surtei','louco','louca','loucura','maluco','maluca',
  'cara','mano','vei','gente','caramba','caralho',
  'pesado','pesada','pesadissimo','pesadissima',
  'morri','morrendo','morro','odeio','odeia',
  'serio','seriamente','mentira','juro','prometo',
  'eita','oxe','nossa','uai','coe','fi',
])

function normalizar(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
}

function clamp(val, min = 0, max = 99) {
  return Math.round(Math.min(max, Math.max(min, val)))
}

function scale(val, minVal, maxVal, outMin = 40, outMax = 99) {
  if (maxVal === minVal) return Math.round((outMin + outMax) / 2)
  return clamp(outMin + ((val - minVal) / (maxVal - minVal)) * (outMax - outMin), outMin, outMax)
}

/**
 * Calcula atributos FIFA para todas as pessoas.
 * @param {object[]} groups  — grupos do acervo (de usePearls)
 * @param {object[]} persons — lista de { pessoa, total, rank } (de getAllPersons)
 * @returns {object[]} — persons enriquecidos com overall, archetype, tier, stats
 */
export function calcAllFifaStats(groups, persons) {
  const allItems = groups.flatMap(g => g.items)

  // Anos distintos no dataset inteiro (para CONS)
  const allYears = new Set()
  groups.forEach(g => { if (g.ano) allYears.add(g.ano) })
  const totalYears = allYears.size || 1

  // ── Fase 1: coleta de dados brutos por pessoa ────────────────────────────
  const raw = {}

  for (const { pessoa, total } of persons) {
    const items = allItems.filter(i => i.pessoa?.trim() === pessoa)

    // CONS — anos ativos e regularidade
    const byYear = {}
    items.forEach(i => {
      const ano = parseAno(i.data)
      if (ano) byYear[ano] = (byYear[ano] || 0) + 1
    })
    const anosAtivos = Object.keys(byYear).length
    const countsPerYear = Object.values(byYear)
    const mean = countsPerYear.length > 0
      ? countsPerYear.reduce((a, b) => a + b, 0) / countsPerYear.length
      : 0
    const variance = countsPerYear.reduce((s, c) => s + (c - mean) ** 2, 0) / (countsPerYear.length || 1)
    const regularidade = mean > 0 ? 1 - Math.min(1, Math.sqrt(variance) / mean) : 0

    // ICON — comprimento médio dos textos
    const textItems = items.filter(i => i.tipo === 'texto' && i.conteudo_texto?.trim())
    const avgTextLen = textItems.length > 0
      ? textItems.reduce((s, i) => s + i.conteudo_texto.length, 0) / textItems.length
      : 0

    // CAOS — proporção de palavras caóticas
    let totalWords = 0, caosCount = 0
    for (const item of textItems) {
      const words = normalizar(item.conteudo_texto).split(/\s+/).filter(w => w.length >= 2)
      totalWords += words.length
      caosCount += words.filter(w => CAOS_WORDS.has(w)).length
    }

    // MID — diversidade de formatos
    const distinctTipos = new Set(items.map(i => i.tipo).filter(Boolean)).size

    // PROT — presença em sequências
    const itensEmSeq = groups
      .filter(g => g.isSequence && g.items.some(i => i.pessoa?.trim() === pessoa))
      .flatMap(g => g.items.filter(i => i.pessoa?.trim() === pessoa))

    raw[pessoa] = {
      total, items, textItems,
      anosAtivos, regularidade,
      avgTextLen,
      hasMedia: items.some(i => i.tipo !== 'texto'),
      caosRatio: totalWords > 0 ? caosCount / totalWords : 0,
      distinctTipos,
      protRatio: total > 0 ? itensEmSeq.length / total : 0,
    }
  }

  // ── Fase 2: ranges globais para normalização ─────────────────────────────
  const maxTotal      = Math.max(...persons.map(p => p.total))
  const allAvgTexts   = Object.values(raw).map(s => s.avgTextLen).filter(v => v > 0)
  const maxAvgText    = allAvgTexts.length > 0 ? Math.max(...allAvgTexts) : 1
  const minAvgText    = allAvgTexts.length > 0 ? Math.min(...allAvgTexts) : 0
  const maxCaosRatio  = Math.max(...Object.values(raw).map(s => s.caosRatio), 0.001)
  const maxProtRatio  = Math.max(...Object.values(raw).map(s => s.protRatio), 0.001)

  // ── Fase 3: normalizar e calcular overall + arquétipo ────────────────────
  return persons.map(({ pessoa, total, rank }) => {
    const s = raw[pessoa]

    // VOL: escala log 42–99
    const vol = clamp(
      42 + (Math.log(total + 1) / Math.log(maxTotal + 1)) * 57,
      42, 99,
    )

    // CONS: cobertura de anos + bônus de regularidade
    const cons = clamp(
      (s.anosAtivos / totalYears) * 70 + s.regularidade * 29,
      28, 99,
    )

    // ICON: comprimento médio de textos + bônus por ter mídia
    let icon
    if (s.avgTextLen > 0) {
      icon = scale(s.avgTextLen, minAvgText, maxAvgText, 38, 90)
      if (s.hasMedia) icon = clamp(icon + 8, 38, 99)
    } else {
      icon = s.hasMedia ? 54 : 38
    }

    // CAOS: proporção de palavras caóticas
    const caos = clamp(scale(s.caosRatio, 0, maxCaosRatio, 30, 99), 30, 99)

    // MID: 1→40, 2→62, 3→81, 4→99
    const midMap = { 1: 40, 2: 62, 3: 81, 4: 99 }
    const mid = midMap[Math.min(4, s.distinctTipos)] ?? 40

    // PROT: proporção em sequências
    const prot = clamp(scale(s.protRatio, 0, maxProtRatio, 28, 99), 28, 99)

    // OVERALL ponderado
    const overall = clamp(
      vol  * 0.22 +
      icon * 0.22 +
      prot * 0.18 +
      cons * 0.16 +
      caos * 0.13 +
      mid  * 0.09
    )

    // ARQUÉTIPO: baseado no stat dominante
    const scores = { vol, cons, icon, caos, mid, prot }
    const topStat = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0]

    let archetype
    if (overall >= 88) {
      archetype = 'LEN'
    } else if (topStat === 'caos') {
      archetype = caos >= 72 ? 'SUR' : 'CRA'
    } else if (topStat === 'icon') {
      archetype = s.textItems.length > s.items.length * 0.5 ? 'FIL' : 'COM'
    } else if (topStat === 'cons') {
      archetype = 'SEN'
    } else if (topStat === 'mid') {
      archetype = 'NAR'
    } else if (topStat === 'prot') {
      archetype = 'DRA'
    } else {
      archetype = caos >= 60 ? 'CRA' : 'COM'
    }

    // TIER visual
    const tier = (overall >= 88 || rank <= 3) ? 'icon'
      : overall >= 80 ? 'gold'
      : overall >= 65 ? 'silver'
      : 'bronze'

    return {
      pessoa,
      total,
      rank,
      overall,
      archetype,
      tier,
      stats: { vol, cons, icon, caos, mid, prot },
    }
  })
}

// Nomes completos dos arquétipos (para tooltips / perfil)
export const ARCHETYPE_LABEL = {
  LEN: 'Lendária',
  SUR: 'Surtada',
  CRA: 'Caótica',
  FIL: 'Filósofa',
  COM: 'Comediante',
  SEN: 'Sensata',
  NAR: 'Narradora',
  DRA: 'Dramática',
}
