import { addBlock, createPage, expect, signIn, test } from './fixtures'

/**
 * A new block arrives with no copy in it.
 *
 * Blocks used to ship with sample wording - "Shop by Category", "Best
 * Sellers", "Talk to us" - which reads as finished content. A merchant who
 * does not notice publishes someone else's words, and one who does notice has
 * to clear every field before writing their own.
 *
 * Choices are different: a dropdown has to say something, and "Section
 * (space above and below)" is a setting rather than copy.
 */
const BLOCKS = [
  /^Category Grid/,
  /^Products — Automatic/,
  /^Contact Form/,
  /^Newsletter/,
]

for (const block of BLOCKS) {
  test(`${String(block)} starts with empty text`, async ({ page }) => {
    await signIn(page)
    await createPage(page, 'Empty Defaults')
    await addBlock(page, block)

    const inspector = page.locator('aside[aria-label="Block settings"]')
    await expect(inspector).toBeVisible()

    // Every free-text control, including the multi-line ones.
    const texts = inspector.locator('input[type="text"], input:not([type]), textarea')
    const count = await texts.count()
    expect(count, 'the block should have text fields to check').toBeGreaterThan(0)

    const filled: string[] = []
    for (let i = 0; i < count; i++) {
      const field = texts.nth(i)
      // The picker's search box is a control, not content.
      if ((await field.getAttribute('type')) === 'search') continue
      const value = await field.inputValue()
      if (value.trim()) filled.push(value)
    }

    expect(filled, 'no text field should arrive pre-written').toEqual([])
  })
}
