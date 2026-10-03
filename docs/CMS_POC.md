# Alokai CMS — running it

The CMS lets a merchant edit storefront pages, in a visual editor, using the
storefront's own components. This is the operating guide.

**Design:** [CMS_ARCHITECTURE.md](./CMS_ARCHITECTURE.md) for why Odoo rather
than a headless CMS. [CMS_ODOO_SPEC.md](./CMS_ODOO_SPEC.md) for how it is
built, and every decision behind it.

---

## Run it

```bash
# Odoo must be reachable: `yarn dev` runs codegen against its schema first.
yarn dev
```

Then **http://localhost:3000/studio** and sign in with an Odoo account that
is in the **CMS Editor** group. A fresh install grants it to `admin`.

Without Odoo, `NUXT_CMS_BACKEND=file npx nuxt dev` falls back to a local file
store: the editor works, there is no login and no version history. Useful for
front-end work, not for anything real.

## What a merchant can do

**Pages.** Create one, give it an address, fill it with blocks, publish. It
appears at its own url, server-rendered, with no rebuild and no deploy.

**The homepage.** An ordinary page, except it cannot be deleted and its
address is fixed. Seeded on install from the storefront's default blocks, so
it is editable out of the box.

**Content inside pages the storefront owns.** Category and product pages are
mostly business logic, so the merchant cannot rearrange them. Instead the
storefront declares slots — currently below the category listing and below
the product details — and the merchant fills those. Listed in the studio
under *Content on other pages*.

**Versions.** Every publish keeps a version, with who published it and when.
Restoring one copies it forward and makes it live, so nothing is lost by
rolling back. The last ten are kept, configurable via
`alokai_cms_revision_limit`.

**Languages.** A picker in the top bar, when the website has more than one
active language in Odoo. Untranslated prose is counted and flagged;
untranslated images and links quietly inherit. Layout and settings are shared
across languages.

## How it hangs together

| | |
| --- | --- |
| **Alokai** | Block definitions, validation, migrations, the editor, rendering |
| **Odoo** | Rows, files, permissions, and the relational columns |

Odoo never knows what a block *is*. Adding one to the storefront needs no
Odoo change at all — a schema entry in `shared/cms/blocks.ts` and a component
mapping in `layers/cms/blocks/index.ts`, and it appears in the palette, gets
an inspector form, is validated on write and renders in both the canvas and
production. Only a new *field type* costs editor code, which is why that list
is deliberately short.

## Properties worth not breaking

- **One render path.** `BlockRenderer` serves both production and the editor
  canvas. The canvas is not a preview of the page — it *is* the page.
- **Real components.** Blocks point at `MainBanner`, `Categories`,
  `BestSellers` and the rest. They were given props; nothing was
  reimplemented for the CMS, and each still renders unchanged with no props.
- **Drafts never leak.** The storefront reads published content, the editor
  writes drafts. They are separate columns.
- **Validation is server-side**, in Nitro, where a browser cannot skip it.
  Unknown block types are dropped, unknown keys stripped, `javascript:` urls
  rejected, SVG uploads refused.
- **Content only, never style.** No colour picker, no fonts, no spacing. The
  design system stays enforced in code. Expect recurring requests for "just a
  colour picker here"; each one is a hole in this.
- **Nothing depends on drag-and-drop working.** It has no touch support and
  never will, so every drag interaction has a click equivalent.

## Tests

```bash
yarn test        # unit — 92
yarn test:e2e    # browser, needs a running storefront — 19
yarn test:smoke  # http only, points anywhere — 16

# Odoo addon — 237. --workers 0 is required or HttpCase fails.
cd /path/to/alokai-odoo
./venv/bin/python src/19.0/odoo-bin -c confs/19.0.conf \
  -d <db> -u graphql_alokai --test-enable \
  --test-tags "/graphql_alokai" --workers 0 --stop-after-init
```

## Where the code is

```
shared/cms/blocks.ts          block schemas, validation, migrations
shared/cms/i18n.ts            per-language values and fallback

layers/cms/                   RENDERING — ships to production
  blocks/index.ts             schema -> real component
  components/BlockRenderer    the single render path
  components/CmsBlockShell    the edit-mode overlay
  components/CmsRegion        a slot inside a storefront-owned page
  custom-pages/cms-page.vue   the page render target
  pages/[...cmsSlug].vue      catch-all, so new pages resolve

layers/cms-studio/            THE EDITOR — never reaches a shopper
  pages/studio/*              list, editor, login
  components/Studio*          field registry, media, versions, pickers
  composables/useStudioDraft  blocks, selection, undo/redo, autosave

server/api/cms/               pages, drafts, publish, regions, media
server/utils/cmsOdooStore.ts  the Odoo implementation
server/utils/cmsStore.ts      the interface, and the file fallback
```

## Known gaps

| | |
| --- | --- |
| No rich text | TipTap, sanitised server-side |
| Region content is global, not per category or product | A nullable column and an additive migration |
| `content` and `page_type` on the page model are superseded but still present | Removal is a later, separately versioned migration |
| Browser tests are Chromium only | No Firefox available; WebKit would not launch |
| Images break periodically in dev | `sharp@0.32.6` fails to self-register in the Nitro worker. Restarting `yarn dev` clears it. The fix is `@nuxt/image` 2.x, which brings `sharp@0.35` — attempted and reverted, see below |


## The image pipeline upgrade, and why it was reverted

`sharp@0.32.6` periodically fails to self-register inside the Nitro dev
worker, which 500s every `/_ipx/` request and leaves the whole site without
images until `yarn dev` is restarted. It is not a broken install: sharp loads
fine in a fresh process, in a worker thread and on re-require. A native addon
can only self-register once per process, and something in the reload path
tries again in a new context.

`ipx@2` pins `sharp ^0.32.6`, so the version cannot be raised on its own. The
upgrade path is `@nuxt/image` 1.11 → 2.x, which brings `ipx@4` and
`sharp@0.35`.

Attempted. Two things stopped it:

1. **The build fails on `providers/odoo-provider.ts`.** `@nuxt/image` v2
   changed the provider contract and no longer accepts the current export
   shape. That file decides the url of every product image on the site, so
   getting it subtly wrong means a catalogue of broken images.
2. **`@nuxt/image@2.1.0` depends on `ipx@4.0.0-beta.1`** — a beta, in the
   image pipeline of a production storefront.

Neither is insurmountable and the first is probably an hour's work, but both
are decisions rather than maintenance. Reverted to 1.11.0 / ipx 2.1.1 /
sharp 0.32.6; restarting the dev server remains the workaround.
