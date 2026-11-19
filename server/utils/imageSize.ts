export interface ImageSize {
  width: number
  height: number
}

const ascii = (data: Uint8Array, start: number, length: number) =>
  String.fromCharCode(...data.subarray(start, start + length))

/**
 * An SVG's size: its width and height attributes when given in px (or
 * unitless), else its viewBox.
 */
function svgSize(data: Uint8Array): ImageSize | null {
  const text = new TextDecoder().decode(data.subarray(0, 8192))
  const tag = text.match(/<svg\b[^>]*>/i)?.[0]
  if (!tag) return null
  const attr = (name: string) => tag.match(new RegExp(`\\s${name}\\s*=\\s*["']\\s*([\\d.]+)(px)?\\s*["']`, 'i'))
  const width = attr('width'), height = attr('height')
  if (width && height) return { width: Number(width[1]), height: Number(height[1]) }
  const box = tag.match(/\sviewBox\s*=\s*["']\s*[-\d.]+[\s,]+[-\d.]+[\s,]+([\d.]+)[\s,]+([\d.]+)/i)
  return box ? { width: Number(box[1]), height: Number(box[2]) } : null
}

function jpegSize(data: Uint8Array, view: DataView): ImageSize | null {
  let offset = 2
  while (offset + 9 < data.length) {
    if (data[offset] !== 0xFF) return null
    const marker = data[offset + 1]!
    // Start of frame (baseline, progressive...): not DHT (C4), JPG (C8), DAC (CC).
    if (marker >= 0xC0 && marker <= 0xCF && ![0xC4, 0xC8, 0xCC].includes(marker)) {
      return { height: view.getUint16(offset + 5), width: view.getUint16(offset + 7) }
    }
    offset += 2 + view.getUint16(offset + 2)
  }
  return null
}

function webpSize(data: Uint8Array, view: DataView): ImageSize | null {
  const chunk = ascii(data, 12, 4)
  if (chunk === 'VP8 ') return { width: view.getUint16(26, true) & 0x3FFF, height: view.getUint16(28, true) & 0x3FFF }
  if (chunk === 'VP8L') {
    const [b1, b2, b3, b4] = [data[21]!, data[22]!, data[23]!, data[24]!]
    return { width: 1 + (((b2 & 0x3F) << 8) | b1), height: 1 + (((b4 & 0x0F) << 10) | (b3 << 2) | ((b2 & 0xC0) >> 6)) }
  }
  if (chunk === 'VP8X') {
    const u24 = (at: number) => data[at]! | (data[at + 1]! << 8) | (data[at + 2]! << 16)
    return { width: 1 + u24(24), height: 1 + u24(27) }
  }
  return null
}

/**
 * The width and height an image declares, read from the start of its file:
 * SVG, PNG, JPEG, WebP or GIF. Null for anything else or a broken file.
 */
export function imageSize(data: Uint8Array): ImageSize | null {
  if (data.length < 30) return svgSize(data)
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength)
  let size: ImageSize | null
  if (data[0] === 0x89 && ascii(data, 1, 3) === 'PNG') size = { width: view.getUint32(16), height: view.getUint32(20) }
  else if (ascii(data, 0, 4) === 'GIF8') size = { width: view.getUint16(6, true), height: view.getUint16(8, true) }
  else if (data[0] === 0xFF && data[1] === 0xD8) size = jpegSize(data, view)
  else if (ascii(data, 0, 4) === 'RIFF' && ascii(data, 8, 4) === 'WEBP') size = webpSize(data, view)
  else size = svgSize(data)
  return size && size.width > 0 && size.height > 0 ? size : null
}
