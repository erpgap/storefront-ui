import { createPage, expect, signIn, test } from './fixtures'

/**
 * The SEO dialog shows the page's structured data, read-only.
 *
 * Odoo computes it - a breadcrumb for a content page, the business for the
 * homepage - so there is nothing to edit. It is shown so a merchant can see
 * what search engines are told about the page.
 */
test('the SEO dialog shows the generated structured data', async ({ page }) => {
  await signIn(page)
  const name = await createPage(page, 'Structured Data')

  // Published, because the preview describes a page at a real address.
  await page.getByRole('button', { name: 'SEO' }).click()
  const dialog = page.getByRole('dialog', { name: /SEO/ })
  await expect(dialog).toBeVisible()

  const preview = dialog.locator('pre')
  await expect(preview).toBeVisible()

  const text = await preview.innerText()
  expect(text).toContain('BreadcrumbList')
  // The page's own name, so this is this page's data and not a fixed sample.
  expect(text).toContain(name)

  // Read-only: no field to type into, and nothing that submits it.
  await expect(dialog.locator('textarea[name*="json" i]')).toHaveCount(0)
  await expect(dialog.locator('input[name*="json" i]')).toHaveCount(0)
})
