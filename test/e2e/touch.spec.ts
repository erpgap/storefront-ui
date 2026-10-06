import { addBlock, createPage, expect, signIn, test } from './fixtures'

/**
 * Drag on a touch screen.
 *
 * This is why the editor moved off HTML5 drag: that API predates the iPhone
 * and has no touch support at all, so a merchant on a tablet could not move
 * a block. Pointer Events give the same gesture one stream for mouse, touch
 * and pen.
 *
 * A tablet rather than a phone, because the editor is a two-drawer layout
 * that does not pretend to work at phone width.
 */
// Tablet dimensions and touch input, but explicitly on Chromium: the iPad
// device preset implies WebKit, which is not installed everywhere this runs.
test.use({
  viewport: { width: 1024, height: 1366 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
  defaultBrowserType: 'chromium',
})

test.describe('the editor on a touch screen', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page)
  })

  test('a block can be dragged from the palette with a finger', async ({ page }) => {
    await createPage(page, 'Touch Drag')
    await addBlock(page, /^Text Section/)
    await page.getByRole('button', { name: 'Add blocks' }).click()

    const tile = page.locator('aside[aria-label="Blocks"]')
      .getByRole('button', { name: /^Newsletter/ })
    const from = (await tile.boundingBox())!
    const to = (await page.locator('.cms-block').first().boundingBox())!

    await page.touchscreen.tap(1, 1).catch(() => {})
    // Dispatched directly: Playwright's touchscreen only taps, and a drag is
    // a sequence of moves. These are the same events a finger produces.
    await page.evaluate(async ({ from, to }) => {
      const target = document.elementFromPoint(
        from.x + from.width / 2, from.y + from.height / 2,
      )!
      const send = (type: string, x: number, y: number) =>
        target.dispatchEvent(new PointerEvent(type, {
          pointerId: 1, pointerType: 'touch', isPrimary: true,
          clientX: x, clientY: y, button: 0, buttons: 1, bubbles: true, cancelable: true,
        }))

      const startX = from.x + from.width / 2
      const startY = from.y + from.height / 2
      const endX = to.x + to.width / 2
      const endY = to.y + 20

      send('pointerdown', startX, startY)
      for (let step = 1; step <= 20; step++) {
        const x = startX + ((endX - startX) * step) / 20
        const y = startY + ((endY - startY) * step) / 20
        window.dispatchEvent(new PointerEvent('pointermove', {
          pointerId: 1, pointerType: 'touch', isPrimary: true,
          clientX: x, clientY: y, buttons: 1, bubbles: true, cancelable: true,
        }))
        await new Promise(r => setTimeout(r, 8))
      }
      window.dispatchEvent(new PointerEvent('pointerup', {
        pointerId: 1, pointerType: 'touch', isPrimary: true,
        clientX: endX, clientY: endY, bubbles: true, cancelable: true,
      }))
    }, { from, to })

    await expect(page.locator('.cms-block')).toHaveCount(2)
  })

  test('tapping a palette tile adds a block', async ({ page }) => {
    await createPage(page, 'Touch Tap')
    await page.locator('aside[aria-label="Blocks"]')
      .getByRole('button', { name: /^Text Section/ }).tap()

    await expect(page.locator('.cms-block')).toHaveCount(1)
  })

  test('the reorder arrows work by tap', async ({ page }) => {
    await createPage(page, 'Touch Reorder')
    await addBlock(page, /^Text Section/)
    await addBlock(page, /^Newsletter/)

    await page.locator('[data-cms-block-index="1"] button[aria-label$=" up"]').tap()

    await expect(
      page.locator('[data-cms-block-index="0"] .cms-block__toolbar span').nth(1),
    ).toHaveText(/newsletter/i)
  })
})
