import { addBlock, createPage, dragOnto, expect, publish, signIn, test, waitForDraftSaved } from './fixtures'

test.describe('the editor', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page)
  })

  test('a new page starts empty', async ({ page }) => {
    // It used to arrive with a hero already on it, guessing at what the
    // merchant wanted. A block they must delete is worse than one they add.
    await createPage(page, 'E2E Blank')

    await expect(page.locator('.cms-block')).toHaveCount(0)
    await expect(page.getByText(/drag a block here/i)).toBeVisible()
  })

  test('clicking a block in the palette adds it', async ({ page }) => {
    await createPage(page, 'E2E Click')

    await addBlock(page, /^Text Section/)

    await expect(page.locator('.cms-block')).toHaveCount(1)
    await expect(page.locator('aside[aria-label="Block settings"]')).toBeVisible()
  })

  test('an insert point places a block at an exact position', async ({ page }) => {
    // Choosing the position must never depend on drag-and-drop working.
    await createPage(page, 'E2E Insert')
    await addBlock(page, /^Text Section/)
    await addBlock(page, /^Newsletter/)
    await expect(page.locator('.cms-block')).toHaveCount(2)

    // Arm the slot before the first block, then pick from the palette.
    await page.locator('[data-cms-insert-index="0"]').hover()
    await page.locator('[data-cms-insert-index="0"] button').click()
    await expect(page.getByText(/inserting at 1/i)).toBeVisible()
    await page.locator('aside[aria-label="Blocks"]')
      .getByRole('button', { name: /^Hero Banner/ }).click()

    await expect(page.locator('.cms-block')).toHaveCount(3)
    const first = page.locator('[data-cms-block-index="0"]')
    await expect(first).toContainText(/hero banner/i)
  })

  test('a block can be dragged from the palette onto the page', async ({ page }) => {
    await createPage(page, 'E2E Drag')
    await addBlock(page, /^Text Section/)
    await expect(page.locator('.cms-block')).toHaveCount(1)

    await page.getByRole('button', { name: 'Add blocks' }).click()
    await dragOnto(
      page,
      page.locator('aside[aria-label="Blocks"]').getByRole('button', { name: /^Newsletter/ }),
      page.locator('.cms-block').first(),
    )

    await expect(page.locator('.cms-block')).toHaveCount(2)
  })

  test('a press without movement adds the block rather than dragging it', async ({ page }) => {
    // The drag threshold must not swallow ordinary clicks, or the one path
    // that works without a pointer stops working.
    await createPage(page, 'E2E Threshold')
    const tile = page.locator('aside[aria-label="Blocks"]')
      .getByRole('button', { name: /^Text Section/ })
    const box = (await tile.boundingBox())!

    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    await page.mouse.down()
    // Two pixels: real hands are never perfectly still.
    await page.mouse.move(box.x + box.width / 2 + 2, box.y + box.height / 2 + 1)
    await page.mouse.up()

    await expect(page.locator('.cms-block')).toHaveCount(1)
  })

  test('dropping a block adds exactly one', async ({ page }) => {
    // pointerup is followed by click, so without suppression a drop would
    // also run the tile's click handler and add a second block.
    await createPage(page, 'E2E Double')
    await addBlock(page, /^Text Section/)
    await page.getByRole('button', { name: 'Add blocks' }).click()

    await dragOnto(
      page,
      page.locator('aside[aria-label="Blocks"]').getByRole('button', { name: /^Newsletter/ }),
      page.locator('.cms-block').first(),
    )

    await expect(page.locator('.cms-block')).toHaveCount(2)
  })

  test('the toolbar arrows reorder blocks', async ({ page }) => {
    // The keyboard- and touch-accessible equivalent of dragging.
    await createPage(page, 'E2E Reorder')
    await addBlock(page, /^Text Section/)
    await addBlock(page, /^Newsletter/)

    const labelOf = (i: number) =>
      page.locator(`[data-cms-block-index="${i}"] .cms-block__toolbar span`).nth(1)
    await expect(labelOf(0)).toHaveText(/text section/i)

    await page.locator('[data-cms-block-index="1"]').hover()
    await page.locator('[data-cms-block-index="1"] button[aria-label$=" up"]').click()

    await expect(labelOf(0)).toHaveText(/newsletter/i)
  })

  test('typing in the inspector updates the page as you type', async ({ page }) => {
    // Live update is the reason the canvas is the real page rather than a
    // preview of it; if it ever stops working the whole premise goes.
    await createPage(page, 'E2E Live')
    await addBlock(page, /^Text Section/)

    const heading = page.locator('aside[aria-label="Block settings"]')
      .getByLabel('Heading')
    await heading.fill('Updated while typing')

    await expect(page.locator('.cms-block').first())
      .toContainText('Updated while typing')
  })

  test('a block that renders nothing still shows up and can be removed', async ({ page }) => {
    // Zero-height blocks were invisible, unselectable and undeletable.
    await createPage(page, 'E2E Empty')
    await addBlock(page, /^Featured Products/)

    const block = page.locator('.cms-block').first()
    await expect(block).toContainText(/nothing to show yet/i)
    const box = await block.boundingBox()
    expect(box!.height).toBeGreaterThan(40)

    await block.hover()
    await block.locator('button[aria-label^="Delete"]').click()
    await expect(page.locator('.cms-block')).toHaveCount(0)
  })

  test('undo reverses the last change', async ({ page }) => {
    await createPage(page, 'E2E Undo')
    await addBlock(page, /^Text Section/)
    await expect(page.locator('.cms-block')).toHaveCount(1)

    await page.getByRole('button', { name: 'Undo' }).click()

    await expect(page.locator('.cms-block')).toHaveCount(0)
  })

  test('publishing makes the page visible at its own url', async ({ page }) => {
    await createPage(page, 'E2E Publish')
    await addBlock(page, /^Text Section/)

    const marker = `Published at ${Date.now()}`
    await page.locator('aside[aria-label="Block settings"]')
      .getByLabel('Heading').fill(marker)

    // The slug is shown in the header; read it rather than reconstructing it.
    const slug = (await page.locator('header p').nth(1).innerText()).trim()

    await publish(page)
    await expect(page.getByRole('link', { name: /view live/i })).toBeVisible()

    await page.goto(slug)
    await expect(page.locator('body')).toContainText(marker)
  })

  test('a draft never reaches the live page', async ({ page }) => {
    // The guarantee the whole draft/published split exists for.
    await createPage(page, 'E2E Draft')
    await addBlock(page, /^Text Section/)
    const inspector = page.locator('aside[aria-label="Block settings"]')
    await inspector.getByLabel('Heading').fill('Published copy')
    const slug = (await page.locator('header p').nth(1).innerText()).trim()
    await publish(page)
    await expect(page.getByRole('link', { name: /view live/i })).toBeVisible()

    await waitForDraftSaved(page, () =>
      inspector.getByLabel('Heading').fill('SECRET UNPUBLISHED EDIT'))

    await page.goto(slug)
    await expect(page.locator('body')).toContainText('Published copy')
    await expect(page.locator('body')).not.toContainText('SECRET UNPUBLISHED EDIT')
  })

  test('an earlier version can be restored', async ({ page }) => {
    await createPage(page, 'E2E History')
    await addBlock(page, /^Text Section/)
    const heading = page.locator('aside[aria-label="Block settings"]')
      .getByLabel('Heading')

    await heading.fill('First version')
    await publish(page)
    await expect(page.getByRole('link', { name: /view live/i })).toBeVisible()

    await heading.fill('Second version')
    await publish(page)

    await page.getByRole('button', { name: 'History' }).click()
    const dialog = page.getByRole('dialog', { name: 'Version history' })
    await expect(dialog.getByText('Version 2')).toBeVisible()

    page.once('dialog', d => d.accept())
    await dialog.getByRole('button', { name: 'Restore' }).last().click()

    await expect(page.locator('.cms-block').first()).toContainText('First version')
  })
})

test.describe('the editor, unauthenticated', () => {
  test('is not reachable', async ({ page }) => {
    await page.goto('/cms')
    await expect(page).toHaveURL(/\/cms\/login/)
  })
})
