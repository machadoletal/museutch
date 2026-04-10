/**
 * buildBracket.js
 * Utilitários para o torneio bracket de pérolas.
 * Suporta qualquer quantidade de participantes — sem limite fixo.
 */

/** Próxima potência de 2 maior ou igual a n. */
export function nextPowerOf2(n) {
  if (n <= 1) return 1
  return 2 ** Math.ceil(Math.log2(n))
}

/** Total de confrontos num bracket de eliminação simples. */
export function totalMatchups(bracketSize) {
  return bracketSize - 1
}

/** Confrontos já concluídos até o momento atual. */
export function countCompletedMatchups(roundNumber, matchupIndex, bracketSize) {
  let done = 0
  let size = bracketSize / 2
  for (let r = 0; r < roundNumber; r++) {
    done += size
    size = Math.floor(size / 2)
  }
  return done + matchupIndex
}

/** Fisher-Yates shuffle. */
function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * Inicializa o bracket com TODOS os itens fornecidos.
 * Embaralha, calcula próxima potência de 2, distribui BYEs (null) de forma
 * que cada BYE fique emparelhado com um item real — nunca BYE vs BYE.
 *
 * Layout: pares reais-reais primeiro, depois pares real-BYE no final.
 * Garante: para todo confronto (a, b), no máximo um deles é null.
 */
export function initBracket(items) {
  const shuffled = shuffle(items)
  const bracketSize = nextPowerOf2(shuffled.length)
  const totalRounds = Math.log2(bracketSize)
  const n = shuffled.length
  const byeCount = bracketSize - n

  // Itens que ficam em confrontos puramente reais: 2n - bracketSize
  // Itens restantes (byeCount) ganham um BYE como adversário
  const realRealCount = n - byeCount  // = 2n - bracketSize

  const padded = []
  // Pares reais-reais
  for (let i = 0; i < realRealCount; i++) padded.push(shuffled[i])
  // Pares real-BYE
  for (let i = realRealCount; i < n; i++) {
    padded.push(shuffled[i])
    padded.push(null)
  }
  // padded.length === bracketSize sempre

  return {
    roundItems:   padded,
    matchupIndex: 0,
    roundNumber:  0,
    totalRounds,
    bracketSize,
    roundWinners: [],
  }
}

/**
 * Registra o vencedor de um confronto (função pura).
 * @returns {{ newState: object, champion: object|null }}
 */
function applyPick(state, winner) {
  const { roundItems, matchupIndex, roundNumber, roundWinners } = state
  const matchupsInRound = Math.floor(roundItems.length / 2)
  const newWinners = [...roundWinners, winner]

  // Mais confrontos nesta rodada
  if (matchupIndex + 1 < matchupsInRound) {
    return {
      newState: { ...state, matchupIndex: matchupIndex + 1, roundWinners: newWinners },
      champion: null,
    }
  }

  // Fim de rodada — restou apenas 1 vencedor = campeão
  if (newWinners.length === 1) {
    return { newState: state, champion: newWinners[0] }
  }

  // Iniciar próxima rodada com os vencedores
  return {
    newState: {
      ...state,
      roundItems:   newWinners,
      matchupIndex: 0,
      roundNumber:  state.roundNumber + 1,
      roundWinners: [],
    },
    champion: null,
  }
}

/**
 * Registra uma escolha e avança automaticamente por BYEs consecutivos.
 * Resolve múltiplos BYEs de forma síncrona (sem re-render intermediário).
 * @returns {{ newState: object, champion: object|null }}
 */
export function pickAndAdvance(state, winner) {
  let result = applyPick(state, winner)
  if (result.champion) return result

  // Loop: pular BYEs enquanto pairB === null
  let current = result.newState
  while (true) {
    const a = current.roundItems[current.matchupIndex * 2]
    const b = current.roundItems[current.matchupIndex * 2 + 1]
    if (b === null && a !== null) {
      const r = applyPick(current, a)
      if (r.champion) return r
      current = r.newState
    } else {
      break
    }
  }

  return { newState: current, champion: null }
}
