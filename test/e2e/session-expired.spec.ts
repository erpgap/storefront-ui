import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

/**
 * A shopper whose Odoo session dies while they browse their account.
 *
 * The storefront keeps its own `odoo-user` cookie, so after the `session_id`
 * cookie is gone (expired, deleted) or replaced with garbage, the header still
 * believes the user is signed in. Opening an account page must notice that,
 * send them to the login page with an explanation, and bring them back to the
 * page they asked for once they sign in again - not leave them on a blank
 * page with an error.
 *
 * Needs a real shopper account on the Odoo behind the storefront:
 *
 *   SHOPPER_EMAIL=... SHOPPER_PASSWORD=... yarn test:e2e session-expired
 */
const SHOPPER = {
  email: process.env.SHOPPER_EMAIL || '',
  password: process.env.SHOPPER_PASSWORD || '',
}

async function logIn(page: Page) {
  await page.goto('/login')
  // Typing before Vue hydrates is silently undone, see fixtures.ts.
  await page.waitForLoadState('networkidle')

  const email = page.locator('input[name="email"]')
  const password = page.locator('input[name="password"]')
  await email.fill(SHOPPER.email)
  await password.fill(SHOPPER.password)
  await expect(email).toHaveValue(SHOPPER.email)
  await expect(password).toHaveValue(SHOPPER.password)
  await page.getByRole('button', { name: 'Log in' }).click()

  await expect(page).toHaveURL(/\/my-account$/)
  await page.waitForLoadState('networkidle')
}

async function openPersonalData(page: Page) {
  await page.getByRole('link', { name: 'Personal Data' }).first().click()
}

async function expectSessionExpiredLogin(page: Page) {
  await expect(page).toHaveURL(/\/login\?/)
  const url = new URL(page.url())
  expect(url.searchParams.get('expired')).toBe('1')
  expect(url.searchParams.get('redirect')).toBe('/my-account/personal-data')
  await expect(page.getByTestId('login-page-session-expired')).toHaveText(
    'Your session has expired. Please log in again.',
  )
}

test.describe('expired session on the account pages', () => {
  test.skip(!SHOPPER.email || !SHOPPER.password, 'set SHOPPER_EMAIL and SHOPPER_PASSWORD')

  test.beforeEach(async ({ page }) => {
    await logIn(page)
  })

  test('a deleted session_id cookie sends the user to log in again', async ({ page, context }) => {
    await context.clearCookies({ name: 'session_id' })

    await openPersonalData(page)
    await expectSessionExpiredLogin(page)
  })

  test('a tampered session_id cookie sends the user to log in again', async ({ page, context }) => {
    const [session] = await context.cookies().then(all => all.filter(c => c.name === 'session_id'))
    expect(session, 'logging in should have set a session_id cookie').toBeTruthy()
    await context.addCookies([{ ...session, value: `${session.value.slice(0, -4)}dead` }])

    await openPersonalData(page)
    await expectSessionExpiredLogin(page)
  })

  test('logging in again returns to the page that was asked for', async ({ page, context }) => {
    await context.clearCookies({ name: 'session_id' })
    await openPersonalData(page)
    await expectSessionExpiredLogin(page)

    await page.waitForLoadState('networkidle')
    await page.locator('input[name="email"]').fill(SHOPPER.email)
    await page.locator('input[name="password"]').fill(SHOPPER.password)
    await page.getByRole('button', { name: 'Log in' }).click()

    await expect(page).toHaveURL(/\/my-account\/personal-data$/)
  })

  test('an off-site redirect is ignored', async ({ page, context }) => {
    await context.clearCookies({ name: 'session_id' })
    await page.goto('/login?redirect=//example.com')
    await page.waitForLoadState('networkidle')
    await page.locator('input[name="email"]').fill(SHOPPER.email)
    await page.locator('input[name="password"]').fill(SHOPPER.password)
    await page.getByRole('button', { name: 'Log in' }).click()

    await expect(page).toHaveURL(/\/my-account$/)
  })
})
