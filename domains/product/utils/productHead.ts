import type { Product } from '~/graphql';

const validateproductSEO = (product, fullPath) => {
  const warnings = [];

  if (!product?.metaTitle) {
    warnings.push(
      `[WARNING] - The product from slug ${fullPath} does not have the metaTitle.`
    );
  }
  if (!product?.metaDescription) {
    warnings.push(
      `[WARNING] - The product from slug ${fullPath} does not have the metaDescription.`
    );
  }
  if (!product?.jsonLd) {
    warnings.push(
      `[WARNING] - The product from slug ${fullPath} does not have the jsonLd.`
    );
  }
  if (!product?.metaKeyword) {
    warnings.push(
      `[WARNING] - The product from slug ${fullPath} does not have the metaKeyword.`
    );
  }
  if (!product?.metaImage) {
    warnings.push(
      `[WARNING] - The product from slug ${fullPath} does not have the metaImage.`
    );
  }

  warnings.forEach((warning) => console.warn(warning));
};

export default (product: Product, fullPath: string) => {
  validateproductSEO(product, fullPath);

  return {
    title: product?.metaTitle || product?.name || 'product page',
    meta: [
      {
        hid: 'title',
        name: 'title',
        content: product?.metaTitle || `${product?.name} | ${product?.id}`,
      },
      product?.metaDescription && {
        hid: 'description',
        name: 'description',
        content: product.metaDescription,
      },
      product?.metaDescription && {
        hid: 'og:description',
        name: 'og:description',
        content: product.metaDescription,
      },
      {
        hid: 'og:title',
        name: 'og:title',
        content: product?.metaTitle || product?.name || 'product page',
      },
      {
        hid: 'twitter-title',
        name: 'twitter:title',
        content: product?.metaTitle || product?.name || 'product page',
      },
      product?.metaDescription && {
        hid: 'twitter-desc',
        name: 'twitter:description',
        content: product.metaDescription,
      },
    ].filter(Boolean),
    script: [
      product?.jsonLd && {
        type: 'application/ld+json',
        children: product.jsonLd as any,
      },
    ].filter(Boolean),
    link: [
      {
        rel: 'canonical',
        href: `https://vsfsdk.labs.odoogap.com${fullPath}`,
      },
    ],
  };
};
