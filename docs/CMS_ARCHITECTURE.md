# Alokai CMS — Architecture & Implementation Plan

Handoff document for building a block-based CMS into the Alokai storefront, using
Odoo purely as the data layer.

**Status: built and backed by Odoo.** See [CMS_POC.md](./CMS_POC.md) to run
it. The rendering path, field registry, drag-and-drop, media, drafts,
revisions, validation, auth and the Odoo data layer all exist, as do the
homepage migration and content regions on category and product pages. The
design notes below held up; where the implementation diverged, the sections
say so.

**Superseded in places.** [CMS_ODOO_SPEC.md](./CMS_ODOO_SPEC.md) is the
authoritative implementation spec for the Odoo layer. Where the two disagree,
the spec wins — the sections below carry pointers. What stands unchanged here is
the *reasoning*: why Odoo rather than a headless CMS (§3), the single render
path (§5.1), the field registry (§5.4) and the overlay technique (§8.2).

**Audience:** the developer implementing this. Assumes familiarity with Nuxt 4,
Vue 3 SFCs, and basic Odoo addon development.

---

## 1. The problem

Every page in the storefront is hardcoded. Merchants cannot change copy, swap a
hero image, reorder sections, or publish a campaign page without a developer and
a redeploy. This is the single most common complaint from customers running the
storefront.

## 2. Goal

Merchants edit pages themselves, in a visual editor, using the storefront's own
components — no developer, no redeploy.

**In scope**

- A block-based page model stored in Odoo.
- Merchant-facing editor UI inside the Nuxt app (page list, block editing,
  drag-and-drop, publish).
- Storefront pages rendered from that data, server-side, with no SEO or
  performance regression against the current hardcoded pages.

Confirmed with the customers driving this: what they want is **copy and images,
section layout, and creating new pages**. Visual styling was explicitly *not*
asked for. That shapes the rule below.

**Explicitly out of scope for v1**

- **Theming and visual style.** No brand colours, fonts, button shapes, or
  spacing controls. Block fields describe *content only* — never presentation.
  The design system stays enforced in code, which keeps the inspector simple and
  makes it impossible for a merchant to break the storefront's look. Expect
  recurring requests for "just a colour picker here"; each one is a hole in this
  rule and should be refused or handled as a deliberate, separate design-token
  feature.
- Nested / layout blocks (blocks inside blocks). Flat list only — see §9.4.
- Editing global chrome (header, footer, menus).
- Content revision history beyond a single draft/published pair.
  > **Now in scope.** Full revision history with rollback was added
  > deliberately — see [CMS_ODOO_SPEC.md §7](./CMS_ODOO_SPEC.md#7-revisions).
- A/B testing, personalisation, scheduled publishing beyond the existing
  `date_publish` field.

## 3. Key decision: Odoo is the data layer, and nothing else

All UI — including the merchant-facing admin — is built in the Nuxt app. Odoo
provides models, GraphQL, permissions, and file storage. **No Odoo view XML, no
OWL components, no Odoo backend menus for the CMS.**

### Why not a separate headless CMS or visual-editor SaaS

Evaluated and rejected: Payload, Strapi, Storyblok, Builder.io, Directus Visual
Editor, Nuxt Studio, and Puck.

Two findings decided it. **Puck is React-only**, so it cannot render Vue SFCs at
all — and even in a React codebase it is a canvas, not a CMS: it deliberately
leaves persistence, auth, media, and page management to you, which is the
expensive 8 of the 10–13 weeks, not the cheap 2.

Everything else — Builder.io (real Vue SDK, registers your own components),
Storyblok, Directus, Nuxt Studio (git-backed, no extra database) — works
technically, and each would buy back most of the build. All were rejected for
the same two reasons: **each wants to own the content store**, and none can hold
a *relational* reference to an Odoo `product.template`, so every
"featured products" block degrades into an ID-sync job. For a vendor shipping
this to multiple merchants, the per-tenant seat cost and vendor dependency
compound the problem.

Against all of them, staying in Odoo means one auth system, one deploy pipeline,
one i18n configuration, one backup and restore story — plus ACL and record
rules, field-level translation (`translate=True`), `ir.attachment` as a media
library, and multi-website scoping via `website_id`, all of which already exist.

Two of the rejected options are still worth borrowing from, and §5.3 and §8.2
do: **Puck's component-config API** is the well-worn version of `defineBlock`,
and **Directus's overlay approach** (mark editable elements with data
attributes, edit in place) is a cheaper Phase B design than page-list-plus-
inspector, and works against any backend including Odoo.

