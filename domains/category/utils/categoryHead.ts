export default (category, fullPath) => ({
  title: category?.metaTitle || category?.name || 'Category page',
  meta: [
    {
      hid: 'title',
      name: 'title',
      content: category?.metaTitle || `${category?.name} | ${category?.id}`,
    },
    {
      hid: 'description',
      name: 'description',
      content: category?.metaDescription || 'Category description',
    },
    {
      hid: 'og:description',
      name: 'og:description',
      content: category?.metaDescription || 'Category description',
    },
    {
      hid: 'og:title',
      name: 'og:title',
      content: category?.metaTitle || category?.name || 'Category page',
    },
    {
      hid: 'twitter-title',
      name: 'twitter:title',
      content: category?.metaTitle || category?.name || 'Category page',
    },
    {
      hid: 'twitter-desc',
      name: 'twitter:description',
      content: category?.metaDescription || 'Category description',
    },
  ],
  script: [
    {
      type: 'application/ld+json',
      children: category?.jsonLd as any,
    },
  ],
  link: [
    {
      rel: 'canonical',
      href: `https://vsfsdk.labs.odoogap.com${fullPath}`,
    },
  ],
});
