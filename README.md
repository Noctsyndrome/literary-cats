# Literary Cats

A small archive for the daily ChatGPT series introducing cats that appear in literature.

## Repository layout

- `data/characters.json` — persistent index of cats that have already been introduced. This is the primary source for deduplication.
- `entries/` — one Markdown article per successful daily run, named `YYYY-MM-DD-slug.md`.
- `assets/` — local image archive for visual references that may legally and technically be redistributed.

## Daily workflow

Each scheduled run should:

1. Read `data/characters.json` before selecting a cat.
2. Reject any candidate whose canonical name or alias already exists in the index.
3. Research the character, prioritizing the original literary text for appearance details and supplementing with well-established illustrations or screen adaptations when useful.
4. Generate the ChatGPT article using the fixed title format `今天的文学猫角色：角色名`.
5. For visual references, prefer sources that can be archived locally: public-domain works, openly licensed images, or material with clear redistribution permission. Save eligible images under `assets/<slug>/` and use repository-relative Markdown image paths in the entry.
6. When a useful reference image cannot legally or reliably be mirrored into this public repository, do not hotlink it as the primary display image. Keep the stable source-page URL in the entry instead, with a short note explaining that the image remains external.
7. Save the complete article to `entries/YYYY-MM-DD-slug.md`. The GitHub version may include a final `视觉参考` section containing local image references and source/provenance links.
8. Only after the entry file is written successfully, append the new character record to `data/characters.json` and commit the update.
9. Deliver the same article body in ChatGPT.

If the GitHub write fails, the ChatGPT delivery may still proceed, but the response should add an `额外说明` noting that archival or index update failed. The index must not be updated before the corresponding entry file has been created successfully.

## Visual references

The archive follows a local-first strategy for stable display. When an image is public domain, openly licensed, explicitly redistribution-permitted, or owned/authorized by the repository owner, copy the image into `assets/<slug>/` and reference it from the Markdown entry with a relative path. Preserve the original source page, creator, license/status, and other provenance information alongside the image reference.

Do not mirror copyrighted modern book covers, film stills, contemporary illustrations, or other third-party images into this public repository unless redistribution permission is clear. For those, preserve the stable source page and descriptive metadata instead of depending on fragile direct-image hotlinks.

ChatGPT-internal `turn...image...` identifiers are presentation references, not durable external URLs, and must never be stored as archive links.

## Historical data

The first twelve entries, covering the original run sequence from 2026-08-15 through 2026-08-26, were reconstructed and rewritten on 2026-08-27 so that the archive starts with the current editorial standard rather than preserving inconsistent early drafts. The duplicate Behemoth delivery on 2026-08-27 is not treated as a separate entry; its richer material was used when revising the original 2026-08-15 Behemoth article.
