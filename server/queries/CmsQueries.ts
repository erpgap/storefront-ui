// CMS reads.
//
// The published query is deliberately separate from the editor ones: it is the
// only CMS query a visitor's request ever triggers, it never selects
// draftBlocks, and it is the one that carries a cache rule.

const PAGE_FIELDS = `
  id
  name
  url
  isPublished
  metaTitle
  metaDescription
  metaImage
  jsonLd
  liveRevision
  updatedAt
  hasUnpublishedChanges
  blockCount
  kind
  regionKey
  isSystem
`

export const GetCmsPageQuery = `
  query ($slug: String!) {
    cmsPage(slug: $slug) {
      ${PAGE_FIELDS}
      blocks
    }
  }
`

export const GetCmsPagesQuery = `
  query {
    cmsPages {
      totalCount
      pages {
        ${PAGE_FIELDS}
      }
    }
  }
`

export const GetCmsPageDraftQuery = `
  query ($id: Int!) {
    cmsPageDraft(id: $id) {
      ${PAGE_FIELDS}
      blocks
      draftBlocks
      seo
    }
  }
`

export const GetCmsRevisionsQuery = `
  query ($pageId: Int!) {
    cmsRevisions(pageId: $pageId) {
      id
      number
      author
      createdAt
      restoredFrom
      isLive
    }
  }
`

export const GetCmsCanEditQuery = `
  query {
    cmsCanEdit
  }
`

export const GetCmsLocalesQuery = `
  query {
    cmsLocales {
      code
      label
      isDefault
    }
  }
`

export const GetCmsProductsQuery = `
  query ($search: String, $ids: [Int]) {
    cmsProducts(search: $search, ids: $ids) {
      id
      name
      imageUrl
    }
  }
`

export const GetCmsCategoriesQuery = `
  query ($search: String) {
    cmsCategories(search: $search) {
      id
      name
    }
  }
`

export const GetCmsRegionQuery = `
  query ($key: String!) {
    cmsRegion(key: $key) {
      id
      blocks
    }
  }
`
