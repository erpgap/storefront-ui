import type { Meta } from '#imports'

export interface SeoEntity {
  metaTitle?: string | null
  metaDescription?: string | null
  jsonLd?: string | object | null
  metaKeyword?: string | null
  metaImage?: string | null
  name?: string | null
  id?: string | number | null
}

const validateSEO = (entity: SeoEntity, fullPath: string, entityType: string) => {
  const warnings = []

  if (!entity?.metaTitle) {
    warnings.push(
      `[WARNING DEVELOPER] - The ${entityType} from slug ${fullPath} does not have the metaTitle.`,
    )
  }
  if (!entity?.metaDescription) {
    warnings.push(
      `[WARNING DEVELOPER] - The ${entityType} from slug ${fullPath} does not have the metaDescription.`,
    )
  }
  if (!entity?.jsonLd) {
    warnings.push(
      `[WARNING DEVELOPER] - The ${entityType} from slug ${fullPath} does not have the jsonLd.`,
    )
  }
  if (!entity?.metaKeyword) {
    warnings.push(
      `[WARNING DEVELOPER] - The ${entityType} from slug ${fullPath} does not have the metaKeyword.`,
    )
  }
  if (!entity?.metaImage) {
    warnings.push(
      `[WARNING DEVELOPER] - The ${entityType} from slug ${fullPath} does not have the metaImage.`,
    )
  }

  warnings.forEach(warning => console.warn(warning))
}
const generateSeo = <T extends SeoEntity>(
  entity: T,
  entityType: string,
  // Clean canonical URL (origin + pathname, no query) resolved by the caller in
  // a valid setup context. Passing it in avoids calling useRequestURL() here,
  // which would throw when generateSeo runs inside a lazily-evaluated computed.
  href = '',
) => {
  validateSEO(entity, href, entityType)

  const defaultTitle
    = entity.metaTitle || entity.name || `${entityType} page`

  let jsonLdObject: object | null = null;
  if (entity?.jsonLd) {
      if (typeof entity.jsonLd === 'string') {
          try {
              jsonLdObject = JSON.parse(entity.jsonLd);
          } catch (e) {
              console.error("Failed to parse jsonLd string:", e);
              jsonLdObject = null;
          }
      } else if (typeof entity.jsonLd === 'object') {
          jsonLdObject = entity.jsonLd;
      }
  }

  return {
    title: defaultTitle,
    meta: [
      {
        name: 'title',
        content: entity?.metaTitle || `${entity?.name} | ${entity?.id}`,
      },
      entity?.metaDescription && {
        name: 'description',
        content: entity.metaDescription,
      },
      entity?.metaDescription && {
        property: 'og:description',
        content: entity.metaDescription,
      },
      {
        property: 'og:title',
        content: defaultTitle,
      },
      entity?.metaImage && {
        property: 'og:image',
        content: entity.metaImage,
      },
      {
        name: 'twitter:title',
        content: defaultTitle,
      },
      entity?.metaDescription && {
        name: 'twitter:description',
        content: entity.metaDescription,
      },
      entity?.metaImage && {
        name: 'twitter:image',
        content: entity.metaImage,
      },
      entity?.metaImage && {
        name: 'twitter:card',
        content: 'summary_large_image',
      },
    ].filter(Boolean) as Meta[],
    script: [
      jsonLdObject && {
        type: 'application/ld+json',
        children: JSON.stringify(jsonLdObject),
      },
    ].filter(Boolean),
    link: [
      {
        rel: 'canonical',
        href,
      },
    ],
  }
}

export default generateSeo
