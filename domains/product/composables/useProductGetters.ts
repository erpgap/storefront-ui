import type {
  CustomProductWithStockFromRedis,
  ImageGalleryItem,
} from '~/graphql'

export const useProductGetters = (
  product: Ref<CustomProductWithStockFromRedis>,
) => {
  const getImages = (
    width: string | number,
    height: string | number,
  ): ImageGalleryItem[] => {
    return (
      (product?.value?.mediaGallery?.map(image => ({
        id: image.id,
        url: String(image.image),
        alt: String(image.imageFilename),
        width: width,
        height: height,
      })) as ImageGalleryItem[]) || []
    )
  }

  return {
    getImages,
  }
}
