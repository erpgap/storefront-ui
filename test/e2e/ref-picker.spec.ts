import { addBlock, createPage, expect, signIn, test } from './fixtures'

/**
 * The product picker offers products without being typed at.
 *
 * It used to fetch only once the search box changed, while reporting itself as
 * pending the whole time, so opening it showed "Searching…" over an empty list
 * and a block whose products are required could not be filled in at all.
 */
test('the product picker lists products as soon as it opens', async ({ page }) => {
  await signIn(page)
  await createPage(page, 'Ref Picker')
  await addBlock(page, /^Featured Products/)

  const inspector = page.locator('aside[aria-label="Block settings"]')
  await expect(inspector).toBeVisible()

  // Open the picker the way a merchant does: click into the search box.
  const search = inspector.getByPlaceholder(/search/i).first()
  await search.click()

  // Options, not a spinner that never resolves.
  const options = inspector.getByRole('button', { name: /dress|shirt|boot|skirt|bag/i })
  await expect(options.first()).toBeVisible({ timeout: 15000 })

  await expect(inspector.getByText('Searching…')).toBeHidden()

  // And picking one satisfies the required field.
  await options.first().click()
  await expect(inspector.getByText('Products is required.')).toBeHidden()
})