### Why not build the editor inside Odoo (OWL)

- Preview fidelity would require an iframe of the storefront plus a
  `postMessage` protocol to sync selection and drag state — a large amount of
  bespoke, fragile code.
- The block components are Vue + Tailwind + StorefrontUI. An OWL editor cannot
  render them, so it could never show the merchant what the page will actually
  look like.
- OWL internals shift between Odoo majors; the editor would need re-porting on
  every upgrade.
- The team already writes Vue/Nuxt/Tailwind daily.

### The cost we are accepting

Odoo's generic admin UI would have given page CRUD, list views, and search for
free. We build that ourselves. §5.4 (the field registry) is what keeps that cost
bounded rather than open-ended.

> Odoo's built-in developer views still reach these models via
> **Settings → Technical → Database Structure** without any view XML. That is
> the emergency data-fix path, not a merchant-facing surface.

---

## 4. Current state of the codebase

Roughly 60% of the backend already exists. Audit before starting — the following
is accurate as of this document's writing.

### 4.1 What already works

**Odoo** (`/home/fonseca/dev/alokai-odoo/addons/alokai-odoo/graphql_alokai`)

| Thing | Location |
| --- | --- |
| `alokai.website.page` model — `name`, `url`, `content` (HTML text), `website_id`, `is_published`, `date_publish`, `page_type`, `product_tmpl_ids` | `models/alokai_website_page.py` |
| `websitePage(pageSlug:)` and `websitePages(filter:)` queries, correctly filtered to `is_published` | `schemas/website_page.py` |
| `WebsitePage` GraphQL type | `schemas/objects.py:1214` |
| Session-based login with TOTP support | `schemas/sign.py:39` (`Login`), `:248` (`TotpVerification`) |
| Cache-invalidation queue | `models/invalidate_cache.py` |
| Schema assembly via registries | `graphql/registry.py` |

**Nuxt** (`/home/fonseca/git/alokai/alokai`)

| Thing | Location |
| --- | --- |
| Redis slug → model resolution, already maps `alokai.website.page` → `websitePage` | `server/api/route-resolver/index.ts:20` |
| Build-time route + SWR rule generation | `modules/routes-generator/index.ts` |
| Cache-invalidation endpoints | `server/api/internal/cache/invalidate/*` |
| Uncached query transport (needed by the editor) | `server/api/odoo/query-no-cache.post.ts` |
| Auth composable and whoami probe | `layers/auth/composables/useAuth.ts` |

### 4.2 The three gaps that make content uneditable today

**1. There is no render target for CMS pages.**
`modules/routes-generator/index.ts:151-158` pushes website-page routes with a
`path` but **no `file`** — unlike the category and product branches directly
above it, which point at `custom-pages/*.vue`. Those routes resolve to nothing.
No component anywhere in the app reads `WebsitePage.content`.

**2. Content pages are hardcoded Vue files.**
All eight of `layers/content/pages/` (`about`, `contact`, `faq`, `journal`,
`returns`, `shipping`, `stores`, `sustainability`) are static SFCs. The homepage
(`layers/home/pages/index.vue`) is five hardcoded component tags.

**3. There is no catch-all route.**
No `[...slug].vue` exists, so the Redis slug fallback in `route-resolver` has
nothing to dispatch to. Since `routes-generator` runs at **build time**, a page
created after the last build is unreachable until a rebuild.

### 4.3 No component is usable as a block yet

`grep -l defineProps layers/core/components/*.vue` returns **zero** matches. All
content is baked into templates:

- `MainBanner.vue` — hero eyebrow, headline, body, and both CTAs are literals.
- `Categories.vue` — hardcoded array of three categories with literal image
  paths and links.
- `BestSellers.vue` — hardcoded "Curated" / "Best Sellers" headings, and it
  calls `loadProductTemplateList` itself with a fixed cache key.
- `BannerRight.vue`, `ValueProps.vue` — same pattern.

Each needs a one-time parameterisation pass (§10.1). This is not duplication —
it is giving the component a content interface. Nothing can drag-and-drop-edit a
component whose content lives in its template.

