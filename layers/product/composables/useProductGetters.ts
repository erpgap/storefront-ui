import type {
  CustomProductWithStockFromRedis,
  ImageGalleryItem,
} from '~/graphql'

export const useProductGetters = (
  product: Ref<CustomProductWithStockFromRedis>,
) => {
  const getMainImage = (
    width: string | number,
    height: string | number,
  ): ImageGalleryItem | null => {
    if (!product.value?.image) return null
    return {
      id: product.value.id,
      url: String(product.value.image),
      alt: String(product.value.imageFilename),
      width,
      height,
    }
  }

  const getThumbs = (
    width: string | number,
    height: string | number,
  ): ImageGalleryItem[] => {
    return (
      (product?.value?.mediaGallery?.map(image => ({
        id: image.id,
        url: String(image.image),
        alt: String(image.imageFilename),
        width,
        height,
      })) as ImageGalleryItem[]) || []
    )
  }

  return {
    getMainImage,
    getThumbs,
  }
}
