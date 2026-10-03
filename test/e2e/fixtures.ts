import { expect, test as base } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'

/**
 * Signing in is the preamble to every studio test, and creating a page is the
 * preamble to most. Both live here so a failure in one of them reads as what
 * it is rather than as a failure of whatever was actually being tested.
 */
export const EDITOR = {
  email: process.env.CMS_EDITOR_EMAIL || 'admin@example.com',
  password: process.env.CMS_EDITOR_PASSWORD || 'admin',
}

export async function signIn(page: Page) {
  await page.goto('/studio')

  // The guard redirects from the client, so the URL is still /studio for a
  // moment after navigation. Wait for whichever screen actually arrives
  // rather than reading the URL and racing it.
  const emailField = page.locator('input[autocomplete="username"]')
  const newPageButton = page.getByRole('button', { name: 'New page' })
  await expect(emailField.or(newPageButton).first()).toBeVisible()

  if (await emailField.isVisible()) {
    // Typing before Vue hydrates is silently undone: the component mounts,
    // binds the input to an empty model and wipes what was there. Wait for
    // the app to settle, then assert the values stuck before submitting, so
    // a recurrence fails here with an obvious message.
    await page.waitForLoadState('networkidle')

    const passwordField = page.locator('input[autocomplete="current-password"]')
    await emailField.fill(EDITOR.email)
    await passwordField.fill(EDITOR.password)
    await expect(emailField).toHaveValue(EDITOR.email)
    await expect(passwordField).toHaveValue(EDITOR.password)

    await page.getByRole('button', { name: 'Sign in' }).click()

    // A wrong password or an unreachable Odoo surfaces here, where the
    // message is about signing in, rather than as a confusing failure in
    // whatever test happens to be running.
    const error = page.getByRole('alert')
    await expect(newPageButton.or(error).first()).toBeVisible()
    if (await error.isVisible()) {
      throw new Error(`Could not sign in: ${await error.innerText()}`)
    }
  }

  await expect(newPageButton).toBeVisible()

  // Visible is not the same as interactive. The list is server-rendered, so
  // its buttons exist in the html before Vue has attached anything to them,
  // and a click that lands in that window does nothing at all. Every test
  // starts here, so waiting once covers all of them.
  await page.waitForLoadState('networkidle')
}

/**
 * Pages created during a test, so they can be removed when it ends.
 *
 * Keyed by Page rather than global, because specs run in parallel and one
 * worker must not delete another's fixtures.
 */
const createdPages = new Map<Page, string[]>()

/** A page nobody else is using, so tests cannot interfere with each other. */
export async function createPage(page: Page, label: string) {
  const name = `${label} ${Date.now().toString().slice(-6)}`
  await page.getByRole('button', { name: 'New page' }).click()
  await page.getByPlaceholder('Summer Sale').fill(name)
  await page.getByRole('button', { name: 'Create and edit' }).click()
  await expect(page).toHaveURL(/\/studio\/\d+/)
  // Wait for the editor itself, not just the url. The palette is open on a
  // fresh page, so its presence is the signal that the editor is ready.
  await expect(page.locator('aside[aria-label="Blocks"]')).toBeVisible()

  const id = /\/studio\/(\d+)/.exec(page.url())?.[1]
  if (id) createdPages.set(page, [...(createdPages.get(page) ?? []), id])

  return name
}

/**
 * Every test cleans up the pages it created.
 *
 * Without this the suite leaks a page per test into Odoo, and those pages are
 * real routes: the routes generator turns each one into an entry that every
 * later build and dev boot has to carry. Left alone it compounds until the
 * generated route types get big enough to be a problem of their own.
 *
 * Deletion goes through the api with the browser's own session, so it is
 * subject to the same permission check as the studio. Failures are swallowed
 * deliberately - a test that proved its point should not then fail in
 * teardown, and the next run tolerates a leftover page.
 */
export const test = base.extend<object>({
  page: async ({ page }, use) => {
    await use(page)

    const ids = createdPages.get(page) ?? []
    createdPages.delete(page)

    for (const id of ids) {
      await page.request.delete(`/api/cms/pages/${id}`).catch(() => {})
    }
  },
})

export { expect }

/**
 * Adds a block from the palette.
 *
 * Selecting a block closes the palette - deliberately, so two drawers never
 * cover the thing being edited - so adding a second one means reopening it.
 * That is what a merchant does, and a test that skips it is testing a studio
 * nobody uses.
 *
 * Located by attribute rather than by role: an <aside> does not reliably
 * expose the complementary role here, and a role query that silently matches
 * nothing reads as "the palette is closed" and waits for a button that is
 * not there.
 */
export async function addBlock(page: Page, label: string | RegExp) {
  const palette = page.locator('aside[aria-label="Blocks"]')
  const openButton = page.getByRole('button', { name: 'Add blocks' })

  // isVisible() does not wait, so asking it before the editor has rendered
  // answers "no" and sends this looking for a button that is not there yet.
  // Wait for whichever state the editor is actually in first.
  await expect(palette.or(openButton).first()).toBeVisible()

  if (!(await palette.isVisible())) {
    await openButton.click()
    await expect(palette).toBeVisible()
  }

  await palette.getByRole('button', { name: label }).click()
}

/**
 * Publishes and waits for it to land.
 *
 * Clicking and moving on is a race: the button returns immediately, the
 * request does not. A test that then opens the version history sees the
 * state from before it published, which reads as a missing revision rather
 * than as the timing problem it is.
 */
export async function publish(page: Page) {
  const response = page.waitForResponse(
    r => /\/api\/cms\/pages\/\d+\/publish/.test(r.url()) && r.request().method() === 'POST',
  )
  await page.getByRole('button', { name: /^Publish/ }).click()
  const result = await response
  expect(result.status(), 'publish should succeed').toBeLessThan(400)
}

/**
 * Waits for the autosave to reach the server.
 *
 * The save is debounced, so the moment after typing the draft exists only in
 * the browser. Reading the status label instead is a race against the
 * debounce; waiting for the request is not.
 */
export async function waitForDraftSaved(page: Page, act: () => Promise<void>) {
  const response = page.waitForResponse(
    r => /\/api\/cms\/pages\/\d+\/draft/.test(r.url()) && r.request().method() === 'PUT',
  )
  await act()
  const result = await response
  expect(result.status(), 'the draft should save').toBeLessThan(400)
}

/**
 * Drags with real pointer movement.
 *
 * The studio uses Pointer Events, not HTML5 drag, so Playwright's dragTo -
 * which drives the HTML5 pipeline - does nothing here. Moving the mouse in
 * steps produces the pointermove stream the studio actually listens to, and
 * is also what a person does.
 */
export async function dragOnto(page: Page, source: Locator, target: Locator, offsetY = 20) {
  const from = await source.boundingBox()
  const to = await target.boundingBox()
  if (!from || !to) throw new Error('drag source or target is not visible')

  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2)
  await page.mouse.down()
  // Several steps: one jump would clear the threshold but produce a single
  // pointermove, and the drop indicator would never be computed.
  await page.mouse.move(to.x + to.width / 2, to.y + offsetY, { steps: 20 })
  await page.mouse.up()
}
