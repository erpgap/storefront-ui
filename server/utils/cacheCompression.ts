import { constants, gunzip, zstdCompress, zstdDecompress, brotliCompress, brotliDecompress } from 'node:zlib'
import { promisify } from 'node:util'
import type { Driver } from 'unstorage'

/**
 * Transparent compression for the `cache` storage mount (see the
 * cache-compression nitro plugin).
 *
 * The route cache stores the full rendered SSR HTML of every page in Redis
 * (plus cached data responses), uncompressed. HTML compresses ~4-7x, so
 * compressing values at the storage-driver layer cuts the Redis memory
 * footprint by the same factor while staying invisible to every consumer:
 * nitro's cachedEventHandler, cache invalidation, and anything else using
 * useStorage all keep working unchanged (key scans and deletes never touch
 * values).
 *
 * Codec: zstd when the runtime supports it (Node >= 22.15 — our Docker image
 * is on 22.17), otherwise brotli q4. Benchmarked on real pages, zstd
 * decompresses ~2x faster than gzip/brotli — and decompression is the hot
 * path, paid on every user-serving cache hit — while compressing to the best
 * ratio of the three at level 9.
 *
 * Storage format: values reach the driver as strings (unstorage serializes
 * objects to JSON first), so compressed values are stored base64-encoded
 * behind a codec marker prefix. Values without a marker (anything written
 * before this existed, or values too small to be worth compressing) are
 * returned as-is — no cache flush needed on deploy, and the reader supports
 * both codecs regardless of which one writes.
 */

const zstdCompressAsync = promisify(zstdCompress)
const zstdDecompressAsync = promisify(zstdDecompress)
const brotliCompressAsync = promisify(brotliCompress)
const brotliDecompressAsync = promisify(brotliDecompress)
const gunzipAsync = promisify(gunzip)

// Marker prefixes. Real cache values are JSON ('{'/'['/'"') or HTML ('<'), so
// a collision with a raw value is not a realistic concern.
const ZSTD_MARKER = '@zstd64;'
const BROTLI_MARKER = '@br64;'
const GZIP_MARKER = '@gz64;' // read-only: in case entries were ever written by a gzip variant

// zstd level 9: best ratio of the benchmarked codecs, decompression speed is
// unaffected by level, and the compress cost is only paid on cache miss /
// revalidate where SSR itself dominates.
const ZSTD_OPTS = { params: { [constants.ZSTD_c_compressionLevel]: 9 } }
// Brotli quality 4 is the speed/ratio sweet spot for storage (11 is for static assets).
const BROTLI_OPTS = { params: { [constants.BROTLI_PARAM_QUALITY]: 4 } }

// Below this size compression saves little and base64 overhead can even lose.
const MIN_COMPRESS_BYTES = 1024

const hasZstd = typeof zstdCompress === 'function'

/**
 * Compress a storage value. Non-string or small values pass through untouched.
 */
export async function compressStorageValue(value: unknown): Promise<unknown> {
  if (typeof value !== 'string' || value.length < MIN_COMPRESS_BYTES) {
    return value
  }
  if (hasZstd) {
    return ZSTD_MARKER + (await zstdCompressAsync(value, ZSTD_OPTS)).toString('base64')
  }
  return BROTLI_MARKER + (await brotliCompressAsync(value, BROTLI_OPTS)).toString('base64')
}

/**
 * Restore the original value, switching on the marker prefix. Unmarked values
 * (pre-compression entries, small values) are returned as stored.
 */
export async function decompressStorageValue(value: unknown): Promise<unknown> {
  if (typeof value !== 'string') {
    return value
  }
  if (value.startsWith(ZSTD_MARKER)) {
    return (await zstdDecompressAsync(Buffer.from(value.slice(ZSTD_MARKER.length), 'base64'))).toString('utf8')
  }
  if (value.startsWith(BROTLI_MARKER)) {
    return (await brotliDecompressAsync(Buffer.from(value.slice(BROTLI_MARKER.length), 'base64'))).toString('utf8')
  }
  if (value.startsWith(GZIP_MARKER)) {
    return (await gunzipAsync(Buffer.from(value.slice(GZIP_MARKER.length), 'base64'))).toString('utf8')
  }
  return value
}

/**
 * Wrap an unstorage driver so every value is compressed on write and
 * decompressed on read. Keys, TTLs, scans and deletes pass through untouched.
 */
export function wrapDriverWithCompression(driver: Driver): Driver {
  return {
    ...driver,
    async getItem(key, opts) {
      return decompressStorageValue(await driver.getItem(key, opts)) as ReturnType<typeof driver.getItem>
    },
    async setItem(key, value, opts) {
      return driver.setItem?.(key, (await compressStorageValue(value)) as string, opts)
    },
    // Batch variants — only wrapped when the underlying driver implements them,
    // otherwise unstorage's per-item fallback already goes through get/setItem.
    ...(driver.getItems && {
      getItems: async (items, commonOptions) => {
        const entries = await driver.getItems!(items, commonOptions)
        return Promise.all(entries.map(async entry => ({
          ...entry,
          value: await decompressStorageValue(entry.value),
        })))
      },
    } satisfies Partial<Driver>),
    ...(driver.setItems && {
      setItems: async (items, commonOptions) => {
        return driver.setItems!(await Promise.all(items.map(async entry => ({
          ...entry,
          value: (await compressStorageValue(entry.value)) as string,
        }))), commonOptions)
      },
    } satisfies Partial<Driver>),
  }
}
