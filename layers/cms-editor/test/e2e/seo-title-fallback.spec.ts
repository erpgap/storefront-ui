import { createPage, expect, publish, signIn, test } from './fixtures'

/**
 * A page with no meta title is titled after itself.
 *
 * A merchant creates a page and publishes it long before they think about
 * search tags, and an untitled page is the one most likely to be shared. The
 * page's own name is always there and is always better than the site name or
 * a generic fallback.
 */
test('a published page with no meta title falls back to its name', async ({ page }) => {
  await signIn(page)
  const name = await createPage(page, 'Title Fallback')

  // Deliberately no SEO: this is the state the fallback exists for.
  await publish(page)

  const slug = (await page
    .locator('button[title="Rename or change the address"]')
    .innerText())
    .split('\n')
    .map(line => line.trim())
    .find(line => line.startsWith('/'))

  expect(slug, 'the header should show the page address').toBeTruthy()

  const response = await page.request.get(slug!)
  expect(response.status()).toBe(200)

  const html = await response.text()
  const title = /<title[^>]*>(.*?)<\/title>/s.exec(html)?.[1] ?? ''

  // The name as typed, not a site-wide default and not "Page page".
  expect(title).toContain(name)
})
