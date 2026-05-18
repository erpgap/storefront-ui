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
const { href } = useRequestURL()
const generateSeo = <T extends SeoEntity>(
  entity: T,
  entityType: string,

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
        name: 'og:description',
        content: entity.metaDescription,
      },
      {
        name: 'og:title',
        content: defaultTitle,
      },
      {
        name: 'twitter:title',
        content: defaultTitle,
      },
      entity?.metaDescription && {
        name: 'twitter:description',
        content: entity.metaDescription,
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
