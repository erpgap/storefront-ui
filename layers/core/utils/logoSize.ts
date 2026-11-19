/**
 * The height, in em of the place's font size, to show a logo of this
 * width-to-height ratio at: a wordmark as wide as the text logo it stands
 * for (about 5.1em at its letter spacing), so its capitals are as tall.
 */
export function logoHeightEm(ratio: number): number {
  return ratio > 0 ? 5.1 / ratio : 1
}
