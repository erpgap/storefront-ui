// The Text Section's formatting, parsed into plain data the template renders
// as nodes - never HTML. Kept apart from the component so it is unit tested.

export interface Inline {
  text: string
  href?: string
}

export type RichParagraph =
  | { kind: 'p', parts: Inline[] }
  | { kind: 'ul', items: Inline[][] }

// What an <a href> may point at. Anything else - javascript: above all -
// keeps its label as text and loses the link.
const SAFE_HREF = /^(\/|https?:\/\/|mailto:|tel:)/
const LINK = /\[([^\]]+)\]\(([^)\s]+)\)/g

export function parseInline(text: string): Inline[] {
  const parts: Inline[] = []
  let last = 0
  for (const match of text.matchAll(LINK)) {
    const [whole, label, href] = match
    const start = match.index ?? 0
    if (start > last) parts.push({ text: text.slice(last, start) })
    parts.push(SAFE_HREF.test(href!) ? { text: label!, href } : { text: label! })
    last = start + whole.length
  }
  if (last < text.length) parts.push({ text: text.slice(last) })
  return parts
}

/**
 * Blank lines separate paragraphs. A paragraph whose every line starts with
 * "- " is a bulleted list; otherwise its lines join into one paragraph.
 */
export function parseRichText(body: string): RichParagraph[] {
  return body
    .split(/\n{2,}/)
    .map(part => part.trim())
    .filter(Boolean)
    .map((part): RichParagraph => {
      const lines = part.split('\n').map(line => line.trim())
      return lines.every(line => line.startsWith('- '))
        ? { kind: 'ul', items: lines.map(line => parseInline(line.slice(2))) }
        : { kind: 'p', parts: parseInline(lines.join(' ')) }
    })
}
