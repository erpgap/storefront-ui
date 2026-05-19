# Cache Invalidation cURL Testing

## Summary

This guide shows how to call the Storefront UI cache invalidation endpoints from a shell using the same HMAC authentication expected from Odoo.

Use `dryRun: true` first. After the computed keys look correct, repeat with `dryRun: false`.

## Required Values

```bash
BASE_URL="http://localhost:3000"
KEY="your-invalidation-key"
SECRET="your-signing-secret"
ODOO_GRAPHQL_URL="https://vsf-odoo18-dev.labs.erpgap.com/graphql/vsf"
```

These must match the Nuxt runtime variables:

```bash
NUXT_CACHE_INVALIDATION_KEY
NUXT_CACHE_INVALIDATION_SIGNING_SECRET
```

If `NUXT_CACHE_INVALIDATION_SIGNING_SECRET` is not set, use the same value as `KEY` for `SECRET`.

## Helper Function

The helper below:

1. builds the canonical payload
2. signs it with HMAC-SHA256
3. sends the request with all required headers

```bash
invalidate_cache() {
  local path="$1"
  local body="$2"
  local timestamp
  local signature
  local payload

  timestamp="$(date +%s000)"
  payload="POST:${path}:${timestamp}:${body}"
  signature="$(printf '%s' "$payload" | openssl dgst -sha256 -hmac "$SECRET" -hex | awk '{print $2}')"

  curl -sS -X POST "${BASE_URL}${path}" \
    -H "Content-Type: application/json" \
    -H "x-invalidation-key: ${KEY}" \
    -H "x-invalidation-timestamp: ${timestamp}" \
    -H "x-invalidation-signature: ${signature}" \
    --data "$body"
}
```

Important: the JSON body must already be canonical. Keep keys sorted alphabetically.

Correct:

```json
{"dryRun":true,"url":"/product/the-zen-platform-bed-47"}
```

Wrong for signing:

```json
{"url":"/product/the-zen-platform-bed-47","dryRun":true}
```

The second body has the same data, but a different signature payload.

## Confirm Products From Odoo

Before testing invalidation, confirm that the slug exists in the Odoo base used by this Storefront UI:

```bash
curl -sS -X POST "${ODOO_GRAPHQL_URL}" \
  -H "Content-Type: application/json" \
  --data '{"query":"query { products { products { name slug } } }"}'
```

Known valid product in `https://vsf-odoo18-dev.labs.erpgap.com/`:

```json
{
  "name": "The Zen Platform Bed",
  "slug": "/product/the-zen-platform-bed-47"
}
```

Known valid category:

```json
{
  "name": "Bedroom Furniture",
  "slug": "/category/51"
}
```

## Product Dry Run

```bash
BASE_URL="http://localhost:3000"
KEY="your-invalidation-key"
SECRET="your-signing-secret"

invalidate_cache \
  "/api/internal/cache/invalidate/product" \
  '{"dryRun":true,"url":"/product/the-zen-platform-bed-47"}'
```

Expected response shape:

```json
{
  "ok": true,
  "dryRun": true,
  "pageType": "product",
  "normalizedPath": "/product/the-zen-platform-bed-47",
  "pageKeys": ["..."],
  "dataKeys": ["..."],
  "deletedCount": 0
}
```

## Product Delete

```bash
invalidate_cache \
  "/api/internal/cache/invalidate/product" \
  '{"dryRun":false,"url":"/product/the-zen-platform-bed-47"}'
```

## Category Dry Run

```bash
invalidate_cache \
  "/api/internal/cache/invalidate/category" \
  '{"dryRun":true,"url":"/category/51"}'
```

## Category Delete

```bash
invalidate_cache \
  "/api/internal/cache/invalidate/category" \
  '{"dryRun":false,"url":"/category/51"}'
```

## Homepage Dry Run

The homepage path is `/`; there is no `/pages/...` pattern in this Storefront UI app.

In the current production build, `/` is prerendered, so warming `http://localhost:3000/` may not create a `nitro:routes:*` Redis page key. The endpoint still invalidates the homepage GraphQL cache (`GetWebsiteHomepageQuery`) when it exists.

```bash
invalidate_cache \
  "/api/internal/cache/invalidate/homepage" \
  '{"dryRun":true}'
```

## Homepage Delete

