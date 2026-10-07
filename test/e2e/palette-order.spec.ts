import { createPage, expect, signIn, test } from './fixtures'

/**
 * The palette is alphabetical.
 *
 * Block schemas are declared in rough page order, which is the order the
 * palette would show without the sort in layers/cms/blocks. Fifteen tiles in
 * an order only the source explains is a list a merchant has to read end to
 * end every time, so the sort is behaviour rather than tidiness - and this is
 * what keeps a newly added block from quietly landing at the bottom.
 */
test('the palette lists blocks alphabetically', async ({ page }) => {
  await signIn(page)
  await createPage(page, 'Palette Order')

  const palette = page.locator('aside[aria-label="Blocks"]')
  await expect(palette).toBeVisible()

  const labels = (await palette
    .locator('button[title] > span:first-child')
    .allTextContents()).map(label => label.trim())

  // Guards against the selector silently matching nothing, which would make
  // the comparison below pass on an empty list.
  expect(labels.length).toBeGreaterThan(1)
  expect(labels).toEqual([...labels].sort((a, b) => a.localeCompare(b)))
})