---

## 5. Architecture

### 5.1 The core principle: one render path

There is exactly one component tree that renders blocks.

```
production page   →  BlockRenderer(publishedBlocks)
editor canvas     →  BlockRenderer(draftBlocks, mode: 'edit')
```

Same components, same Tailwind, same StorefrontUI. The editor canvas is not a
preview of the page — it *is* the page. This is what makes "see how it looks"
free rather than a feature to build, and it is the structural guarantee against
duplicated rendering logic. **Do not introduce a second renderer for the editor
under any circumstances.**

### 5.2 Data shape

> **Superseded by [CMS_ODOO_SPEC.md §3](./CMS_ODOO_SPEC.md#3-data-model).**
> Published content is a JSON snapshot per revision, not one row per block with
> a `version` field. Publish becomes one INSERT, reads become one row, and
> `sequence` bookkeeping disappears. The relational-columns reasoning below
> still holds and is sharpened there.

```
alokai.website.page  1 ──── n  alokai.page.block
                                sequence
                                version        (draft | published)
                                block_type     (char, validated against registry)
                                data           (fields.Json — presentational props)
                                image_id       (ir.attachment)
                                product_tmpl_ids
                                category_id
```

**Presentational props go in the `data` JSON column. Only genuinely relational
things get real columns.** Since no Odoo view XML needs to know about block
types, a new block type costs a Vue component plus a schema entry — no
migration, no XML.

The trade-off: JSON is unvalidated by the ORM, so the server **must** validate
`data` against the block's field schema on write (§6.3). This is not optional —
it is the only thing standing between a buggy client and corrupt content.

Model changes to `alokai.website.page`:

- **Add** `block_ids` (One2many).
- **Remove** `content`. Superseded by blocks; migrate existing values into a
  `rich_text` block.
- **Remove** `page_type`. A campaign page is just a page whose blocks include a
  product-grid block. Drop the `products` variant and migrate.

### 5.3 Block definitions

One definition per component, colocated in the CMS layer. This is Payload's
block-config pattern, pointing at components that already exist:

```ts
// layers/cms/blocks/hero.ts
export default defineBlock({
  name: 'hero',
  label: 'Hero Banner',
  // The REAL component. Imported, never reimplemented.
  component: () => import('~~/layers/core/components/MainBanner.vue'),
  fields: [
    { name: 'eyebrow', type: 'text' },
    { name: 'title',   type: 'text', required: true },
    { name: 'body',    type: 'textarea' },
    { name: 'image',   type: 'image' },
    { name: 'ctas',    type: 'array', max: 2, fields: [
      { name: 'label', type: 'text' },
      { name: 'url',   type: 'link' },
      { name: 'style', type: 'select', options: ['primary', 'secondary'] },
    ] },
  ],
})
```

That single declaration drives **three** surfaces, which is the whole point:

1. The palette entry in the editor (label + thumbnail).
2. The inspector form, generated automatically from `fields`.
3. Validation of the `data` JSON — the same schema is exported to Odoo (§6.3).

### 5.4 The field registry is the main source of leverage

Build one inspector widget per field type, once:

`text` · `textarea` · `richtext` · `image` · `link` · `number` · `boolean` ·
`select` · `color` · `product-ref` · `category-ref` · `array` · `group`

After that, **every future block costs zero editor UI code.** Getting this
abstraction right is the highest-value part of the project; getting it wrong
means hand-writing an inspector per block forever.

`product-ref` and `category-ref` are pickers that query Odoo directly — the
capability a separate headless CMS could not provide without an ID-sync job.

### 5.5 Layer layout

```
layers/cms/                          # rendering — shipped to production
  blocks/*.ts                        # block definitions (the registry)
  components/BlockRenderer.vue       # the single render path
  components/CmsBlockShell.vue       # edit-mode wrapper (§8.2)
  custom-pages/cms-page.vue          # the missing render target
  composables/useCmsPage.ts

layers/cms-editor/                   # the editor — must not affect prod bundles
  pages/cms/index.vue             # page list
  pages/cms/[id].vue              # the editor
  pages/cms/login.vue
  components/fields/*.vue            # one per field type (§5.4)
  components/CmsEditorPalette.vue
  components/CmsEditorInspector.vue
  components/CmsEditorMediaLibrary.vue
  stores/draft.ts                    # Pinia — draft state, undo/redo
```

---

## 6. Odoo backend work

### 6.1 New model

`models/alokai_page_block.py`, registered in `models/__init__.py`. Fields per
§5.2. `_order = 'sequence, id'`.

### 6.2 GraphQL

Add `schemas/page_block.py`, registered in `schemas/__init__.py`. Follow the
existing pattern: append query classes to `query_registry`, mutations to
`mutation_registry`, and object types to `type_registry` (see
`graphql/registry.py`).

**Type:** `PageBlock` with `id`, `blockType`, `sequence`, `data` (a JSON scalar
— add one if `graphql_base` lacks it), plus resolved `imageUrl`, `products`,
`category`.

**Reads:** extend the existing `WebsitePage` type in `schemas/objects.py:1214`
with `blocks: [PageBlock]`, resolving only `version = 'published'` for public
callers. Extend the existing `websiteHomepage` query the same way rather than
replacing it.

**Writes (all require the editor group — §6.4):**

| Mutation | Notes |
| --- | --- |
| `savePageDraft(pageId, blocks: [PageBlockInput!]!)` | Replace-whole-list semantics; server diffs against existing draft rows by id. Matches how the editor holds state. |
| `publishPage(pageId)` | Copy `draft` rows over `published` rows atomically. |
| `discardDraft(pageId)` | Reset `draft` from `published`. |
| `createPage` / `updatePage` / `deletePage` | Page metadata: name, url, SEO, publish state. Validate slug uniqueness per `website_id`. |
| `draftPage(pageId)` query | Returns `version = 'draft'` blocks. Editor-only, group-checked. |

Asset upload cannot be GraphQL — add a multipart endpoint to
`controllers/main.py` that creates an `ir.attachment` and returns its
`image_url`, mirroring the existing `WebsiteMenuImage` / `BlogPost` URL pattern.

### 6.3 Server-side validation (mandatory)

> **Superseded by [CMS_ODOO_SPEC.md §2.2](./CMS_ODOO_SPEC.md#22-where-validation-lives-instead).**
> The TS→Python codegen step is **dropped**. Odoo is pure storage and never
> validates against a block schema; Nitro does, on every write, where the
> browser cannot skip it. Odoo keeps a structural backstop only.

`savePageDraft` must reject any block whose `block_type` is unknown or whose
`data` does not match that type's field schema. Keep the schema in **one** place
and generate the Python side from the TS block definitions (a small codegen
script, run in CI) so the two cannot drift. Do not hand-maintain two copies.

Sanitise all `richtext` field values server-side on write.

### 6.4 Permissions and auth

**Auth is nearly free — reuse what exists.** `schemas/sign.py:39` already calls
`request.session.authenticate(request.env, credential)`, producing a real
cookie-backed Odoo session — the same mechanism cart and account pages already
use. `auth_totp` is in the manifest depends and `TotpVerification` is
implemented. No JWT minting, no token service.

Required additions:

1. A `CMS Editor` group, plus `security/ir.model.access.csv` entries for
   `alokai.page.block` and write access on `alokai.website.page`.
2. Extend `LoadUserQuery` (consumed at `layers/auth/composables/useAuth.ts:44`)
   with a `cmsCanEdit` boolean resolved from group membership. This is for **UI
   affordances only** — never for authorisation.
3. Every write resolver re-checks group membership server-side.

> **Security note.** The existing read resolvers use `.sudo()` liberally — see
> `resolve_website_page` in `schemas/website_page.py`. CMS **write** resolvers
> must not, and must not trust `cmsCanEdit` from the client.

Editors are internal `res.users`, not portal users, and the existing `Login`
mutation authenticates any `res.users`. Give the editor its own
`/cms/login` route hitting the same mutation, so editor and customer sessions
stay conceptually separate and TOTP can be required on one and not the other.

### 6.5 Cache invalidation

Hook `create`/`write`/`unlink` on both `alokai.website.page` and
`alokai.page.block` into `invalidate.cache.create_invalidate_cache`, and add
`server/api/internal/cache/invalidate/page.post.ts` following the existing
`category.post.ts` / `homepage.post.ts` pattern.

Skipping this means editors publish, reload, see stale SWR content, and report
it as a bug. Treat it as part of the publish feature, not a follow-up.

---

## 7. Frontend rendering work

1. **`BlockRenderer.vue`** — maps `blockType` → component via the registry and
   renders `<component :is v-bind="block.data">`. Handles hydration strategy per
   §9.2.
2. **`cms-page.vue`** — the missing render target. Fetches by slug, renders
   `BlockRenderer`, emits SEO via the existing `utils/buildSEOHelper`.
3. **Fix `modules/routes-generator/index.ts:151-158`** — add
   `file: '#layers/cms/custom-pages/cms-page.vue'` to the pushed route, matching
   the category/product branches above.
4. **Add a catch-all** `[...slug].vue` that calls `/api/route-resolver` and
   dispatches to `cms-page.vue`, so pages created after the last build resolve.
5. **New queries** in `server/queries/` (`GetCmsPageQuery`,
   `GetCmsPageDraftQuery`, `GetCmsPagesQuery`), registered in the `QueryName`
   enum in `server/queries/index.ts`. Run `yarn codegen` after schema changes.
6. **Migrate the eight hardcoded content pages** by seeding block data. Keep
   `contact.vue`'s form as a dedicated `contact_form` block.
7. **Homepage as a CMS page** — make `/` an `alokai.website.page`, so the
   most-complained-about page is covered.

---

## 8. The editor UI

### 8.1 Layout

```
┌──────────────────────────────────────────────────────────────────┐
│ Home page          [Desktop ▾]  [Undo] [Redo]   Draft ● [Publish]│
├──────────┬───────────────────────────────────────────────────────┤
│ BLOCKS   │   ╔═══════════════════════════════════════════════╗   │
│ ▤ Hero   │   ║  real MainBanner renders here, real styles     ║   │
│ ▦ Cat.   │   ╚═══════════════════════════════════════════════╝   │
│ ▧ Best   │   ──────────── drop indicator ────────────            │
│   Sellers│   ┌───────────────────────────────────────────────┐   │
│ ▩ Banner │   │  Shop by Category            [⋮⋮] [👁] [🗑]   │   │
│ ▤ Value  │   │  real Categories component                    │   │
│   Props  │   └───────────────────────────────────────────────┘   │
└──────────┴───────────────────────────────────────────────────────┘
```

Left: block palette (the registry). Centre: the actual rendered page. Select a
block → inspector opens with fields from that block's definition.

**Live update as you type costs nothing to implement.** The inspector writes to
the Pinia draft store, `BlockRenderer` is bound to it, Vue re-renders the real
component. It is a consequence of the architecture, not a feature.

### 8.2 The technique that makes canvas drag-and-drop tractable

Dragging onto a live page is hard naively: blocks are arbitrary-height
full-bleed sections, and the real components are full of links, buttons and
sliders that swallow pointer events. The fix is to never touch them.

```vue
<!-- CmsBlockShell.vue -->
<div class="cms-block" @pointerdown="select">
  <div class="cms-block__overlay" />   <!-- captures ALL pointer events -->
  <component :is="c" v-bind="block.data" />  <!-- pointer-events: none -->
</div>
```

A transparent, absolutely-positioned overlay per block absorbs hover, click and
drag; the real component underneath is inert. The DnD library now only ever sees
a **flat list of uniform divs** — the easy, well-supported case. Canvas
drag-and-drop collapses into list drag-and-drop.

### 8.3 Drag-and-drop mechanics

> **Superseded by [CMS_ODOO_SPEC.md §13](./CMS_ODOO_SPEC.md#13-deliberate-follow-ups).**
> Sortable.js was not used and is not recommended: it mutates the DOM and fights
> Vue for ownership of the render. The PoC uses the browser's own HTML5 drag;
> the planned replacement is Pointer Events, for touch support.

Use `useSortable` from `@vueuse/integrations` (`@vueuse/nuxt` is already a
dependency; add `sortablejs`). Two lists sharing a group:

- Palette: `group: { name: 'blocks', pull: 'clone', put: false }`
- Canvas: `group: { name: 'blocks' }`

That is Sortable's documented shared-group configuration, not custom work. On
drop, insert `{ id: nanoid(), blockType, data: defaultsFromSchema(schema) }` at
the target index, auto-select the new block, and open the inspector.

### 8.4 Canvas layout — a decision that materially affects cost

The components use `narrow-container` and viewport units such as
`clamp(40px, 6vw, 80px)`. In a canvas squeezed into a centre column, `6vw` still
resolves against the **window**, so every font size and gutter renders wrong —
defeating the purpose of the editor.

**Option A — full-width canvas, floating inspector (recommended for v1).**
Canvas spans the viewport; palette and inspector are collapsible overlay
drawers. Viewport units and media queries are correct, drag-and-drop stays
same-document. Roughly two weeks cheaper. Cost: the inspector overlays part of
the page — mitigate by scrolling the selected block into the clear area.

**Option B — iframe canvas with side panels.** The Payload/Webflow look. Perfect
fidelity plus a free desktop/tablet/mobile toggle. Cost: drag-and-drop becomes
cross-document, which Sortable does not support. It must be hand-rolled — the
iframe posts block bounding boxes to the parent, the parent tracks the pointer
and computes the insertion index, then posts back where to draw the indicator.
Well-understood geometry, ~200 lines, but budget 1.5–2 weeks plus state sync.

Start with A. `BlockRenderer` is unchanged either way, so this is not a one-way
door.

### 8.5 Draft vs published

> **Superseded by [CMS_ODOO_SPEC.md §7](./CMS_ODOO_SPEC.md#7-revisions).**
> The draft/published split is now draft-plus-revisions, with rollback.

Editing must never touch the live page. The `version` field on
`alokai.page.block` (§5.2) provides this: the editor reads and writes `draft`
rows, the storefront reads `published` rows, and **Publish** copies draft over
published.

This is the most commonly underestimated piece of the project. Without it, every
keystroke in the editor is live to customers.

The editor must also **bypass SWR entirely** — `routeRules` with caching off for
`/cms/**`, and draft reads must go through
`server/api/odoo/query-no-cache.post.ts`, not `query.post.ts`. Otherwise the
editor shows stale content and appears broken.

### 8.6 Undo/redo

Merchants expect `Cmd+Z`. Because block data is plain JSON, snapshot the block
array into a bounded stack on each mutation. Roughly two days. Do not skip it —
it is cheap here and expensive to retrofit.

---

## 9. Known gotchas, specific to this codebase

### 9.1 `BestSellers` fetches its own data

It calls `useProductTemplateList('best-sellers')` with a **fixed** cache key.
Two product blocks on one page will collide. Pass the block instance id as the
key instead.

Keep the self-fetching pattern and expose `pageSize` and `sort` as block fields,
rather than lifting the query into the page. Less refactoring, and the component
stays usable outside the CMS.

### 9.2 Lazy hydration breaks under dynamic components

`layers/home/pages/index.vue` uses `<LazyBestSellers hydrate-on-visible />`. The
`Lazy` prefix is Nuxt compiler magic that `<component :is>` does **not** get —
so a naive `BlockRenderer` silently loses the deferred-hydration performance
work from recent commits.

`BlockRenderer` must therefore use explicit `defineAsyncComponent` with Vue's
`hydrateOnVisible()` in production mode, and **eager** hydration in edit mode
(blocks must be selectable immediately). Verify with a production build, not
just `dev`.

### 9.3 Rich text needs a real dependency

Use TipTap. Do not hand-roll a WYSIWYG. Sanitise server-side on write (§6.3).

### 9.4 Do not build nested blocks in v1

Nested drop zones roughly double drag-and-drop complexity: dragging between
levels, ambiguous drop targets, recursive selection state. Ship a flat block
list; add a `columns` block later if merchants actually ask for it.

### 9.5 SSR

Production block rendering must server-render for SEO. The editor is
client-only. Ensure `mode: 'edit'` never leaks into prerendered output.

### 9.6 Endpoint inconsistency worth checking

`modules/routes-generator/index.ts` posts to `/graphql/vsf`, while the addon
manifest documents `/graphql/alokai`. Confirm which is canonical before adding
new build-time queries.

---

## 10. Phased plan

The phasing is deliberate: **Phase A proves the block schema before any UI
depends on it, and Phase B delivers most of the customer value before the
expensive part starts.** Building the canvas first means designing drop-target UI
and inspector fields against an unvalidated block set, which will churn.

### Phase A — pages render from data (≈3 weeks)

No editor. Content is still dev-edited, but it lives in Odoo.

- [ ] `alokai.page.block` model; add `block_ids`; migrate away from `content` and
      `page_type`.
- [ ] `defineBlock` helper and the block registry.
- [ ] **Parameterise ~10 components** — `MainBanner`, `Categories`,
      `BestSellers`, `BannerRight`, `ValueProps`, plus what the content pages
      need. Half a day to a day each; this is the long pole.
- [ ] `PageBlock` GraphQL type; `blocks` on `WebsitePage` and `websiteHomepage`.
- [ ] Schema → Python validation codegen (§6.3).
- [ ] `BlockRenderer.vue` with correct hydration (§9.2), `cms-page.vue`.
- [ ] Fix `routes-generator` (§4.2 gap 1); add the catch-all (gap 3).
- [ ] Migrate the eight content pages and the homepage to seeded block data.
- [ ] Cache invalidation for pages and blocks.

**Exit criteria:** every current page renders from Odoo data, with no SEO or
Lighthouse regression against `main`.

### Phase B — merchants edit copy and images (≈2–3 weeks)

No drag-and-drop. **This is the milestone that answers the actual complaint** —
copy and images are the bulk of it — and it ships around week 6.

- [ ] `CMS Editor` group, ACL, `cmsCanEdit`, `/cms/login`.
- [ ] Page list with publish/unpublish.
- [ ] Field registry (§5.4) — all widget types except `array` nesting polish.
- [ ] Inspector editing of existing blocks.
- [ ] `savePageDraft`, `publishPage`, draft/published split.
- [ ] Asset upload endpoint plus a minimal media picker.

**Exit criteria:** a merchant changes homepage hero copy and image, publishes,
and sees it live — without a developer.

### Phase C — the drag-and-drop editor (≈5–7 weeks)

- [ ] Editor shell, canvas layout per §8.4.
- [ ] `CmsBlockShell` overlay technique (§8.2).
- [ ] Palette, Sortable wiring, insert/remove/reorder (§8.3).
- [ ] Undo/redo (§8.6).
- [ ] Full media library (browse, alt text, reuse).
- [ ] `array` repeater fields with nested reordering.
- [ ] TipTap rich text.
- [ ] Responsive preview toggle, if Option B was chosen.

**Exit criteria:** a merchant builds a new campaign page from scratch, from the
palette, and publishes it.

### Effort summary

| Phase | Estimate |
| --- | --- |
| A — data-driven rendering | ~3 weeks |
| B — copy/image editing | ~2–3 weeks |
| C — drag-and-drop editor | ~5–7 weeks |
| **Total** | **~10–13 weeks** |

Assumes one experienced Vue/Nuxt developer working full time, with Odoo support
available for §6. Add roughly 40% if this is part-time alongside client
delivery.

**Nothing here is research-hard** — every piece is a known pattern. But this is
a small CMS product, not a feature, and the schedule risk is not the
drag-and-drop (§8.2 makes that ~2 weeks). It is the surrounding surface area:
media library, versioning, undo, page management, validation. Each is
small-but-not-free, and that is what teams consistently underestimate.

---

## 11. Open decisions

> **Mostly settled.** 1 (canvas layout) → Option A, built. 2 (Phase C funding)
> → proceeding. 3 (block set) → seven blocks shipped in the PoC. 5 (endpoint)
> → `/graphql/vsf`, confirmed in `query.post.ts`. **4 (i18n) remains open** and
> blocks the schema — see
> [CMS_ODOO_SPEC.md §11](./CMS_ODOO_SPEC.md#11-open-decision--i18n).

1. **Canvas layout** — Option A or B (§8.4). Recommendation: A for v1.
2. **Is Phase C funded up front, or re-evaluated after Phase B ships?**
   Recommendation: re-evaluate. Phase B is roughly 80% of the complaint for
   roughly 25% of the cost, and every line of it is load-bearing for Phase C, so
   nothing is wasted by deciding later.
3. **Block set** — the ~10 in Phase A are inferred from existing components.
   Confirm against what merchants actually ask for before parameterising.
4. **i18n** — `name` and `content` already use `translate=True`. Decide whether
   `data` JSON needs per-language values (Odoo can translate JSON fields, but
   the editor needs a language switcher) or whether v1 is single-language.
5. **Canonical GraphQL endpoint** — §9.6.
