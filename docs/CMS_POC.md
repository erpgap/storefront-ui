# Alokai CMS — working proof of concept

A merchant-facing, drag-and-drop page editor built into the storefront, using
the storefront's own StorefrontUI/Tailwind components.

**Status:** runnable end to end. Content persists to a local file, not yet to
Odoo. See [CMS_ARCHITECTURE.md](./CMS_ARCHITECTURE.md) for the full design and
the Odoo plan.

---

## Run it

```bash
npx nuxt dev          # `yarn dev` also runs codegen, which needs Odoo up
```

Then open **http://localhost:3000/studio**.

Odoo should be running for the full experience — the storefront header, footer
and the Product Grid block all read from it. The studio itself works without
Odoo; blocks that need the catalogue will simply render empty.

On first boot the store seeds one page, **/cms-home**, which is the current
homepage expressed as blocks. That is the point worth showing: the hand-written
homepage and the CMS page are the same components with the same content, just
sourced differently.

## The demo, in the order that lands

1. **/studio** — the page list. Live / Draft / Unpublished-changes states.
2. **New page** → name it "Summer Sale". The URL fills itself in. It opens
   straight into the editor with a hero already on the canvas.
3. **Choose where a block goes.** Three ways, all equivalent — position is
   never hostage to drag-and-drop working:
   - **Drag** a block from the palette onto the page; the insert bar you are
     over lights up.
   - **Hover between two blocks** → "+ Add block here" → pick from the palette,
     which now reads "Inserting at 3".
   - **↑ / ↓** on a block's toolbar to move it, which also works by keyboard and
     on touch.
4. **Click any block** → the inspector opens on the right, its fields generated
   from that block's schema. Type in the headline and watch the real page
   update as you type.
5. **Click the image** → media library. Drag a JPG in from the desktop; it
   uploads and is applied immediately.
6. **Switch to Português** in the top bar. The page re-renders, the inspector
   shows Portuguese values with the English text as placeholder, and the header
   counts what is left to translate. Publish, then open `/cms-home?lang=pt`.
7. **Cmd+Z** undoes. Drafts autosave (watch the status in the top bar).
8. **Publish**, then **View live ↗** — the page is at its own URL, server
   rendered, with no rebuild and no deploy.

Delete a required headline and try to publish: it refuses and tells you which
blocks need attention.

## What is real

- **One render path.** `layers/cms/components/BlockRenderer.vue` renders both
  the production page and the editor canvas. The canvas is not a preview of the
  page — it *is* the page. No second renderer exists.
- **Real components.** Every block points at a component that already existed:
  `MainBanner`, `Categories`, `BestSellers`, `BannerRight`, `ValueProps`,
  `Newsletter`. They were given props; nothing was re-implemented for the CMS.
  Each still renders unchanged with no props, so the existing homepage was not
  touched.
- **Server-side validation.** Every write goes through `validateBlocks` in
  `shared/cms/blocks.ts`: unknown block types are dropped, unknown keys are
  stripped, selects are clamped to their options, `javascript:` URLs are
  rejected, SVG uploads are refused. Draft saves report issues; publish refuses
  on them.
- **Draft / published split.** The editor reads and writes `draft`; the
  storefront reads `publishedBlocks`. Editing never touches the live page.
- **SSR.** Published pages server-render, so blocks are in the HTML for
  crawlers. Unknown or unpublished URLs 404 rather than returning an empty 200.
- **New pages need no rebuild.** `layers/cms/pages/[...cmsSlug].vue` catches
  URLs the build-time route generator never saw.
- **Bundle separation.** The editor lives in `layers/cms-studio`, so the
  palette, inspector, field widgets and media picker are in their own route
  chunk and never ship to a shopper.
- **Positioning without drag.** HTML5 drag is unreliable across browsers,
  impossible on touch and unusable by keyboard, so every drag interaction has a
  click equivalent: insert points between blocks, and ↑/↓ on each block.
- **Multi-language content.** A language picker in the top bar; the canvas and
  inspector switch with it. Untranslated prose is counted and marked,
  untranslated images and links quietly inherit. Layout and settings are shared
  across languages. The merchant never sees a locale code or a brace — see
  [CMS_ODOO_SPEC.md §11](./CMS_ODOO_SPEC.md#11-i18n--settled-and-built).
- **Content only, never style.** There is no colour picker, no font control, no
  spacing. Block fields describe content; the design system stays enforced in
  code, so a merchant cannot break the storefront's look. Expect recurring
  requests for "just a colour picker here" — each one is a hole in this rule.

## What is not real yet

| Gap | Where it goes |
| --- | --- |
| **No Odoo persistence.** Pages live in `.data/cms` via Nitro storage. | `server/utils/cmsStore.ts` — one interface, one implementation to add. |
| **No authentication.** `/studio` is wide open. | `CMS Editor` group + `/studio/login`, §6.4 of the architecture doc. **Do not expose this on a public host.** |
| **No cache invalidation** on publish. | §6.5 — SWR will serve stale content in production without it. |
| Uploads land in `public/img/cms`, not `ir.attachment`. | `server/api/cms/media.post.ts`. |
| No rich text (TipTap), no product/category picker fields, no nested blocks. | §5.4, §9.3, §9.4. |
| Content languages are a hard-coded list (en/pt/es). | Comes from Odoo's `res.lang` in the real build — see spec §11.2. |
| No responsive preview toggle. | Needs the iframe canvas, §8.4 Option B. |
| Drag verified in Chromium only — Firefox and Safari were not testable here. | The click paths above work regardless; see the note in `[id].vue` on `dataTransfer.setData`. |

## Where the code is

```
shared/cms/blocks.ts              block schemas + seed data + validation
                                  (imported by browser, SSR and Nitro — one
                                   definition, three surfaces, no drift)

layers/cms/                       RENDERING — ships to production
  blocks/index.ts                 schema -> real component binding
  components/BlockRenderer.vue    the single render path
  components/CmsBlockShell.vue    the edit-mode overlay (§8.2) + reorder arrows
  components/CmsInsertPoint.vue   "+ Add block here" between every block
  components/CmsRichText.vue      the one CMS-specific block
  custom-pages/cms-page.vue       the page render target
  pages/[...cmsSlug].vue          catch-all, so new pages resolve
  composables/useCmsPage.ts

layers/cms-studio/                THE EDITOR — never reaches a shopper
  pages/studio/index.vue          page list, create, publish, delete
  pages/studio/[id].vue           canvas, palette, drag-and-drop, publish
  components/StudioFieldControl.vue   the field registry — one widget per type
  components/StudioMediaPicker.vue    upload + pick
  composables/useStudioDraft.ts   blocks, selection, undo/redo, autosave

server/api/cms/                   page CRUD, draft, publish, media
server/utils/cmsStore.ts          THE SWAP POINT for Odoo
server/plugins/cms-seed.ts        seeds /cms-home on first boot
```

## Adding a block

This is the measure of whether the architecture holds. Two steps, no editor
code:

1. Add a schema to `blockSchemas` in `shared/cms/blocks.ts`.
2. Map its name to a component in `layers/cms/blocks/index.ts`.

It now appears in the palette, gets an inspector form, is validated on write,
and renders in both the canvas and production. Adding a new *field type* is the
only thing that costs editor UI — which is why that list is kept short.
