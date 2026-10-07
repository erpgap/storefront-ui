# CMS — Odoo persistence layer

Implementation spec for moving the CMS proof of concept off its local file store
and onto Odoo.

**Status: built.** Both repos have a `feature/cms` branch, the module is
installed on `v19_alokai-odoo`, and the whole flow works end to end - sign in,
create a page, drag blocks, pick real products, publish, roll back, view the
live URL.

Section 12 records what shipped against the plan, and §14 what is left.
**Prerequisite reading:** [CMS_POC.md](./CMS_POC.md) for what already works.
[CMS_ARCHITECTURE.md](./CMS_ARCHITECTURE.md) for *why* Odoo rather than a
headless CMS — that reasoning still stands. Where the two documents disagree on
implementation, **this one wins**; superseded sections are marked there.

**Audience:** the developer building this, and whoever maintains it afterwards.
Assumes Odoo 19 addon development and Nuxt 4.

---

## 1. Scope

This is shipped as a **product to every Alokai merchant**, not a bespoke build.
That raises the bar on install/upgrade cleanliness, ACLs and multi-website
scoping, and it is why §10 is additive rather than a destructive migration.

**In scope:** the `alokai.page.block` storage model, revisions with rollback,
GraphQL read/write, the `CMS Editor` group, media on `ir.attachment`, cache
invalidation, and swapping `server/utils/cmsStore.ts` over.

**Not in scope:** changing the editor UX, the block set, or the rendering path.
Those already work and are not affected by where the data lives.

---

## 2. The split

The single most important decision, from which most of the rest follows:

| | Owns |
| --- | --- |
| **Alokai** | Block definitions, schema validation, migrations, the editor, rendering |
| **Odoo** | Rows, files, permissions, and the relational columns |

**Odoo never knows what a block is.** It does not validate `data` against a
block schema, it has no list of block types, and adding a block to the
storefront requires no Odoo change whatsoever.

### 2.1 What this replaces

The architecture doc (§6.3) specified a CI codegen step emitting a Python
validator from the TypeScript block definitions. **That is dropped.** It would
have made the Odoo addon — shipped to merchants — contain generated code whose
source lives in a different repository, and it would break the moment a merchant
customised their storefront's blocks.

### 2.2 Where validation lives instead

`validateBlocks` in `shared/cms/blocks.ts`, called from Nitro on every write.
This is server-side code a browser cannot skip: the browser talks to Nitro,
Nitro talks to Odoo.

Odoo keeps a cheap **structural** backstop only — is it a JSON array, is each
entry an object with a string `blockType`, is the payload under a size cap. It
never inspects field shapes.

> **Threat model, stated plainly.** Editors are authenticated internal
> `res.users` who were deliberately granted the CMS group. A hostile one can
> publish whatever text they like — that is what the role *is*. The realistic
> failure mode is a buggy client writing malformed JSON, which Nitro catches.
> We are not defending against the editor.

---

## 3. Data model

```
alokai.website.page                     (existing model, extended)
  draft_blocks           Json           # what the editor edits
  live_revision_id       m2o  → alokai.page.revision
  draft_attachment_ids   m2m  → ir.attachment
  … existing fields unchanged (see §10)

alokai.page.revision                    (new, IMMUTABLE once written)
  page_id                m2o  → alokai.website.page   (ondelete cascade)
  number                 int            # per page, monotonic
  blocks                 Json           # the whole published array
  restored_from_id       m2o  → alokai.page.revision  (nullable)
  create_uid, create_date               # who published, and when
  product_tmpl_ids       m2m  → product.template
  category_ids           m2m  → product.public.category
  attachment_ids         m2m  → ir.attachment
```

`_order = 'number desc'`. Index on `(page_id, number)`.

### 3.1 Why a JSON snapshot per revision, not a row per block

Rejected: one `alokai.page.block` row per block with a `version` char field, as
the architecture doc (§5.2) specified.

- **Publish is one INSERT**, not N inserts plus N deletes. A half-published page
  becomes impossible by construction rather than by transaction discipline.
- **Reading a live page is one row** — no join, no `ORDER BY sequence`, no N+1.
- **Restore is the same INSERT** from a different source. One code path.
- **No `sequence` bookkeeping.** Array order is the order. An entire class of
  "two blocks both have sequence 30" bugs does not exist.
- **Revisions are immutable**, so they are trivially cacheable and genuinely
  auditable.

What is given up is per-block SQL querying. Odoo is never supposed to know what
a block is, so this costs nothing — and the one cross-cutting question that
matters (§3.2) is answered *better* by the union columns.

### 3.2 The relational columns, and why they are not in the JSON

