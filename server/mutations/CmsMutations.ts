// CMS writes. Every one requires the CMS Editor group, checked server-side in
// Odoo - never here, and never from the client's cmsCanEdit flag.

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
  draftBlocks
  kind
  regionKey
  isSystem
`

export const SaveCmsDraftMutation = `
  mutation ($pageId: Int!, $blocks: GenericScalar!, $expectedWriteDate: String) {
    saveCmsDraft(pageId: $pageId, blocks: $blocks, expectedWriteDate: $expectedWriteDate) {
      ${PAGE_FIELDS}
    }
  }
`

export const PublishCmsPageMutation = `
  mutation ($pageId: Int!, $references: BlockReferencesInput) {
    publishCmsPage(pageId: $pageId, references: $references) {
      ${PAGE_FIELDS}
      blocks
    }
  }
`

export const RestoreCmsRevisionMutation = `
  mutation ($pageId: Int!, $revisionId: Int!) {
    restoreCmsRevision(pageId: $pageId, revisionId: $revisionId) {
      ${PAGE_FIELDS}
      blocks
    }
  }
`

export const DiscardCmsDraftMutation = `
  mutation ($pageId: Int!) {
    discardCmsDraft(pageId: $pageId) {
      ${PAGE_FIELDS}
    }
  }
`

export const UnpublishCmsPageMutation = `
  mutation ($pageId: Int!) {
    unpublishCmsPage(pageId: $pageId) {
      ${PAGE_FIELDS}
    }
  }
`

export const CreateCmsPageMutation = `
  mutation ($name: String!, $url: String!, $blocks: GenericScalar) {
    createCmsPage(name: $name, url: $url, blocks: $blocks) {
      ${PAGE_FIELDS}
    }
  }
`

export const UpdateCmsPageMutation = `
  mutation ($pageId: Int!, $name: String, $url: String, $metaTitle: String, $metaDescription: String) {
    updateCmsPage(pageId: $pageId, name: $name, url: $url, metaTitle: $metaTitle, metaDescription: $metaDescription) {
      ${PAGE_FIELDS}
    }
  }
`

export const DeleteCmsPageMutation = `
  mutation ($pageId: Int!) {
    deleteCmsPage(pageId: $pageId)
  }
`
