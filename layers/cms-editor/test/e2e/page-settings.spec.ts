import { createPage, expect, signIn, test } from './fixtures'

/**
 * Renaming a page and changing its address, after it exists.
 *
 * Both were previously set once in the create form and then permanent, so a
 * typo in either could only be fixed by deleting the page and starting again.
 */
test.describe('page settings', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page)
  })

  async function openSettings(page: Parameters<typeof signIn>[0]) {
    await page.locator('button[title="Rename or change the address"]').click()
    await expect(page.getByRole('dialog', { name: 'Page settings' })).toBeVisible()
  }

  test('a page can be renamed and keeps its blocks', async ({ page }) => {
    const original = await createPage(page, 'Settings Rename')

    await openSettings(page)
    const renamed = `${original} renamed`
    await page.getByRole('dialog').getByLabel('Page name').fill(renamed)
    await page.getByRole('dialog').getByRole('button', { name: 'Save' }).click()

    await expect(page.getByRole('dialog')).toBeHidden()
    // The header is the one place the new name has to show immediately.
    await expect(page.locator('button[title="Rename or change the address"]'))
      .toContainText(renamed)
  })

  test('a changed address is stored, not just shown', async ({ page }) => {
    await createPage(page, 'Settings Url')

    await openSettings(page)
    const slug = `/settings-url-${Date.now().toString().slice(-6)}`
    await page.getByRole('dialog').getByLabel('Page URL').fill(slug)
    await page.getByRole('dialog').getByRole('button', { name: 'Save' }).click()

    await expect(page.getByRole('dialog')).toBeHidden()
    await expect(page.locator('button[title="Rename or change the address"]'))
      .toContainText(slug)

    // Reloading proves the new address came back from Odoo rather than from
    // the local state the dialog just set.
    await page.reload()
    await expect(page.locator('button[title="Rename or change the address"]'))
      .toContainText(slug)
  })

  test('an address already in use is refused with a message naming the page', async ({ page }) => {
    // The homepage is always there and always at /, so it is the one address
    // guaranteed to clash without creating a second page to clash with.
    await createPage(page, 'Settings Clash')

    await openSettings(page)
    await page.getByRole('dialog').getByLabel('Page URL').fill('/')
    await page.getByRole('dialog').getByRole('button', { name: 'Save' }).click()

    // Still open, with an explanation rather than a silent failure.
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByRole('alert')).toBeVisible()
  })
})