`data` is opaque to Odoo, so anything Odoo must answer a question about has to
live outside it. Alokai **mirrors** these on every publish: it walks the blocks,
collects every `product-ref` / `category-ref` / image value, and writes the
unions alongside the JSON.

The test for whether something needs a column:

> Will anything ever ask Odoo a question about this value?

- *"Which live pages feature product X?"* — a real question, asked by cache
  invalidation. **Column.**
- *"Which pages have a headline containing 'sale'?"* — nobody asks this.
  **JSON.**

`attachment_ids` exists for a second reason: an image referenced only from
inside opaque JSON has no ORM reference, so Odoo would consider it an orphan.
The m2m keeps it reachable.

### 3.3 Concurrency

Whole-document drafts mean two editors on one page clobber each other. Compare
`write_date` on save and reject with "someone else changed this page" rather
than silently overwriting. Roughly ten lines; do it before merchants share a
login.

---

## 4. Block schema versioning and migrations

Every block carries its schema version:

```json
{ "id": "blk_x", "blockType": "hero", "schemaVersion": 2, "data": { … } }
```

**Migrations are TypeScript functions in Alokai, never SQL in Odoo.** A
migration chain (v1→v2→v3) is applied on read, so old content keeps rendering
untouched, and a script can migrate eagerly when convenient.

The principle: the data is owned by Alokai, so its migrations belong in Alokai —
in the repo where the schema that defines them lives, where they are unit
testable. SQL migrations in Odoo for content Odoo does not understand would sit
in the wrong repository and could not be tested against their own schema.

With snapshots this is one `UPDATE` per revision rather than N per block.

Odoo-side migrations remain rare and structural — adding a column — which is
what Odoo's migration tooling is actually good at.

---

## 5. GraphQL contract

New module `schemas/page_block.py`, registered in `schemas/__init__.py` and
appended to `query_registry` / `mutation_registry` / `type_registry` per
`graphql/registry.py`.

`data` and `blocks` use `graphene.types.generic.GenericScalar`, already used in
`objects.py` for `json_ld` and `combination_info`. **No new scalar is needed.**

### Reads

| Operation | Notes |
| --- | --- |
| `WebsitePage.blocks` | Extends the existing type in `objects.py`. Resolves `live_revision_id.blocks`. Public. |
| `cmsPage(slug:)` | Published read for the storefront. Public, cacheable. |
| `cmsPageDraft(pageId:)` | Draft blocks. **Group-checked**, never cached. |
| `cmsPages` | Page list for the editor. Group-checked. |
| `cmsRevisions(pageId:)` | Revision list: number, author, date, `restoredFrom`. Group-checked. |

### Writes — all group-checked, none using `.sudo()`

| Mutation | Notes |
| --- | --- |
| `saveCmsDraft(pageId, blocks)` | Replace-whole-document. Checks `write_date`. |
| `publishCmsPage(pageId)` | Draft → new revision → `live_revision_id`. Mirrors §3.2 columns. Prunes per §7. |
| `restoreCmsRevision(pageId, revisionId)` | §7.2. |
| `createCmsPage` / `updateCmsPage` / `deleteCmsPage` | Slug uniqueness per `website_id`. |

> **Read this before reviewing the PR.** Every existing mutation in this addon
> uses `env['…'].sudo()`. That is fine for a contact form and catastrophic for
> "write arbitrary content to any page on the site". The CMS write resolvers
> deliberately break the module's prevailing pattern. They look wrong next to
> their neighbours; they are not.

---

## 6. Security

1. **`CMS Editor` group** inheriting `base.group_user` — editors are internal
   users, not portal users.
2. `security/ir.model.access.csv` rows for `alokai.page.revision`, and write
   access on `alokai.website.page` for the group.
3. **Record rules scoped by `website_id`**, so a multi-website install does not
   let one site's editor rewrite another's.
4. Every write resolver re-checks group membership server-side.
5. `LoadUserQuery` gains `cmsCanEdit`. **UI affordance only** — never
   authorisation.

**Authentication** reuses `schemas/sign.py` — the editor's own Odoo session,
exactly as cart and account already do. No service account, no secret to
rotate, and Odoo's audit trail names the actual person, which matters when
`create_uid` is what the revision list displays.

Nitro gets `/cms/login` and a route guard so editor and customer sessions
stay conceptually separate.

---

## 7. Revisions

Every publish creates a revision. Alokai renders the list with author and date.

### 7.1 Pruning

Keep the newest **10**, from `ir.config_parameter` `alokai_cms_revision_limit`,
following the existing `alokai_cache_invalidation` pattern. Merchants with
compliance needs raise it; merchants with thousands of pages lower it.

