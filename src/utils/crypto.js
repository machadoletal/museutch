/**
 * crypto.js
 *
 * Descriptografa, no navegador, o pacote gerado por `scripts/build-data.mjs`.
 * Usa Web Crypto (AES-GCM + PBKDF2-SHA256). A senha nunca sai do dispositivo.
 */

function fromBase64(b64) {
  const bin = atob(b64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return bytes
}

async function deriveKey(password, salt, iterations) {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveKey'],
  )
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt'],
  )
}

/**
 * @param {object} payload  - JSON de museu-data.enc.json
 * @param {string} password
 * @returns {Promise<any[]>} array de linhas em claro
 * @throws se a senha estiver errada ou o pacote for inválido
 */
export async function decryptPayload(payload, password) {
  if (!payload || payload.v !== 1) throw new Error('Pacote de dados inválido.')

  const key = await deriveKey(password, fromBase64(payload.salt), payload.iterations)

  let plaintext
  try {
    plaintext = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: fromBase64(payload.iv) },
      key,
      fromBase64(payload.data),
    )
  } catch {
    // AES-GCM falha na verificação de integridade quando a senha está errada
    const err = new Error('Senha incorreta.')
    err.code = 'WRONG_PASSWORD'
    throw err
  }

  return JSON.parse(new TextDecoder().decode(plaintext))
}
