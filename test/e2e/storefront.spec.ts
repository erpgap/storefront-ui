import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

/**
 * The shopper's path through the storefront: browse, search, add to the cart,
 * get as far into checkout as Odoo allows, and sign up, log in and edit the
 * account. Placing an order is not covered: that needs a payment provider in
 * test mode behind the storefront.
 *
 * Needs a storefront with Odoo and its demo data behind it. The account it
 * uses is created here through the signup page, so nothing has to be set up:
 *
 *   yarn test:e2e storefront
 *
 * Each run signs up one new account. To have it archived afterwards, give
 * Odoo's database and an admin login (ODOO_URL defaults to
 * http://localhost:8069):
 *
 *   ODOO_DB=mydb ODOO_ADMIN_LOGIN=admin ODOO_ADMIN_PASSWORD=admin yarn test:e2e storefront
 */

// A product from Odoo's demo data, with a discount and a colour variant.
const PRODUCT = '/product/evening-clutch-210?color=black-996'

// Typing before Vue hydrates is silently undone, see the editor's fixtures.ts.
async function open(page: Page, url: string) {
  await page.goto(url)
  await page.waitForLoadState('networkidle')
}

async function addProductToCart(page: Page) {
  await open(page, PRODUCT)
  await page.getByRole('button', { name: 'Add to cart' }).click()
  await expect(page.getByRole('button', { name: 'Open cart' })).toContainText('1')
}

test.describe('browsing', () => {
  test('the home page shows its sections', async ({ page }) => {
    await open(page, '/')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Shop by Category' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Best Sellers' })).toBeVisible()
  })

  test('a category lists products that open their page', async ({ page }) => {
    await open(page, '/women')
    await expect(page.getByRole('heading', { name: 'Women', level: 1 })).toBeVisible()
    await expect(page.getByRole('main').getByText(/\d+ Products/).filter({ visible: true })).toBeVisible()

    const card = page.getByRole('main').locator('a[href^="/product/"]').first()
    const href = (await card.getAttribute('href'))!
    await card.click()
    await expect(page).toHaveURL(new RegExp(href.split('?')[0]!))
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Add to cart' })).toBeVisible()
  })

  test('a discounted product shows what you save', async ({ page }) => {
    await open(page, PRODUCT)
    await expect(page.getByRole('heading', { name: 'Evening Clutch', level: 1 })).toBeVisible()
    await expect(page.getByText(/You save \$\d+\.\d\d/)).toBeVisible()
  })

  test('an unknown page is a 404 with a way back', async ({ page }) => {
    const response = await page.goto('/no-such-page-anywhere')
    expect(response?.status()).toBe(404)
    await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Back to home' })).toBeVisible()
  })
})

test.describe('search', () => {
  test('on desktop a suggestion opens the product', async ({ page }) => {
    await open(page, '/')
    await page.getByRole('button', { name: 'Search' }).click()
    await page.getByRole('search').getByRole('textbox').fill('clutch')

    const suggestion = page.getByRole('search').getByRole('link').or(page.getByRole('option')).first()
    await expect(suggestion).toBeVisible()
    await suggestion.click()
    await expect(page).toHaveURL(/\/product\//)
  })

  test('on desktop Enter shows the results page', async ({ page }) => {
    await open(page, '/')
    await page.getByRole('button', { name: 'Search' }).click()
    const input = page.getByRole('search').getByRole('textbox')
    await input.fill('clutch')
    await input.press('Enter')
    await expect(page).toHaveURL(/\/search\?search=clutch/)
    await expect(page.getByText(/clutch/i).first()).toBeVisible()
  })

  test('searches the whole catalogue from any page', async ({ page }) => {
    // It used to take the current page's path as a category: on a product
    // page that matched no category, and nothing was ever suggested.
    await open(page, PRODUCT)
    await page.getByRole('button', { name: 'Search' }).click()
    await page.getByRole('search').getByRole('textbox').fill('jeans')
    await expect(page.getByRole('search').getByRole('link').or(page.getByRole('option')).first()).toBeVisible()
  })

  test.describe('on mobile', () => {
    test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })

    test('search opens from the header and Enter shows results', async ({ page }) => {
      await open(page, '/')
      await page.getByRole('button', { name: 'Search' }).click()
      const input = page.getByPlaceholder('Search')
      await expect(input).toBeVisible()
      await input.fill('clutch')
      await input.press('Enter')
      await expect(page).toHaveURL(/\/search\?search=clutch/)
      await expect(input).toBeHidden()
    })
  })
})

