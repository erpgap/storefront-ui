import { describe, expect, it, vi, beforeEach } from 'vitest'
import generateSeo from '~/utils/buildSEOHelper'
import type { SeoEntity } from '~/utils/buildSEOHelper'

describe('generateSeo', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const mockEntity: SeoEntity = {
    id: 'test-id',
    name: 'Test Product',
    metaTitle: 'Test Meta Title',
    metaDescription: 'Test meta description',
    metaKeyword: 'test, keyword',
    metaImage: 'https://example.com/image.jpg',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Product',
      'name': 'Test Product',
    },
  }

  it('should generate SEO object with all metadata', () => {
    const result = generateSeo(mockEntity, 'product', 'https://example.com/test-path')

    expect(result).toEqual({
      title: 'Test Meta Title',
      meta: [
        {
          name: 'title',
          content: 'Test Meta Title',
        },
        {
          name: 'description',
          content: 'Test meta description',
        },
        {
          property: 'og:description',
          content: 'Test meta description',
        },
        {
          property: 'og:title',
          content: 'Test Meta Title',
        },
        {
          property: 'og:image',
          content: 'https://example.com/image.jpg',
        },
        {
          name: 'twitter:title',
          content: 'Test Meta Title',
        },
        {
          name: 'twitter:description',
          content: 'Test meta description',
        },
        {
          name: 'twitter:image',
          content: 'https://example.com/image.jpg',
        },
        {
          name: 'twitter:card',
          content: 'summary_large_image',
        },
      ],
      script: [
        {
          type: 'application/ld+json',
          children: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            'name': 'Test Product',
          }),
        },
      ],
      link: [
        {
          rel: 'canonical',
          href: 'https://example.com/test-path',
        },
      ],
    })
  })

  it('should use fallback title when metaTitle is not provided', () => {
    const entityWithoutMetaTitle = {
      ...mockEntity,
      metaTitle: null,
    }

    const result = generateSeo(entityWithoutMetaTitle, 'product', 'https://example.com/test-path')

    expect(result.title).toBe('Test Product')
    expect(result.meta).toContainEqual({
      name: 'title',
      content: 'Test Product | test-id',
    })
  })

  it('should use entity type as fallback when name and metaTitle are not provided', () => {
    const entityWithoutTitleAndName = {
      ...mockEntity,
      metaTitle: null,
      name: null,
    }

    const result = generateSeo(entityWithoutTitleAndName, 'product', 'https://example.com/test-path')

    expect(result.title).toBe('product page')
  })

  it('should filter out meta tags when metaDescription is not provided', () => {
    const entityWithoutDescription = {
      ...mockEntity,
      metaDescription: null,
    }

    const result = generateSeo(entityWithoutDescription, 'product', 'https://example.com/test-path')

    expect(result.meta).not.toContainEqual(
      expect.objectContaining({
        name: 'description',
      }),
    )
    expect(result.meta).not.toContainEqual(
      expect.objectContaining({
        name: 'og:description',
      }),
    )
    expect(result.meta).not.toContainEqual(
      expect.objectContaining({
        name: 'twitter:description',
      }),
    )
  })

  it('should filter out jsonLd script when jsonLd is not provided', () => {
    const entityWithoutJsonLd = {
      ...mockEntity,
      jsonLd: null,
    }

    const result = generateSeo(entityWithoutJsonLd, 'product', 'https://example.com/test-path')

    expect(result.script).toEqual([])
  })

  it('should handle jsonLd as string', () => {
    const entityWithJsonLdString = {
      ...mockEntity,
      jsonLd: '{"@context": "https://schema.org", "@type": "Product"}',
    }

    const result = generateSeo(entityWithJsonLdString, 'product', 'https://example.com/test-path')

    expect(result.script).toEqual([
      {
        type: 'application/ld+json',
        children: '{"@context":"https://schema.org","@type":"Product"}',
      },
    ])
  })

  it('should always include canonical link with current URL', () => {
    const result = generateSeo(mockEntity, 'product', 'https://example.com/test-path')

    expect(result.link).toContainEqual({
      rel: 'canonical',
      href: 'https://example.com/test-path',
    })
  })

  it('should call console.warn for missing SEO fields', () => {
    const incompleteEntity: SeoEntity = {
      id: 'test-id',
      name: 'Test Product',
    }

    generateSeo(incompleteEntity, 'product', 'https://example.com/test-path')

    expect(console.warn).toHaveBeenCalledWith(
      '[WARNING DEVELOPER] - The product from slug https://example.com/test-path does not have the metaTitle.',
    )
    expect(console.warn).toHaveBeenCalledWith(
      '[WARNING DEVELOPER] - The product from slug https://example.com/test-path does not have the metaDescription.',
    )
    expect(console.warn).toHaveBeenCalledWith(
      '[WARNING DEVELOPER] - The product from slug https://example.com/test-path does not have the jsonLd.',
    )
    expect(console.warn).toHaveBeenCalledWith(
      '[WARNING DEVELOPER] - The product from slug https://example.com/test-path does not have the metaKeyword.',
    )
    expect(console.warn).toHaveBeenCalledWith(
      '[WARNING DEVELOPER] - The product from slug https://example.com/test-path does not have the metaImage.',
    )
  })

  it('should handle empty entity gracefully', () => {
    const emptyEntity: SeoEntity = {}

    const result = generateSeo(emptyEntity, 'category', 'https://example.com/test-path')

    expect(result.title).toBe('category page')
    expect(result.meta).toEqual([
      {
        name: 'title',
        content: 'undefined | undefined',
      },
      {
        property: 'og:title',
        content: 'category page',
      },
      {
        name: 'twitter:title',
        content: 'category page',
      },
    ])
    expect(result.script).toEqual([])
    expect(result.link).toEqual([
      {
        rel: 'canonical',
        href: 'https://example.com/test-path',
      },
    ])
  })
})
