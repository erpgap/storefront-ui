#!/usr/bin/env node
/**
 * CMS smoke tests.
 *
 * Runs against a RUNNING storefront with Odoo behind it, over HTTP only - no
 * browser, no dependencies. These are the checks that were being done by hand
 * after every change; having them here means they are done every time.
 *
 * They assert behaviour that must hold on any install, not the contents of
 * any particular page, so they are safe to point at staging or production.
 *
 *   BASE=http://localhost:3000 node test/smoke/cms.mjs
 *
 * Exits non-zero on the first failure, so CI can gate a deploy on it.
 */

const BASE = (process.env.BASE || 'http://localhost:3000').replace(/\/$/, '')
const TIMEOUT = Number(process.env.SMOKE_TIMEOUT || 60000)

let passed = 0
const failures = []

async function get(path, options = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT)
  try {
    const response = await fetch(`${BASE}${path}`, {
      redirect: 'manual',
      signal: controller.signal,
      ...options,
    })
    return { status: response.status, body: await response.text(), headers: response.headers }
  }
  finally {
    clearTimeout(timer)
  }
}

async function check(name, fn) {
  try {
    await fn()
    passed++
    console.log(`  ok    ${name}`)
  }
  catch (error) {
    failures.push({ name, message: error.message })
    console.log(`  FAIL  ${name}\n          ${error.message}`)
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

// --------------------------------------------------------------------------

console.log(`\nCMS smoke tests against ${BASE}\n`)

console.log('reachability')
await check('the storefront responds', async () => {
  const { status } = await get('/')
  assert(status === 200, `/ returned ${status}`)
})

await check('the published-page API responds', async () => {
  const { status } = await get('/api/cms/published?slug=/')
  assert(status === 200, `expected 200, got ${status}`)
})

console.log('\nrouting')
await check('an unknown url is a 404, not an empty 200', async () => {
  // The catch-all must not answer 200 for every url on the site.
  const { status } = await get('/definitely-not-a-real-page-xyz')
  assert(status === 404, `expected 404, got ${status}`)
})

await check('the published API reports nothing for an unknown slug', async () => {
  // Nitro answers 204 for a null result, which is the right answer - the
  // point is that it is not an error and carries no page.
  const { status, body } = await get('/api/cms/published?slug=/definitely-not-real-xyz')
  assert([200, 204].includes(status), `expected 200 or 204, got ${status}`)
  assert(body.trim() === '' || body.trim() === 'null', `expected no page, got ${body.slice(0, 60)}`)
})

await check('the published API rejects a missing slug', async () => {
  const { status } = await get('/api/cms/published')
  assert(status === 400, `expected 400, got ${status}`)
})

console.log('\nauthorisation')
await check('the studio redirects an anonymous visitor to the login', async () => {
  const { status, headers } = await get('/studio')
  assert([301, 302, 307, 308].includes(status), `expected a redirect, got ${status}`)
  assert(/login/.test(headers.get('location') || ''), 'should redirect to the login')
})

await check('an anonymous visitor cannot list pages', async () => {
  const { status } = await get('/api/cms/pages')
  assert(status >= 400, `expected a refusal, got ${status}`)
})

await check('an anonymous visitor cannot create a page', async () => {
  const { status } = await get('/api/cms/pages', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ title: 'smoke-should-not-exist' }),
  })
  assert(status >= 400, `expected a refusal, got ${status}`)
})

await check('an anonymous visitor is not an editor', async () => {
  const { status, body } = await get('/api/cms/session')
  assert(status === 200, `expected 200, got ${status}`)
  assert(JSON.parse(body).canEdit === false, 'canEdit should be false')
})

console.log('\ncontent')
await check('the homepage renders a heading', async () => {
  // Whether from the CMS or the fallback markup, / must never be blank.
  const { body } = await get('/')
  assert(/<h1[\s>]/.test(body), 'no <h1> on the homepage')
})

await check('the homepage carries its SEO tags', async () => {
  const { body } = await get('/')
  assert(/<title[^>]*>[^<]+<\/title>/.test(body), 'no <title>')
  assert(/name="description"\s+content="[^"]+"/.test(body), 'no meta description')
  assert(/property="og:title"/.test(body), 'no og:title')
  assert(/rel="canonical"/.test(body), 'no canonical')
})

await check('the homepage keeps exactly one eagerly loaded image', async () => {
  // The hero is the LCP element. More than one eager image, or none, means
  // the loading strategy has drifted.
  const { body } = await get('/')
  const eager = (body.match(/loading="eager"/g) || []).length
  assert(eager === 1, `expected 1 eager image, found ${eager}`)
})

await check('page content is server-rendered, not client-only', async () => {
  // Blocks must be in the HTML for crawlers.
  const { body } = await get('/')
  const afterApp = body.split('<div id="__nuxt">')[1] || ''
  assert(afterApp.length > 2000, 'the server-rendered body looks empty')
})

console.log('\nregions')
await check('the region API answers for a declared region', async () => {
  const { status } = await get('/api/cms/region?key=category-after')
  assert([200, 204].includes(status), `expected 200 or 204, got ${status}`)
})

await check('the region API rejects a missing key', async () => {
  const { status } = await get('/api/cms/region')
  assert(status === 400, `expected 400, got ${status}`)
})

await check('an unknown region reads as nothing rather than erroring', async () => {
  const { status, body } = await get('/api/cms/region?key=no-such-region')
  assert([200, 204].includes(status), `expected 200 or 204, got ${status}`)
  assert(body.trim() === '' || body.trim() === 'null', `expected no region, got ${body.slice(0, 60)}`)
})

// --------------------------------------------------------------------------

console.log(`\n${passed} passed, ${failures.length} failed\n`)
if (failures.length) {
  for (const f of failures) console.error(`  ${f.name}: ${f.message}`)
  process.exit(1)
}
