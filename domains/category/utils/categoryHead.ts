import type { Category } from "~/graphql";
import type { Meta } from "@unhead/vue";

const validateCategorySEO = (category, fullPath) => {
  const warnings = [];

  if (!category?.metaTitle) {
    warnings.push(
      `[WARNING] - The category from slug ${fullPath} does not have the metaTitle.`
    );
  }
  if (!category?.metaDescription) {
    warnings.push(
      `[WARNING] - The category from slug ${fullPath} does not have the metaDescription.`
    );
  }
  if (!category?.jsonLd) {
    warnings.push(
      `[WARNING] - The category from slug ${fullPath} does not have the jsonLd.`
    );
  }
  if (!category?.metaKeyword) {
    warnings.push(
      `[WARNING] - The category from slug ${fullPath} does not have the metaKeyword.`
    );
  }
  if (!category?.metaImage) {
    warnings.push(
      `[WARNING] - The category from slug ${fullPath} does not have the metaImage.`
    );
  }

  warnings.forEach((warning) => console.warn(warning));
};

export default (category: Category, fullPath: string) => {
  validateCategorySEO(category, fullPath);

  return {
    title: category?.metaTitle || category?.name || "Category page",
    meta: [
      {
        hid: "title",
        name: "title",
        content: category?.metaTitle || `${category?.name} | ${category?.id}`,
      },
      category?.metaDescription && {
        hid: "description",
        name: "description",
        content: category.metaDescription,
      },
      category?.metaDescription && {
        hid: "og:description",
        name: "og:description",
        content: category.metaDescription,
      },
      {
        hid: "og:title",
        name: "og:title",
        content: category?.metaTitle || category?.name || "Category page",
      },
      {
        hid: "twitter:title",
        name: "twitter:title",
        content: category?.metaTitle || category?.name || "Category page",
      },
      category?.metaDescription && {
        hid: "twitter:description",
        name: "twitter:description",
        content: category.metaDescription,
      },
    ].filter(Boolean) as Meta[],
    script: [
      category?.jsonLd && {
        type: "application/ld+json",
        children: JSON.stringify(category.jsonLd),
      },
    ].filter(Boolean),
    link: [
      {
        rel: "canonical",
        href: `https://vsfsdk.labs.odoogap.com${fullPath}`,
      },
    ],
  };
};
