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
  liveRevision
  updatedAt
  hasUnpublishedChanges
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