Because restore copies forward (§7.2), the live revision is always the newest,
so there is **no "never prune the live one" exception** to get wrong.

### 7.2 Restore

Restoring revision 7 **copies its blocks into a new revision 11**, sets
`restored_from_id = 7`, makes 11 live, and resets the draft to match.

Copy-forward, not a pointer move — `git revert`, not `git reset`:

- History stays append-only, so *"what was live on 3 March?"* always has an
  answer. A pointer's past positions are recorded nowhere.
- Pruning has no exceptions (above).
- Restoring renews the content's lifespan: 7's blocks survive inside 11 long
  after 7 itself is pruned.

**The draft is overwritten to match.** In almost every case the draft holds
exactly what is being rolled back *from*, so leaving it alone would show
"unpublished changes" pointing at the rejected content. If the draft differs
from what is about to become live, **warn and require confirmation** — a
rollback must never silently bin work in progress.

---

## 8. Media

Uploads become `ir.attachment` records via a multipart controller in
`controllers/main.py`, mirroring the existing `WebsiteMenuImage` / `BlogPost`
URL pattern. This replaces the PoC's `public/img/cms` shim.

Consistent with "Odoo stores things", and it introduces no new traffic pattern:
product images already serve from Odoo via `NUXT_PUBLIC_ODOO_BASE_IMAGE_URL`.

Keep the PoC's upload rules — allowlist of JPG/PNG/WebP/AVIF/GIF, 8 MB cap,
extension derived from the sniffed MIME type, not the filename. **SVG stays
refused**: it can carry `<script>`, which makes it stored XSS.

---

## 9. Caching and invalidation

The Odoo read runs only on cache miss and revalidation. Both existing layers
apply: `cachedFunction` around the GraphQL call, and SWR on the rendered route.

### 9.1 Cache the page, not the products

A cached CMS page holds **blocks and references**, never resolved product data.
Products keep their own cache and their own invalidation.

Baking product data into the page cache would make a single price change force
every page containing that product to re-render from Odoo — discarding the
product cache that already exists.

### 9.2 Give it its own cache key

`server/api/odoo/query.post.ts` keys on
`queryName-hashedParams-isoCode-pricelist`. **CMS content varies by neither
pricelist nor ISO code**, so the shared key fragments the cache once per
pricelist for no benefit. CMS page queries need their own key: slug +
`website_id` + lang.

### 9.3 Triggers

| Event | Invalidates |
| --- | --- |
| publish / restore / unpublish / delete | that page's slug |
| product or category write | every slug whose `live_revision_id` references it |

The second is the entire justification for the mirrored m2m in §3.2. Without it
you are back to TTL staleness, and merchants report it as a bug.

Hook both into the existing `invalidate.cache.create_invalidate_cache` queue and
add `server/api/internal/cache/invalidate/page.post.ts`, following
`category.post.ts`.

### 9.4 Warm them

Add CMS pages to the sitemap so the existing sitemap-driven warmer
pre-populates them. Cold CMS pages then do not exist in practice.

---

## 10. Compatibility — additive only

**`content` and `page_type` on `alokai.website.page` are NOT removed.** The
architecture doc (§5.2) said to drop and migrate both. For something installed
on merchant databases, v1 adds blocks alongside the existing fields so existing
installs keep working. Removal is a later, separately versioned migration with
its own release note.

Dropping a populated column during a customer's module upgrade is not a v1
behaviour.

---

## 11. i18n — settled, and built

**Decided: per-language values inside the JSON**, and implemented in the PoC
against the file store before committing it to the Odoo schema.

```json
{ "title": { "en": "Summer Sale", "pt": "Saldos de Verão" } }
```

Odoo stores it without knowing, exactly as §2 requires. Alokai resolves the
language at render via `resolveBlockData`, so **components receive
`title: "Saldos de Verão"` and know nothing about locales** — multi-language was
added without touching a single storefront component.

Rejected: one set of blocks per language. Its only advantage is a genuinely
different layout per market, and a merchant who wants that just creates another
page — which needs no schema feature. Meanwhile it costs per-language publish
state and a language switcher for every merchant including monolingual ones,
and an unfilled language would have no page at all rather than falling back.

`translate=True` is not available: it is a parameter on Odoo's string fields
(`Char`, `Text`, `Html`), not on `fields.Json`.

### 11.1 What building it taught us

Four things that would otherwise have surfaced in week two:

**Only some field types are language-specific.** `text`, `textarea`, `link` and
`image` are; `select`, `number` and `boolean` are not. "Show 4 products" is one
decision, not one per language, and translating it is meaningless. While editing
a non-default language those fields are hidden entirely, with one line of
explanation in the inspector rather than a lock message on every field.

