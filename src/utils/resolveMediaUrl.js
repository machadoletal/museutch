/**
 * resolveMediaUrl.js
 *
 * Converte links do Google Drive para URLs que funcionam diretamente
 * em <img>, <audio>, <video> e <iframe>.
 *
 * Formatos de entrada suportados:
 *   https://drive.google.com/file/d/FILE_ID/view?usp=sharing
 *   https://drive.google.com/open?id=FILE_ID
 *   https://drive.google.com/uc?id=FILE_ID
 *
 * Saída por tipo:
 *   imagem → drive.google.com/file/d/FILE_ID/preview  (iframe — mais confiável)
 *   audio  → drive.google.com/file/d/FILE_ID/preview  (player nativo do Drive)
 *   video  → drive.google.com/file/d/FILE_ID/preview  (player nativo do Drive)
 */

/**
 * Extrai o File ID de qualquer formato de URL do Google Drive.
 * Retorna null se não for um link do Drive ou não conseguir extrair.
 */
export function extractGDriveId(url) {
  if (!url || !url.includes('drive.google.com')) return null
  // /file/d/FILE_ID/
  const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)
  if (fileMatch) return fileMatch[1]
  // ?id=FILE_ID ou &id=FILE_ID
  const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/)
  if (idMatch) return idMatch[1]
  return null
}

/**
 * Retorna a URL resolvida para uso direto em mídia, de acordo com o tipo.
 * Se não for um link do Google Drive, retorna a URL original sem alteração.
 *
 * @param {string} url   - URL original do campo url_midia
 * @param {string} tipo  - 'imagem' | 'audio' | 'video'
 * @returns {{ url: string, useIframe: boolean }}
 */
export function resolveMediaUrl(url, tipo) {
  if (!url) return { url, useIframe: false }

  const id = extractGDriveId(url)

  if (!id) {
    // Não é Google Drive — trata YouTube normalmente
    return { url: toYoutubeEmbed(url), useIframe: isEmbeddable(url) }
  }

  switch (tipo) {
    case 'imagem':
      // O preview do Drive é a forma mais confiável — funciona como iframe
      // sem problemas de CORS ou redirect para login
      return {
        url: `https://drive.google.com/file/d/${id}/preview`,
        useIframe: true,
      }

    case 'audio':
    case 'video':
      // O preview do Drive tem player nativo para áudio e vídeo
      return {
        url: `https://drive.google.com/file/d/${id}/preview`,
        useIframe: true,
      }

    default:
      return { url, useIframe: false }
  }
}

// ─── helpers internos ────────────────────────────────────────────────────────

function toYoutubeEmbed(url) {
  if (!url) return url
  if (url.includes('/embed/')) return url
  const short = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/)
  if (short) return `https://www.youtube.com/embed/${short[1]}`
  const watch = url.match(/[?&]v=([a-zA-Z0-9_-]+)/)
  if (watch) return `https://www.youtube.com/embed/${watch[1]}`
  const vimeo = url.match(/vimeo\.com\/(\d+)/)
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`
  return url
}

function isEmbeddable(url) {
  return (
    url.includes('youtube.com/embed') ||
    url.includes('youtu.be')          ||
    url.includes('youtube.com/watch') ||
    url.includes('vimeo.com')
  )
}
