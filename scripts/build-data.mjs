/**
 * build-data.mjs
 *
 * Busca as entradas na planilha do Google (via opensheet), criptografa o JSON
 * com a senha do site e grava `public/museu-data.enc.json`.
 *
 * O Vite copia `public/` para `dist/` no build, então o arquivo cifrado vai
 * junto para o site publicado. O conteúdo em claro nunca é gravado em disco
 * nem versionado.
 *
 * Variáveis de ambiente necessárias (localmente, num `.env` na raiz):
 *   SHEET_ID       — id da planilha do Google
 *   SITE_PASSWORD  — senha usada para cifrar (a mesma que destrava o site)
 *   SHEET_TAB      — opcional, nome da aba (padrão: "museu_novo")
 */

import { writeFile, mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// Carrega .env se existir (ignora silenciosamente se não houver)
try {
  process.loadEnvFile(resolve(process.cwd(), '.env'))
} catch {
  /* sem .env — as variáveis devem vir do ambiente (ex: GitHub Actions) */
}

const SHEET_ID = process.env.SHEET_ID
const PASSWORD = process.env.SITE_PASSWORD
const TAB = process.env.SHEET_TAB || 'museu_novo'
const PBKDF2_ITERATIONS = 210_000

if (!SHEET_ID) {
  console.error('ERRO: variável SHEET_ID não definida.')
  process.exit(1)
}
if (!PASSWORD) {
  console.error('ERRO: variável SITE_PASSWORD não definida.')
  process.exit(1)
}

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_PATH = resolve(__dirname, '..', 'public', 'museu-data.enc.json')

function toBase64(bytes) {
  return Buffer.from(bytes).toString('base64')
}

async function main() {
  const endpoint = `https://opensheet.elk.sh/${SHEET_ID}/${encodeURIComponent(TAB)}`
  console.log(`Buscando entradas: aba "${TAB}"…`)

  const res = await fetch(endpoint)
  if (!res.ok) {
    console.error(`ERRO ao buscar a planilha: ${res.status} ${res.statusText}`)
    process.exit(1)
  }

  const rows = await res.json()
  if (!Array.isArray(rows) || rows.length === 0) {
    console.error('ERRO: a planilha retornou vazia ou em formato inesperado.')
    process.exit(1)
  }
  console.log(`${rows.length} linhas recebidas. Criptografando…`)

  const plaintext = new TextEncoder().encode(JSON.stringify(rows))
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(PASSWORD),
    'PBKDF2',
    false,
    ['deriveKey'],
  )
  const key = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt'],
  )
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plaintext)

  const payload = {
    v: 1,
    algo: 'AES-GCM',
    kdf: 'PBKDF2-SHA256',
    iterations: PBKDF2_ITERATIONS,
    salt: toBase64(salt),
    iv: toBase64(iv),
    data: toBase64(new Uint8Array(ciphertext)),
    count: rows.length,
    generatedAt: new Date().toISOString(),
  }

  await mkdir(dirname(OUT_PATH), { recursive: true })
  await writeFile(OUT_PATH, JSON.stringify(payload))
  console.log(`OK: ${OUT_PATH} (${rows.length} entradas cifradas)`)
}

main().catch(err => {
  console.error('ERRO inesperado:', err)
  process.exit(1)
})
