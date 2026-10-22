import { addBlock, createPage, expect, signIn, test } from './fixtures'

/**
 * Empty text shows its field name on the canvas, for the block being edited.
 *
 * Now that blocks arrive with nothing written in them, a freshly added block
 * renders as very little - there is no way to see where the words will land.
 * The field name standing in its place answers that, the way the hatched box
 * answers it for a missing picture.
 *
 * Only the selected block: every other one has to look exactly as it will
 * publish, or the canvas stops being worth trusting.
 */
test('the selected block shows field names where its text will go', async ({ page }) => {
  await signIn(page)
  await createPage(page, 'Canvas Placeholders')
  await addBlock(page, /^Category Grid/)

  const canvas = page.locator('.cms-canvas')
  await expect(page.locator('aside[aria-label="Block settings"]')).toBeVisible()

  // The heading field's label, standing where the heading will be.
  const hint = canvas.getByText('Heading', { exact: true }).first()
  await expect(hint).toBeVisible()

  // And it has to read as a slot rather than as copy: a hatched background,
  // the same cue the missing-image box uses.
  await expect(hint).toHaveClass(/cms-text-placeholder/)
  const background = await hint.evaluate(el => getComputedStyle(el).backgroundImage)
  expect(background, 'the hint should be visibly hatched').toContain('repeating-linear-gradient')

  // Deselecting puts the block back to how it will actually publish.
  await page.keyboard.press('Escape')
  await expect(page.locator('aside[aria-label="Block settings"]')).toBeHidden()
  await expect(canvas.getByText('Heading', { exact: true })).toHaveCount(0)
})

test('a placeholder is never written into the page', async ({ page }) => {
  await signIn(page)
  await createPage(page, 'Placeholder Not Saved')
  await addBlock(page, /^Category Grid/)

  // Whatever the canvas shows, the field itself stays empty - so publishing
  // cannot turn a hint into content.
  const heading = page.locator('aside[aria-label="Block settings"]').getByLabel('Heading')
  await expect(heading).toHaveValue('')
})

test('an empty button label draws no button', async ({ page }) => {
  await signIn(page)
  await createPage(page, 'No Fake Button')
  await addBlock(page, /^Image \+ Text/)

  const canvas = page.locator('.cms-canvas')

  // The copy fields are hinted...
  await expect(canvas.getByText('Heading', { exact: true }).first()).toBeVisible()

  // ...but the button is absent entirely, rather than rendered with its field
  // name inside it. An empty label means there is no button, and a styled
  // stand-in reads as a finished one.
  await expect(canvas.getByText('Button label', { exact: true })).toHaveCount(0)
  await expect(canvas.getByRole('link', { name: /button label/i })).toHaveCount(0)
})

test('the hint is visible on a dark block, not painted black on black', async ({ page }) => {
  await signIn(page)
  await createPage(page, 'Dark Placeholder')
  await addBlock(page, /^Newsletter/)

  const hint = page.locator('.cms-text-placeholder').first()
  await expect(hint).toBeVisible()

  // The newsletter band is black and its text is white. Hardcoding a dark
  // colour here made the hint invisible while every assertion still passed -
  // it was applied, just unreadable. So this checks it against its own
  // background rather than checking that a class exists.
  const seen = await hint.evaluate((el) => {
    const style = getComputedStyle(el)
    const luminance = (rgb: string) => {
      const [r, g, b] = (rgb.match(/\d+/g) ?? ['0', '0', '0']).map(Number)
      return (0.299 * r! + 0.587 * g! + 0.114 * b!) / 255
    }
    let node: HTMLElement | null = el
    let background = 'rgba(0, 0, 0, 0)'
    while (node && background === 'rgba(0, 0, 0, 0)') {
      background = getComputedStyle(node).backgroundColor
      node = node.parentElement
    }
    return { text: luminance(style.color), background: luminance(background) }
  })

  expect(
    Math.abs(seen.text - seen.background),
    'the hint must contrast with whatever it sits on',
  ).toBeGreaterThan(0.25)
})
