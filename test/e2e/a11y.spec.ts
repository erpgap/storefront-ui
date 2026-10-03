import { addBlock, createPage, expect, signIn, test } from './fixtures'

/**
 * Keyboard and screen-reader access to the studio.
 *
 * Drag-and-drop cannot be made accessible - it is a pointer gesture with no
 * keyboard equivalent - so every drag interaction here has a click
 * equivalent. These tests exist to stop that guarantee quietly lapsing: it is
 * the kind of thing that works on the day it is built and breaks the next
 * time someone restyles a toolbar.
 */
test.describe('studio accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page)
  })

  test('a block can be added without a pointer', async ({ page }) => {
    await createPage(page, 'A11y Keyboard')

    const tile = page.locator('aside[aria-label="Blocks"] button').first()
    await tile.focus()
    await expect(tile).toBeFocused()
    await page.keyboard.press('Enter')

    await expect(page.locator('.cms-block')).toHaveCount(1)
  })

  test('a block can be reordered without a pointer', async ({ page }) => {
    // The accessible equivalent of dragging.
    await createPage(page, 'A11y Reorder')
    await addBlock(page, /^Text Section/)
    await addBlock(page, /^Newsletter/)

    const second = page.locator('[data-cms-block-index="1"]')
    const up = second.locator('button[aria-label$=" up"]')
    await up.focus()
    await expect(up).toBeFocused()
    await page.keyboard.press('Enter')

    await expect(
      page.locator('[data-cms-block-index="0"] .cms-block__toolbar span').nth(1),
    ).toHaveText(/newsletter/i)
  })

  test('escape closes the inspector', async ({ page }) => {
    await createPage(page, 'A11y Escape')
    await addBlock(page, /^Text Section/)
    const inspector = page.locator('aside[aria-label="Block settings"]')
    await expect(inspector).toBeVisible()

    await page.keyboard.press('Escape')

    await expect(inspector).not.toBeVisible()
  })

  test('every block action is named for a screen reader', async ({ page }) => {
    // Icon-only buttons with no accessible name are unusable without sight,
    // and these are all icon-only.
    await createPage(page, 'A11y Labels')
    await addBlock(page, /^Text Section/)

    const block = page.locator('.cms-block').first()
    await block.hover()

    for (const pattern of [/^Select /, /^Move .* up$/, /^Move .* down$/, /^Duplicate /, /^Delete /]) {
      await expect(
        block.locator(`[aria-label]`).filter({ hasText: '' }).first(),
      ).toBeAttached()
      expect(
        await block.locator('[aria-label]').evaluateAll(
          (els, p) => els.some(e => new RegExp(p).test(e.getAttribute('aria-label') || '')),
          pattern.source,
        ),
        `no element labelled ${pattern}`,
      ).toBe(true)
    }
  })

  test('the drag handle is hidden from assistive tech', async ({ page }) => {
    // It is a pointer-only affordance with a keyboard equivalent beside it,
    // so announcing it would offer something that cannot be used.
    await createPage(page, 'A11y Handle')
    await addBlock(page, /^Text Section/)

    const handle = page.locator('[data-cms-drag-handle]').first()
    await expect(handle).toHaveAttribute('aria-hidden', 'true')
  })

  test('inspector fields are labelled', async ({ page }) => {
    await createPage(page, 'A11y Fields')
    await addBlock(page, /^Text Section/)

    const inspector = page.locator('aside[aria-label="Block settings"]')
    // getByLabel only finds controls with a real accessible label.
    await expect(inspector.getByLabel('Heading')).toBeVisible()
    await expect(inspector.getByLabel('Eyebrow')).toBeVisible()
  })

  test('the page has one first-level heading', async ({ page }) => {
    await page.goto('/studio')
    await expect(page.locator('h1')).toHaveCount(1)
  })
})
