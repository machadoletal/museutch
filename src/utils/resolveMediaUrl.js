/**
 * resolveMediaUrl.js
 *
 * Converte links do Google Drive para URLs embeddáveis por tipo de mídia.
 *
 * Formatos de entrada suportados:
 *   https://drive.google.com/file/d/FILE_ID/view?usp=sharing
 *   https://drive.google.com/open?id=FILE_ID
 *   https://drive.google.com/uc?id=FILE_ID
 *
 * Estratégia por tipo:
 *   imagem → /thumbnail?id=ID&sz=wN  — retorna a imagem diretamente (sem UI do Drive)
 *   audio  → /file/d/ID/preview      — player nativo do Drive via iframe
 *   video  → /file/d/ID/preview      — player nativo do Drive via iframe
 */

export function extractGDriveId(url) {
  if (!url || !url.includes('drive.google.com')) return null
  const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)
  if (fileMatch) return fileMatch[1]
  const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/)
  if (idMatch) return idMatch[1]
  return null
}

/**
 * @param {string} url
 * @param {'imagem'|'audio'|'video'} tipo
 * @param {'compact'|'full'} size  — só relevante para imagem
 * @returns {{ url: string, useIframe: boolean }}
 */
export function resolveMediaUrl(url, tipo, size = 'full') {
  if (!url) return { url, useIframe: false }

  const id = extractGDriveId(url)

  if (!id) {
    return { url: toYoutubeEmbed(url), useIframe: isYoutubeOrVimeo(url) }
  }

  switch (tipo) {
    case 'imagem': {
      // Thumbnail endpoint: retorna a imagem diretamente, sem UI do Drive.
      // sz=w400 para preview compacto, sz=w1200 para modal expandida.
      const sz = size === 'compact' ? 'w400' : 'w1200'
      return {
        url: `https://drive.google.com/thumbnail?id=${id}&sz=${sz}`,
        useIframe: false,
      }
    }

    case 'audio':
    case 'video':
      return {
        url: `https://drive.google.com/file/d/${id}/preview`,
        useIframe: true,
      }

    default:
      return { url, useIframe: false }
  }
}

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

function isYoutubeOrVimeo(url) {
  return (
    url.includes('youtube.com') ||
    url.includes('youtu.be')    ||
    url.includes('vimeo.com')
  )
}
