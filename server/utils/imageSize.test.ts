import { describe, expect, it } from 'vitest'
import { imageSize } from './imageSize'

const bytes = (...parts: (number[] | string)[]) => new Uint8Array(parts.flatMap(part =>
  typeof part === 'string' ? [...part].map(char => char.charCodeAt(0)) : part))
const be32 = (n: number) => [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255]
const le16 = (n: number) => [n & 255, (n >>> 8) & 255]
const be16 = (n: number) => [(n >>> 8) & 255, n & 255]
const svg = (tag: string) => new TextEncoder().encode(`<?xml version="1.0"?>\n${tag}<path d="M0 0"/></svg>`)

describe('imageSize', () => {
  it('reads an SVG\'s width and height, or its viewBox', () => {
    expect(imageSize(svg('<svg xmlns="http://www.w3.org/2000/svg" width="507.1" height="74.7" viewBox="0 0 10 2">'))).toEqual({ width: 507.1, height: 74.7 })
    expect(imageSize(svg('<svg viewBox="50 -1510 10386 1530" xmlns="http://www.w3.org/2000/svg">'))).toEqual({ width: 10386, height: 1530 })
    expect(imageSize(svg('<svg width="100%" height="100%" viewBox="0 0 300 100">'))).toEqual({ width: 300, height: 100 })
  })

  it('reads PNG, GIF, JPEG and WebP headers', () => {
    expect(imageSize(bytes([0x89], 'PNG', [13, 10, 26, 10, 0, 0, 0, 13], 'IHDR', be32(280), be32(140), new Array(20).fill(0)))).toEqual({ width: 280, height: 140 })
    expect(imageSize(bytes('GIF89a', le16(64), le16(32), new Array(30).fill(0)))).toEqual({ width: 64, height: 32 })
    // SOI, an APP0 segment of 16 bytes, then SOF0 with height 90, width 300.
    expect(imageSize(bytes([0xFF, 0xD8, 0xFF, 0xE0], be16(16), new Array(14).fill(0), [0xFF, 0xC0], be16(17), [8], be16(90), be16(300), new Array(12).fill(0)))).toEqual({ width: 300, height: 90 })
    expect(imageSize(bytes('RIFF', [0, 0, 0, 0], 'WEBPVP8X', [10, 0, 0, 0, 0, 0, 0, 0], [199, 0, 0], [49, 0, 0], new Array(10).fill(0)))).toEqual({ width: 200, height: 50 })
  })

  it('gives null for what it cannot read', () => {
    expect(imageSize(new TextEncoder().encode('not an image at all, just some text here'))).toBeNull()
    expect(imageSize(svg('<svg xmlns="http://www.w3.org/2000/svg">'))).toBeNull()
  })
})