test.describe('cart and checkout', () => {
  test('a product added to the cart is in the cart page', async ({ page }) => {
    await addProductToCart(page)
    await open(page, '/cart')
    await expect(page.getByTestId('cart-product-card').first()).toContainText('Evening Clutch')
  })

  test('checkout marks what is missing before placing the order', async ({ page }) => {
    await addProductToCart(page)
    await open(page, '/checkout')
    await expect(page.getByRole('heading', { name: 'Checkout', level: 1 })).toBeVisible()
    await expect(page.getByTestId('order-summary')).toContainText('Evening Clutch')

    await page.getByRole('button', { name: /Place order/ }).first().click()
    // The first empty required field gets the focus.
    await expect(page.getByRole('textbox', { name: 'Name' })).toBeFocused()
    await expect(page).toHaveURL(/\/checkout$/)
  })

  test('the checkout lists the shipping methods', async ({ page }) => {
    await addProductToCart(page)
    await open(page, '/checkout')
    await expect(page.getByTestId('shipping-method')).toContainText('Standard delivery')
  })

  test('a complete checkout with no payment provider says why it stops', async ({ page }) => {
    // Odoo's demo data has no payment provider. With one set up, this is the
    // point where the order would be placed.
    test.skip(!!process.env.PAYMENT_PROVIDER, 'a payment provider is configured')

    await addProductToCart(page)
    await open(page, '/checkout')
    const main = page.getByRole('main')
    await main.getByRole('textbox', { name: 'Name' }).fill('Ada Tester')
    await main.getByRole('textbox', { name: 'Email' }).fill('ada.tester@example.com')
    await main.getByRole('textbox', { name: 'Phone' }).fill('+32 470 00 00 00')
    await main.getByRole('textbox', { name: 'Street' }).fill('Rue de la Loi 16')
    await main.getByRole('combobox', { name: 'Country' }).selectOption({ label: 'Belgium' })
    // Belgium has provinces, loaded once the country is chosen, and then one
    // is required. Clicking before they arrive would skip that check.
    const state = main.getByRole('combobox', { name: /^State/ })
    await expect(state).toBeEnabled()
    await state.selectOption({ index: 1 })
    await main.getByRole('textbox', { name: 'City' }).fill('Brussels')
    await main.getByRole('textbox', { name: 'ZIP Code' }).fill('1000')

    await expect(page.getByTestId('checkout-payment')).toContainText('No payment method is available')
    // One button in the summary on desktop, one under the payment on mobile.
    await page.getByRole('button', { name: /Place order/ }).filter({ visible: true }).first().click()
    await expect(page.getByRole('alert').filter({ hasText: 'No payment method is available' }).first()).toBeVisible()
    await expect(page).toHaveURL(/\/checkout$/)
  })

  test('checkout without a cart goes home', async ({ page }) => {
    await open(page, '/checkout')
    await expect(page).toHaveURL(/\/$|\/products$/)
  })

  test('the thank-you page without an order goes home', async ({ page }) => {
    await open(page, '/checkout/thank-you')
    await expect(page).toHaveURL(/\/$/)
  })

  test('the payment-fail page offers a way back', async ({ page }) => {
    await open(page, '/checkout/payment-fail')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/payment couldn.t be completed/)
    await page.getByRole('button', { name: 'Return to cart' }).click()
    await expect(page).toHaveURL(/\/cart$/)
  })
})

