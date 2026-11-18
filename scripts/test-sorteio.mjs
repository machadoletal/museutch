// Testa a lógica pura do sorteio (apps-script/amigo-secreto.gs) sem precisar do Apps Script.
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import assert from 'node:assert/strict'

const ctx = {}
vm.createContext(ctx)
vm.runInContext(readFileSync('apps-script/amigo-secreto.gs', 'utf8'), ctx)
const { sortearPares, prng, paresDe_, norm_ } = ctx

const nomes = ['Helô', 'Gio', 'Ana Villela', 'Gustavo', 'Jack', 'Theus', 'Isa', 'Julia', 'Leo', 'Rapha', 'Lucky Freity', 'Hosanna', 'Tchalla']
const fixos = { Gustavo: 'Theus' }
const evitar = { Jack: ['Isa'] }

function valida(p, lista, fx) {
  assert.ok(p, 'deve achar um sorteio')
  assert.equal(new Set(Object.values(p)).size, lista.length, 'cada um é tirado exatamente uma vez')
  for (const n of lista) {
    assert.notEqual(p[n], n, 'ninguém tira a si mesmo')
    assert.ok(!(evitar[n] || []).includes(p[n]), 'respeita restrições')
  }
  for (const [a, b] of Object.entries(fx)) if (lista.includes(a) && lista.includes(b)) assert.equal(p[a], b, 'regra fixa')
}

// Aleatório + uma regra fixa (A tira B); cônjuges (sem exclusão) podem se tirar
const vistos = new Set()
for (let i = 0; i < 3000; i++) {
  const p = sortearPares(nomes, evitar, fixos)
  valida(p, nomes, fixos)
  vistos.add(p.Helô)
}
assert.ok(vistos.size > 8, 'Helô deve tirar pessoas variadas')

// Se Theus não participa, a regra é ignorada
const semTheus = nomes.filter(n => n !== 'Theus')
for (let i = 0; i < 500; i++) valida(sortearPares(semTheus, evitar, fixos), semTheus, fixos)

// Determinismo por semente (o par é recalculado a cada consulta)
const s = { seed: [1, 2, 3, 4], nomes, evitar, fixos }
const a = paresDe_(s), b = paresDe_(s)
assert.deepEqual(a, b)
valida(a, nomes, fixos)
assert.notDeepEqual(paresDe_({ ...s, seed: [9, 8, 7, 6] }), a)
const r = prng([5, 6, 7, 8]); const x = r(); assert.ok(x >= 0 && x < 1)

assert.equal(norm_('  HELÔ '), 'helo')
assert.equal(sortearPares(['A'], {}, {}), null, 'menos de 2 pessoas')
assert.equal(sortearPares(['A', 'B'], { A: ['B'] }, {}), null, 'restrição impossível')
console.log('sorteio: ok')
