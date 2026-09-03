# Literary Cats

A small archive for the daily ChatGPT series introducing cats that appear in literature.

The repository also contains an Astro static site that reads the archive files directly. No separate CMS or duplicated content index is required.

## Website development

```bash
npm install
npm run dev
```

The production build defaults to `https://www.denkibrew.com/literary-cats/`:

```bash
npm run build
```

For a root-domain deployment such as `https://cats.denkibrew.com/`, build with:

```bash
SITE_URL=https://cats.denkibrew.com SITE_BASE=/ npm run build
```

Generated files are written to `dist/`. The archive pages are created from `data/characters.json` and `entries/*.md`; referenced files under `assets/` are fingerprinted into the static build automatically.

## Cloudflare deployment

The site is deployed as Cloudflare Worker Static Assets and managed with the project-local Wrangler dependency. Authenticate a new machine once with:

```bash
npx wrangler login
```

Publish and inspect the `workers.dev` preview first:

```bash
npm run deploy
```

After verification, publish the same build to `https://www.denkibrew.com/literary-cats/`:

```bash
npm run deploy:production
```

The production Worker routes are limited to `www.denkibrew.com/literary-cats` and `www.denkibrew.com/literary-cats/*`; the existing homepage and all unrelated paths remain outside this Worker. Cloudflare-ready files are generated under `.cloudflare/dist/literary-cats/` and are not committed.

## Repository layout

- `data/characters.json` — persistent index of cats that have already been introduced. This is the primary source for deduplication.
- `entries/` — one Markdown article per successful daily run, named `YYYY-MM-DD-slug.md`.
- `assets/` — local image archive for the visual references used by each entry.

## Daily workflow

Each scheduled run should:

1. Read `data/characters.json` before selecting a cat.
2. Reject any candidate whose canonical name or alias already exists in the index.
3. Research the character, prioritizing the original literary text for appearance details and supplementing with well-established illustrations or screen adaptations when useful.
4. Generate the ChatGPT article using the fixed title format `今天的文学猫角色：角色名`.
5. Use two visual references by default. Prefer complementary images, such as an original/early illustration plus a classic screen or later authoritative visualization, or an overall portrait plus a second scene/version. Use fewer than two only when a genuinely useful second reference cannot be found.
6. Save the image files under `assets/<slug>/` using the standard numbered filenames. Source URLs remain in the entry for provenance; local files are the primary display resources.
7. Save the complete article to `entries/YYYY-MM-DD-slug.md`. The GitHub version may include a final `视觉参考` section containing source and provenance details, but it must not expose repository-internal `本地文件` path lines.
8. Only after the entry file is written successfully, append the new character record to `data/characters.json` and commit the update.
9. Deliver the same article body in ChatGPT.

If the GitHub write fails, the ChatGPT delivery may still proceed, but the response should add an `额外说明` noting that archival or index update failed. The index must not be updated before the corresponding entry file has been created successfully.

## Visual references

The archive follows a local-first strategy for stable display. Images actually used in the series should be copied into `assets/<slug>/` whenever their files can be retrieved and named sequentially, such as `01.jpg` and `02.jpg`. The site resolves those assets from the entry slug, so repository-relative local paths should not be printed in the Markdown article.

The default visual set is two images per cat. The pair should add information rather than duplicate the same view. Early or unusually obscure entries may contain only one image when a second useful reference is genuinely unavailable.

Each local image must keep provenance information in the entry: the original source page, direct image URL when available, creator/institution when known, and a short note describing what the image contributes. Source information is for traceability; repository-local files are for stable rendering.

ChatGPT-internal `turn...image...` identifiers are presentation references, not durable external URLs, and must never be stored as archive links. For historical entries where only such an internal reference remains, relocate the same or an equivalent external reference and archive the recovered image locally.

## Historical data

The first twelve entries, covering the original run sequence from 2026-08-15 through 2026-08-26, were reconstructed and rewritten on 2026-08-27 so that the archive starts with the current editorial standard rather than preserving inconsistent early drafts. The duplicate Behemoth delivery on 2026-08-27 is not treated as a separate entry; its richer material was used when revising the original 2026-08-15 Behemoth article.

The historical image backfill subsequently archived two local visual references for each of those twelve entries and retained their external provenance in the Markdown files.
