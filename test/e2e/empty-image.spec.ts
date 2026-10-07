import { addBlock, createPage, expect, signIn, test } from './fixtures'

/**
 * A block whose image is not chosen yet draws a placeholder, not a broken icon.
 *
 * Merchants fill a block in from the top, so every image field is empty for a
 * while. A NuxtImg with an empty src renders an <img> with no source, which
 * the browser draws as a broken-image icon - saying "something is wrong" at
 * the moment nothing is, while the inspector already says "Image is required".
 */
test('a block with no image yet shows a placeholder, not a broken image', async ({ page }) => {
  await signIn(page)
  await createPage(page, 'Empty Image')
  await addBlock(page, /^Card Grid/)

  const canvas = page.locator('main')

  // The bug: an <img> that resolves to nothing. Either no src at all, or one
  // the browser could never load.
  const sourceless = canvas.locator('img:not([src]), img[src=""]')
  await expect(sourceless).toHaveCount(0)

  // Every image actually on the canvas has loaded, rather than sitting broken.
  const broken = await canvas.locator('img').evaluateAll(images =>
    images.filter(image => !(image as HTMLImageElement).complete
      || (image as HTMLImageElement).naturalWidth === 0).length)
  expect(broken, 'no image should be left broken').toBe(0)

  // And the space is held, so choosing a picture does not shift the layout.
  await expect(canvas.locator('.cms-image-placeholder').first()).toBeVisible()
})