**Array structure is shared; array content is not.** The repeater itself is
structural — adding a button in Portuguese would create a button that exists in
one language and not others, which is a layout difference wearing a
translation's clothes. So rows are added, removed and reordered in the default
language only, while their text is translated in every language. Getting this
wrong made button labels untranslatable in the first cut.

**Inherited is not missing.** An untranslated image or link falls back to the
default language and that is usually the *correct* answer — most photos and
most URLs are the same in every market. Only prose counts toward "3 fields to
translate", and the image control shows the inherited image with
"Using the English image" rather than an empty box lying about the state.

**Text must not fall back in the input.** Showing English inside a Portuguese
field would make untranslated content look finished and force the merchant to
delete it before typing. The source text goes in the placeholder instead, where
it helps as a reference without pretending to be a translation.

### 11.2 Content languages come from Odoo, not from Nuxt

`CMS_LOCALES` in `shared/cms/i18n.ts` is a PoC stand-in. The real list is
Odoo's active `res.lang` — **not** the Nuxt i18n config. A merchant may sell in
five languages while the storefront ships UI translations for three. Content
languages and interface languages are different lists and must not be
conflated.

### 11.3 Not the same thing as `i18n/locales/en.json`

UI strings stay where they are. They are developer-authored, change on deploy,
and a file handed to a translator is the right workflow for them.

CMS content is merchant-authored and changes on a Tuesday afternoon. Routing it
through a file-based workflow — locale files, PO, or Weblate — would reintroduce
exactly the developer bottleneck the CMS exists to remove. The merchant would be
filing a ticket to change a headline again.

### 11.4 Lazy migration, demonstrated

`resolveValue` accepts both a bare string and a per-language map. Content
written before this existed keeps rendering untouched and is normalised the next
time it is saved. That is §4's schema-version pattern in miniature, and it is
already working in the PoC.

## 12. What shipped

| # | Work | State |
| --- | --- | --- |
| 1 | Model, ACLs, group, record rules | done |
| 2 | Revisions: publish, restore, prune | done |
| 3 | GraphQL reads + `WebsitePage.blocks` | done |
| 4 | GraphQL writes, group checks, `write_date` guard | done |
| 5 | Odoo-backed `cmsStore` | done |
| 6 | `/cms/login`, route guard, editor check | done |
| 7 | Media on `ir.attachment` | done |
| 8 | Invalidation both directions | done |
| 9 | `product-ref` / `category-ref` + mirroring | done |
| 10 | `schemaVersion` + migration chain | done |
| 11 | Content languages from `res.lang` | done |

### 12.1 What testing caught

Worth recording, because each was invisible to inspection and only appeared
when the thing actually ran:

- **A duplicate `write`.** `ProductTemplate` already defined `write` further
  down the class body, which silently replaced the new one. Product changes
  queued nothing and the code looked correct.
- **Restore deleted its own source.** Creating a revision prunes, and with a
  small limit the revision being restored *from* was itself a candidate - so
  the next line read a deleted record. Content survived because restore copies
  forward; the audit link did not, which is why `restored_from_number` exists
  as a plain integer beside the many2one.
- **`select` fields became per-language maps.** The seeding function's
  fall-through branch caught them, producing values components could not read.
- **A new page arrived already failing validation.** Arrays seeded a row even
  with no minimum, so the hero's optional buttons had an empty required label
  before the merchant had typed anything.
- **Locale codes orphaned content.** Odoo's default is `en_US`; content written
  as `en` failed every required check. Resolution is now tolerant of region
  variants in both directions.
- **`''.split(',')` is `['']`.** Which `Number()` makes `0`, which
  `Number.isInteger` accepts - so an absent `ids` parameter became a search for
  record id 0 and returned nothing.

Two Odoo 19 API changes also bit: `res.groups.category_id` is now
`privilege_id` pointing at `res.groups.privilege`, and `_sql_constraints` is
replaced by `models.Constraint`.

## 14. Not done

- **Cross-browser verification.** Chromium only. No Firefox available in the
  build environment and WebKit would not launch, so the `dataTransfer.setData`
  fix for Firefox drag remains reasoned rather than tested.
- **Odoo-side automated tests.** The addon has a `tests/` directory; none were
  added. Everything here was verified through the running system, which is not
  the same thing as a suite that runs in CI.
- **Migration of the eight hardcoded content pages** and the homepage.
- **Load testing** against a realistic page and revision count.
- **`.to_migrate/website_cms`** left in place, pending whether any merchant has
  it installed on 18.0.