```bash
invalidate_cache \
  "/api/internal/cache/invalidate/homepage" \
  '{"dryRun":false}'
```

To test the homepage data cache directly:

```bash
curl -sS -X POST "${BASE_URL}/api/odoo/query" \
  -H "Content-Type: application/json" \
  --data '[{"queryName":"GetWebsiteHomepageQuery"},{}]'

redis-cli --scan --pattern '*GetWebsiteHomepageQuery*'

invalidate_cache \
  "/api/internal/cache/invalidate/homepage" \
  '{"dryRun":false}'

redis-cli --scan --pattern '*GetWebsiteHomepageQuery*'
```

Expected after the final scan: no `GetWebsiteHomepageQuery` keys.

## Legacy Endpoint

Use the legacy endpoint only when the URL has a detectable prefix, such as `/product/...`, `/products/...`, `/category/...`, `/categories/...`, `/collection/...`, or `/collections/...`.

```bash
invalidate_cache \
  "/api/internal/invalidate-cache" \
  '{"dryRun":true,"url":"/product/the-zen-platform-bed-47"}'
```

For any product or category slug returned by Odoo, prefer the product/category endpoint.

## Negative Tests

### Wrong Key

```bash
KEY="wrong-key"
invalidate_cache \
  "/api/internal/cache/invalidate/product" \
  '{"dryRun":true,"url":"/product/the-zen-platform-bed-47"}'
```

Expected: `401 Invalid cache invalidation key`.

### Wrong Signature

```bash
timestamp="$(date +%s000)"
curl -sS -X POST "${BASE_URL}/api/internal/cache/invalidate/product" \
  -H "Content-Type: application/json" \
  -H "x-invalidation-key: ${KEY}" \
  -H "x-invalidation-timestamp: ${timestamp}" \
  -H "x-invalidation-signature: bad-signature" \
  --data '{"dryRun":true,"url":"/product/the-zen-platform-bed-47"}'
```

Expected: `401 Invalid cache invalidation signature`.

### Expired Timestamp

```bash
old_timestamp="1000"
body='{"dryRun":true,"url":"/product/the-zen-platform-bed-47"}'
path="/api/internal/cache/invalidate/product"
payload="POST:${path}:${old_timestamp}:${body}"
signature="$(printf '%s' "$payload" | openssl dgst -sha256 -hmac "$SECRET" -hex | awk '{print $2}')"

curl -sS -X POST "${BASE_URL}${path}" \
  -H "Content-Type: application/json" \
  -H "x-invalidation-key: ${KEY}" \
  -H "x-invalidation-timestamp: ${old_timestamp}" \
  -H "x-invalidation-signature: ${signature}" \
  --data "$body"
```

Expected: `401 Expired cache invalidation timestamp`.

### Replay

Send exactly the same signed request twice with the same timestamp and signature.

Expected first response: success.

Expected second response: `409 Replay detected for cache invalidation request`.

## Redis Checks

Useful local checks:

```bash
redis-cli FLUSHALL
redis-cli --scan --pattern 'nitro:routes:*'
redis-cli --scan --pattern 'nitro:functions:*GetProductTemplateQuery*'
redis-cli --scan --pattern 'nitro:functions:*GetProductVariantQuery*'
redis-cli --scan --pattern 'nitro:functions:*GetCategoryQuery*'
redis-cli --scan --pattern 'nitro:functions:*GetProductTemplateListQuery*'
redis-cli --scan --pattern 'nitro:functions:*GetWebsiteHomepageQuery*'
```

Older storage mounts can expose keys with `/cache:` prefixes. If needed, scan those too:

```bash
redis-cli --scan --pattern '/cache:pages:*'
redis-cli --scan --pattern '/cache:nitro/functions:*GetProductTemplateQuery*'
redis-cli --scan --pattern '/cache:nitro/functions:*GetProductVariantQuery*'
redis-cli --scan --pattern '/cache:nitro/functions:*GetCategoryQuery*'
redis-cli --scan --pattern '/cache:nitro/functions:*GetProductTemplateListQuery*'
redis-cli --scan --pattern '/cache:nitro/functions:*GetWebsiteHomepageQuery*'
```

After warming the valid product page in the local app, useful focused scans are:

```bash
redis-cli --scan --pattern '*productthezenpla*'
redis-cli --scan --pattern '*GetProductTemplateQuery*'
```
