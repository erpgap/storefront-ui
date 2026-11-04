import { readFile, writeFile } from 'node:fs/promises';

// Nitro serializes storage mounts into its server bundle at build time. Replace
// only our deliberately invalid marker so a single image can use each trial's
// private Redis URL without changing the upstream storefront repository.
const marker = 'redis://runtime-redis.invalid:6379';
const storageUrl = process.env.NUXT_STORAGE_URL;

if (!storageUrl) {
  throw new Error('NUXT_STORAGE_URL is required');
}

const bundlePath = '/src/server/chunks/nitro/nitro.mjs';
const bundle = await readFile(bundlePath, 'utf8');
// The marker occurs inside JavaScript string literals. JSON encoding safely
// escapes credentials containing quotes, slashes, or control characters.
const escapedStorageUrl = JSON.stringify(storageUrl).slice(1, -1);
if (bundle.includes(marker)) {
  await writeFile(bundlePath, bundle.split(marker).join(escapedStorageUrl));
} else if (!bundle.includes(escapedStorageUrl)) {
  throw new Error('Runtime Redis marker was not found in the Nitro bundle');
}

// The upstream application normally generates product/category routes during
// its image build. A SaaS image cannot know its tenant then, so populate the
// existing dynamic-route resolver's Redis index before starting Nitro.
const odooBaseUrl = process.env.NUXT_PUBLIC_ODOO_BASE_URL;
if (!odooBaseUrl) {
  throw new Error('NUXT_PUBLIC_ODOO_BASE_URL is required');
}

const graphqlUrl = new URL('graphql/vsf', odooBaseUrl.endsWith('/') ? odooBaseUrl : `${odooBaseUrl}/`);
let routes = [];
try {
  const response = await fetch(graphqlUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      query: `query RuntimeRoutes {
        categories(pageSize: 10000) { categories { slug } }
        products(pageSize: 10000) { products { slug } }
      }`,
    }),
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const payload = await response.json();
  if (payload.errors?.length) throw new Error(payload.errors[0]?.message || 'unknown GraphQL error');
  routes = [
    ...(payload.data?.categories?.categories || []).map(({ slug }) => [slug, 'product.public.category']),
    ...(payload.data?.products?.products || []).map(({ slug }) => [slug, 'product.template']),
  ].filter(([slug]) => typeof slug === 'string' && slug.startsWith('/'));
} catch (error) {
  // Keep the service and crawler policy available during a temporary Odoo
  // outage. Dynamic product/category routes will populate on the next restart.
  console.error(`Odoo route indexing failed; starting without dynamic routes: ${error.message}`);
}

const { default: Redis } = await import('/src/server/node_modules/ioredis/built/index.js');
const redis = new Redis(storageUrl, { lazyConnect: true, maxRetriesPerRequest: 2 });
try {
  await redis.connect();
  const pipeline = redis.pipeline();
  for (const [slug, model] of routes) {
    pipeline.set(`slug:${encodeURIComponent(slug)}`, model);
  }
  await pipeline.exec();
} finally {
  redis.disconnect();
}

// The upstream Nuxt SEO modules already provide robots.txt, noindex response
// headers, and dynamic sitemaps. Override their runtime site configuration so
// every trial is private unless an administrator explicitly enables indexing.
const indexingEnabled = process.env.SEO_INDEXING_ENABLED === '1';
process.env.NUXT_SITE_INDEXABLE = indexingEnabled ? 'true' : 'false';
process.env.NUXT_SITE_URL = process.env.NUXT_PUBLIC_MIDDLEWARE_URL || 'http://localhost:3000/';

await import('/src/server/index.mjs');
