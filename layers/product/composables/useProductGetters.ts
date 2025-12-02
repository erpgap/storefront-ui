import type {
  CustomProductWithStockFromRedis,
  ImageGalleryItem,
  Product,
} from '~/graphql'

type BaseImage = { id: number; url: string; alt: string }

export const useProductGetters = (
  productTemplate: Ref<CustomProductWithStockFromRedis>,
  productVariant: Ref<Product | null>,
) => {
  const normalize = (arr: any) => (Array.isArray(arr) ? arr : [])

  const getBaseImages = (): BaseImage[] => {
    const pt: any = productTemplate.value
    const pv: any = productVariant.value

    const images: BaseImage[] = []
    const seen = new Set<string>()

    const add = (id?: number, url?: string | null, alt?: string | null) => {
      if (!url) return
      const trimmed = url.trim()
      if (!trimmed || seen.has(trimmed)) return
      seen.add(trimmed)
      images.push({
        id: id ?? pv?.id ?? pt?.id,
        url: trimmed,
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

    if (currentVariant) {
      add(currentVariant.id, currentVariant.image, currentVariant.name)
      normalize(currentVariant.mediaGallery).forEach((img: any) =>
        add(img.id, img.image, img.name),
      )
    } else if (pv) {
      add(pv.id, pv.image, pv.name)
      normalize(pv.mediaGallery).forEach((img: any) =>
        add(img.id, img.image, img.name),
      )
    }

    if (pt) {
      add(pt.id, pt.image, pt.name)
      normalize(pt.mediaGallery).forEach((img: any) =>
        add(img.id, img.image, img.name),
      )
    }

    console.log('BASE IMAGES ⇒', images)
    return images
  }

  const getMainImage = (
    width: number | string,
    height: number | string,
  ): ImageGalleryItem | null => {
    const base = getBaseImages()
    const img = base[0]
    if (!img) return null

    return {
      id: img.id,
      url: img.url,
      alt: img.alt,
      width,
      height,
    }
  }

  const getThumbs = (
    width: number | string,
    height: number | string,
  ): ImageGalleryItem[] => {
    const base = getBaseImages()
    return base.slice(1).map(img => ({
      id: img.id,
      url: img.url,
      alt: img.alt,
      width,
      height,
    }))
  }

  return {
    getMainImage,
    getThumbs,
  }
}