## 13A. Content on pages the storefront owns

Two mechanisms, deliberately different.

### The homepage is a page

It already has a url, so it becomes an ordinary CMS page with an `is_system`
flag: fully editable, but it cannot be deleted and its address is fixed. Both
guards live in the model, not the UI - hiding a button is a courtesy, the
model is the rule.

`/` renders CMS blocks when a page is published and the existing markup when
it is not, behind `NUXT_PUBLIC_CMS_HOMEPAGE`. A storefront with no CMS content
therefore looks exactly as it did.

**Its SEO lives on its own CMS page, like every other page's.** It did not at
first: the homepage wrote through to the website record, which cost a special
case in the model (`_seo_record`), a `source` flag on the API, an `isHomepage`
branch in the dialog and a `sudo()` write for editors who are not website
admins. The homepage is a CMS page, so its tags belong on it. Migration
`19.0.1.2.0` copies the existing values across without removing the originals.

`jsonLd` is the exception and stays on the website record, because it is not
page metadata: it is an `OnlineStore` block describing the business, computed
in Odoo from the company record and never authored. The storefront also still
reads the website record as a fallback, so an install that has not migrated,
or has the CMS homepage switched off, renders what it always did.

Measured on a production build, median of five runs, mobile with 4x CPU
throttle:

| | before | after |
| --- | ---: | ---: |
| LCP | 336ms | 336ms |
| CLS | 0.01 | 0.01 |
| JavaScript | 206.5KB | 215.1KB |
| Requests | 64 | 70 |

LCP element is the hero `<img>` in both, and every SEO tag is byte-identical.
The 8.6KB is blocks loading as async chunks rather than static imports.

### Category and product pages get regions

Those templates are mostly business logic - listings, variants, cart,
recommendations - and a merchant must not be able to rearrange them. So
instead of making the pages editable, the developer declares where content is
allowed:

```vue
<UiProductListing … />
<CmsRegion name="category-after" />
```

There is nowhere else for a block to go, which makes the constraint structural
rather than a rule somebody has to remember. Adding a slot is one line in a
template plus one in the install hook.

Regions share the page model, so drafts, revisions, publishing, validation and
the editor work for them with no second content pipeline. They start empty and
render nothing.

**Scope is global for now** - one block list under all category pages, one
under all product pages. Per-record overrides are a nullable column and an
additive migration whenever a merchant asks; every existing region simply
becomes the default.

**Publishing a region clears the whole route cache.** Its urls cannot be
enumerated, and a stale region is wrong on hundreds of pages at once, which is
worse than a cold cache for a few minutes.

### Seeding

The install hook creates the homepage from a snapshot of the storefront's
default blocks and declares the regions. Both are idempotent: re-running after
a release leaves merchant content alone, because by then it is theirs. Block
shapes drifting is what the schema migrations in §4 are for.

## 13. Deliberate follow-ups

Not v1, and recorded here so they stay decisions rather than tribal knowledge:

- **Replace HTML5 drag-and-drop with Pointer Events.** The current
  implementation has no touch support and never will — it predates the iPhone.
  Pointer Events unify mouse, touch and pen; `setPointerCapture` handles the
  "cursor left the element" case. Roughly a day, because `CmsBlockShell`'s
  overlay already reduced the canvas to a flat list of rectangles and the
  geometry is unchanged. **Not Sortable.js**, which the architecture doc (§8.3)
  recommends: it mutates the DOM directly and fights Vue for ownership of the
  render, which is the entire reason `vuedraggable` exists. Slot this in after
  Odoo and before shipping broadly — "doesn't work on iPad" is cheap now and
  embarrassing in a customer demo.
- **"Keep this version" pin** exempting a revision from pruning. A boolean, a
  filter, a star icon. Does not change the schema shape, so it stays easy.
- **Rich text (TipTap)**, sanitised server-side on write.
- **Homepage as a CMS page.** The capability is built; the switch stays off.
- **A Weblate bridge**, if a merchant has an agency or a review workflow.
  Weblate is a clear win for `i18n/locales/*.json` today and worth doing on its
  own merits. For CMS *content* it is a v2 integration: push a page's source
  strings via the API, pull completed translations back. Only practical with the
  shape chosen in §11 — per-language values flatten to `page.11.blk_x.title`,
  which is a Weblate JSON component, whereas separate blocks per language have
  no source/target pairing at all. Odoo stays the store; Weblate reads and
  writes.
- **Machine-translate a page** (DeepL or similar) to pre-fill every field for
  the merchant to tidy. Only possible because source and target sit side by
  side.
- **Removing `content` / `page_type`** (§10).
