#!/usr/bin/env node
/**
 * Cache warmer (HTTP — no browser, no dependencies).
 *
 * Hits the storefront so the SSR runs each query and Redis caches the result —
 * the same cache key a real visitor reads (everything here is URL-param driven).
 *
 * Always warms, for BOTH desktop and mobile:
 *   - Every product page          → /product/<slug>
 *   - Every category/listing page → /products, /women, /men, child categories,
 *                                   AND every pagination page (?page=2..N)
 *   - Static pages from the sitemap → /, /about, /faq, …
 *
 * It does NOT touch search, and adds NO ?color / sort / filter params.
 *
 * Target = the storefront URL from the app's own NUXT_PUBLIC_MIDDLEWARE_URL
 * (the site URL — NOT Odoo). It MUST be set in the environment.
 *
 * Run (with the app env loaded so NUXT_PUBLIC_MIDDLEWARE_URL is set):
 *   source .env && node scripts/warm-cache.mjs
 *
 * The listing page size comes from the app's single source of truth
 * (shared/listing.mjs), so the warmer can never drift from the storefront.
 * Tweak CONCURRENCY below if needed.
 */

import { LISTING_PAGE_SIZE } from '../shared/listing.mjs'

const BASE = (process.env.NUXT_PUBLIC_MIDDLEWARE_URL || '').replace(/\/+$/, '')
if (!BASE) {
  console.error('✗ NUXT_PUBLIC_MIDDLEWARE_URL is not set — set it (the storefront site URL) and re-run, e.g.:\n    source .env && node scripts/warm-cache.mjs')
  process.exit(1)
}
const CONCURRENCY = 8                  // parallel requests (edit here if needed)
const DEVICES = ['desktop', 'mobile'] // always both (page cache keys on the user-agent)

const UA = {
  desktop: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36',
  mobile: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
}

const locs = (xml) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].trim())
async function getText(url) { try { const r = await fetch(url); return r.ok ? await r.text() : '' } catch { return '' } }

// Normalize any sitemap URL to the warm target (BASE), regardless of the host
// the sitemap embeds.
const toBase = (loc) => {
  try { const u = new URL(loc); return `${BASE}${u.pathname}${u.search}` }
  catch { return loc }
}

// The sitemap is the single source of truth for every URL (built from the
// Odoo-populated slug store). The warmer reads it and references NO app queries,
// so changing any query in the app never requires a change here. `predicate`
// picks which sub-sitemaps to pull from the index. NOTE: if the slug store is
// empty (e.g. a flushed cache, or before Odoo has synced), products/categories
// will be empty here — the sitemap must be populated for the warmer to work.
async function subSitemapLocs(predicate) {
  const index = await getText(`${BASE}/sitemap_index.xml`)
  const subSitemaps = locs(index).length ? locs(index) : [`${BASE}/sitemap.xml`]
  const urls = new Set()
  for (const sm of subSitemaps) {
    if (!predicate(sm)) continue
    for (const loc of locs(await getText(toBase(sm)))) urls.add(toBase(loc))
  }
  return [...urls]
}

// Every product detail page — from the products sub-sitemap.
const allProducts = () => subSitemapLocs(sm => /product/i.test(sm))

// Every category/listing page — the global catalog page + the categories sub-sitemap.
async function allListings() {
  const out = new Set([`${BASE}/products`])
  for (const u of await subSitemapLocs(sm => /categor/i.test(sm))) out.add(u)
  return [...out]
}

// Static / content pages — every sub-sitemap that isn't products or categories.
const sitemapPages = () => subSitemapLocs(sm => !/product|categor/i.test(sm))

let done = 0, failed = 0
async function fetchPage(url, device) {
  try {
    const r = await fetch(url, { headers: { 'user-agent': UA[device], accept: 'text/html' } })
    const body = await r.text() // drain so SSR fully executes (and caches)
    done++
    if (!r.ok) failed++
    return { ok: r.ok, body }
  } catch { done++; failed++; return { ok: false, body: '' } }
}
const warm = async (url, device) => (await fetchPage(url, device)).ok

// Warm a listing's pages 1..N. N is computed from the product count on page 1
// and LISTING_PAGE_SIZE — the app's single source of truth (shared/listing.mjs),
// the exact same value the storefront paginates by — so the warmer can never
// drift out of sync. We request valid pages only (no out-of-range 404, which
// would log a fatal error).
let listingPages = 0 // total pagination pages warmed across all listings (per device)
async function warmListing(listingUrl, device) {
  const { ok, body } = await fetchPage(listingUrl, device)
  if (!ok) return
  const m = body.match(/font-semibold tabular-nums">([\d,]+)<\/span>/)
  const total = m ? Number(m[1].replace(/,/g, '')) : 0
  const pages = Math.max(1, Math.ceil(total / LISTING_PAGE_SIZE)) // this listing's own page count
  listingPages += pages
  for (let p = 2; p <= pages; p++) await warm(`${listingUrl}?page=${p}`, device)
}

async function pool(items, n, fn) {
  let i = 0
  await Promise.all(Array.from({ length: Math.min(n, items.length) || 1 }, async () => {
    while (i < items.length) await fn(items[i++])
  }))
}

async function main() {
  const t0 = Date.now()
  console.log(`Warming ${BASE}`)
  const [products, listings, pages] = await Promise.all([allProducts(), allListings(), sitemapPages()])
  console.log(`  products: ${products.length} | listings: ${listings.length} (×ALL pages) | pages: ${pages.length} × desktop+mobile\n`)

  const flat = [...products, ...pages]
  for (const device of DEVICES) {
    done = 0; failed = 0
    const td = Date.now()
    await pool(listings, CONCURRENCY, l => warmListing(l, device))       // listings: every page
    await pool(flat, CONCURRENCY, async (u) => {                          // products + static pages
      await warm(u, device)
      if (done % 25 === 0) process.stdout.write(`\r  [${device}] ${done} requests`)
    })
    process.stdout.write(`\r  [${device}] ${done} requests done, ${failed} non-200, ${((Date.now() - td) / 1000).toFixed(0)}s\n`)
  }
  console.log(`\n✓ done in ${((Date.now() - t0) / 1000).toFixed(0)}s`)
}

main()