test.describe('accounts', () => {
  // One account for the whole block, made by the first test.
  test.describe.configure({ mode: 'serial' })

  const shopper = {
    email: `e2e.${Date.now()}@example.com`,
    password: 'E2e-shopper-2026',
    firstName: 'Ada',
    lastName: 'Tester',
  }

  // The storefront cannot delete an account, so every run would leave one
  // behind in Odoo. Given an Odoo admin login, it is archived afterwards.
  test.afterAll(async ({ request }) => {
    const { ODOO_DB, ODOO_ADMIN_LOGIN, ODOO_ADMIN_PASSWORD } = process.env
    if (!ODOO_DB || !ODOO_ADMIN_LOGIN || !ODOO_ADMIN_PASSWORD) return

    const odoo = (process.env.ODOO_URL || 'http://localhost:8069').replace(/\/+$/, '')
    const rpc = (path: string, params: Record<string, unknown>) =>
      request.post(`${odoo}${path}`, { data: { jsonrpc: '2.0', params } })

    // The session cookie it returns stays on `request` for the calls below.
    await rpc('/web/session/authenticate', {
      db: ODOO_DB,
      login: ODOO_ADMIN_LOGIN,
      password: ODOO_ADMIN_PASSWORD,
    })
    const found = await rpc('/web/dataset/call_kw', {
      model: 'res.users',
      method: 'search',
      args: [[['login', '=', shopper.email]]],
      kwargs: {},
    })
    const ids: number[] = (await found.json()).result ?? []
    if (ids.length) {
      await rpc('/web/dataset/call_kw', {
        model: 'res.users',
        method: 'write',
        args: [ids, { active: false }],
        kwargs: {},
      })
    }
  })

  async function logIn(page: Page, email: string, password: string) {
    await open(page, '/login')
    await page.getByRole('main').getByRole('textbox', { name: 'Email' }).fill(email)
    await page.getByRole('main').getByRole('textbox', { name: 'Password' }).fill(password)
    await page.getByRole('button', { name: 'Log in' }).click()
  }

  test('a wrong password says so, without the server address', async ({ page }) => {
    await logIn(page, 'nobody@example.com', 'wrong-password')
    const alert = page.getByRole('alert')
    await expect(alert).toBeVisible()
    await expect(alert).not.toContainText('[POST]')
    await expect(alert).not.toContainText('http')
    await expect(page).toHaveURL(/\/login/)
  })

  test('signing up logs you in', async ({ page }) => {
    await open(page, '/signup')
    await page.getByRole('main').getByRole('textbox', { name: 'First Name' }).fill(shopper.firstName)
    await page.getByRole('main').getByRole('textbox', { name: 'Last Name' }).fill(shopper.lastName)
    await page.getByRole('main').getByRole('textbox', { name: 'Email' }).fill(shopper.email)
    await page.getByRole('main').getByRole('textbox', { name: 'Password' }).fill(shopper.password)
    // The real checkbox sits under its drawn box, so click the label.
    await page.getByText(/I declare that I have read/).click()
    await expect(page.getByRole('checkbox', { name: /Terms and Conditions/ })).toBeChecked()
    await page.getByRole('button', { name: 'Create Account' }).click()
    await expect(page).toHaveURL(/\/my-account/)
  })

  test('signing up twice with one email is refused', async ({ page }) => {
    await open(page, '/signup')
    await page.getByRole('main').getByRole('textbox', { name: 'First Name' }).fill(shopper.firstName)
    await page.getByRole('main').getByRole('textbox', { name: 'Last Name' }).fill(shopper.lastName)
    await page.getByRole('main').getByRole('textbox', { name: 'Email' }).fill(shopper.email)
    await page.getByRole('main').getByRole('textbox', { name: 'Password' }).fill(shopper.password)
    // The real checkbox sits under its drawn box, so click the label.
    await page.getByText(/I declare that I have read/).click()
    await expect(page.getByRole('checkbox', { name: /Terms and Conditions/ })).toBeChecked()
    await page.getByRole('button', { name: 'Create Account' }).click()
    await expect(page.getByRole('alert')).toBeVisible()
    await expect(page.getByRole('alert')).not.toContainText('[POST]')
    await expect(page).toHaveURL(/\/signup/)
  })

  test('logging in greets the shopper by name', async ({ page }) => {
    await logIn(page, shopper.email, shopper.password)
    await expect(page).toHaveURL(/\/my-account$/)
    await expect(page.getByText(`Welcome back, ${shopper.firstName}`)).toBeVisible()
  })

  test('an account page asks for a login and comes back to it', async ({ page }) => {
    await open(page, '/my-account/personal-data')
    await expect(page).toHaveURL(/\/login\?redirect=/)
    await page.getByRole('main').getByRole('textbox', { name: 'Email' }).fill(shopper.email)
    await page.getByRole('main').getByRole('textbox', { name: 'Password' }).fill(shopper.password)
    await page.getByRole('button', { name: 'Log in' }).click()
    await expect(page).toHaveURL(/\/my-account\/personal-data$/)
    await expect(page.getByRole('main')).toContainText(shopper.email)
  })

  test('a product can be saved to the wishlist', async ({ page }) => {
    await logIn(page, shopper.email, shopper.password)
    await expect(page).toHaveURL(/\/my-account$/)
    await open(page, PRODUCT)
    await page.getByRole('main').getByRole('button', { name: 'Add to wishlist' }).first().click()
    const saved = page.getByRole('main').getByRole('button', { name: 'Remove from wishlist' }).first()
    await expect(saved).toBeVisible()

    // Kept in Odoo, not just on screen. Opened from the header on desktop and
    // from the menu on mobile, so the reload is what both have in common.
    await open(page, PRODUCT)
    await expect(saved).toBeVisible()

    // Leave the shopper's wishlist as it was.
    await saved.click()
    await expect(page.getByRole('main').getByRole('button', { name: 'Add to wishlist' }).first()).toBeVisible()
  })
})
