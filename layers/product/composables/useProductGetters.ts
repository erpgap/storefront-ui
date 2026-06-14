import type {
  CustomProductWithStockFromRedis,
  ImageGalleryItem,
  Product,
} from '~~/graphql'

type BaseImage = {
  id: number
  imageUrl: string | null
  legacyImage: string | null
  alt: string
}

export const useProductGetters = (
  productTemplate: Ref<CustomProductWithStockFromRedis>,
  productVariant: Ref<Product | null>,
) => {
  const normalize = (arr: unknown) => (Array.isArray(arr) ? arr : [])

  const getBaseImages = (): BaseImage[] => {
    const pt: any = productTemplate.value
    const pv: any = productVariant.value

    const images: BaseImage[] = []
    const seen = new Set<string>()

    const add = (
      id?: number,
      imageUrl?: string | null,
      legacyImage?: string | null,
      alt?: string | null,
    ) => {
      const dedupeKey = imageUrl?.trim() || legacyImage?.trim()
      if (!dedupeKey || seen.has(dedupeKey)) return

      seen.add(dedupeKey)
      images.push({
        id: id ?? pv?.id ?? pt?.id,
        imageUrl: imageUrl?.trim() || null,
        legacyImage: legacyImage?.trim() || null,
        alt: String(alt || pv?.name || pt?.name || ''),
      })
    }

    if (!pt && !pv) return images

    let currentVariant: any = null
    const variantId = pv?.id
    if (variantId && Array.isArray(pt?.productVariants)) {
      currentVariant = pt.productVariants.find(
        (v: any) => v.id === variantId,
      )
    }

    const addFromEntity = (entity: any) => {
      add(entity?.id, entity?.imageUrl, entity?.image, entity?.name)
      normalize(entity?.mediaGallery).forEach((img: any) =>
        add(img.id, img.imageUrl, img.image, img.name),
      )
    }

    const variantSource = currentVariant ?? pv
    const variantCount = Array.isArray(pt?.productVariants)
      ? pt.productVariants.length
      : 0

    // With multiple variants, each one carries its own (colour-specific) image,
    // so show the selected variant's image. With a single variant, that image is
    // just a duplicate of the template's, so use the template to avoid showing
    // the same photo twice.
    if (variantCount > 1 && variantSource) {
      addFromEntity(variantSource)
      if (!images.length && pt) addFromEntity(pt)
    } else if (pt) {
      addFromEntity(pt)
      if (!images.length && variantSource) addFromEntity(variantSource)
    }

    return images
  }

  const toGalleryItem = (
    image: BaseImage,
    width: number | string,
    height: number | string,
  ): ImageGalleryItem => ({
    id: image.id,
    url: image.imageUrl ?? image.legacyImage ?? '',
    alt: image.alt,
    width,
    height,
  })

  const getMainImage = (
    width: number | string,
    height: number | string,
  ): ImageGalleryItem | null => {
    const img = getBaseImages()[0]
    if (!img?.imageUrl && !img?.legacyImage) return null

    return toGalleryItem(img, width, height)
  }

  const getThumbs = (
    width: number | string,
    height: number | string,
  ): ImageGalleryItem[] => {
    return getBaseImages()
      .slice(1)
      .filter(img => img.imageUrl || img.legacyImage)
      .map(img => toGalleryItem(img, width, height))
  }

  return {
    getMainImage,
    getThumbs,
  }
}
