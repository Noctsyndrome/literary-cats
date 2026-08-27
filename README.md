# Literary Cats

A small archive for the daily ChatGPT series introducing cats that appear in literature.

## Repository layout

- `data/characters.json` — persistent index of cats that have already been introduced. This is the primary source for deduplication.
- `entries/` — one Markdown article per successful daily run, named `YYYY-MM-DD-slug.md`.
- `assets/` — local image archive for visual references used by the series.

## Daily workflow

Each scheduled run should:

1. Read `data/characters.json` before selecting a cat.
2. Reject any candidate whose canonical name or alias already exists in the index.
3. Research the character, prioritizing the original literary text for appearance details and supplementing with well-established illustrations or screen adaptations when useful.
4. Generate the ChatGPT article using the fixed title format `今天的文学猫角色：角色名`.
5. Save every visual reference actually used for the entry into `assets/<slug>/` whenever the source image can be retrieved, and use repository-relative Markdown image paths in the entry. The repository copy is the primary display resource; external URLs are provenance, not the rendering dependency.
6. For each local image, preserve the original source page, direct image URL when available, creator/organization when known, and a short source note in the entry's `视觉参考` section.
7. Save the complete article to `entries/YYYY-MM-DD-slug.md`.
8. Only after the image assets and entry file are written successfully, append the new character record to `data/characters.json` and commit the update.
9. Deliver the same article body in ChatGPT.

If an image cannot be retrieved or GitHub write fails, the ChatGPT delivery may still proceed, but the response should add an `额外说明` noting which archival step failed. The index must not be updated before the corresponding entry file has been created successfully.

## Visual references

The archive follows a local-first strategy for stable display. Images used in the ChatGPT presentation should be copied into `assets/<slug>/` whenever technically retrievable, then referenced from the Markdown entry with relative paths such as `![说明](../assets/<slug>/image.jpg)`.

Source attribution is preserved separately from display. Each entry should keep the original source page and, when available, the original direct image URL, creator or institution, and a short provenance note. This allows the Markdown to remain visually stable even if an external image host later changes or disables hotlinking.

ChatGPT-internal `turn...image...` identifiers are presentation references rather than durable source URLs and should not be stored as archive links. When historical entries only retain such internal references, re-identify the corresponding external source or an equivalent authoritative reference before local archival.

## Historical data

The first twelve entries, covering the original run sequence from 2026-08-15 through 2026-08-26, were reconstructed and rewritten on 2026-08-27 so that the archive starts with the current editorial standard rather than preserving inconsistent early drafts. The duplicate Behemoth delivery on 2026-08-27 is not treated as a separate entry; its richer material was used when revising the original 2026-08-15 Behemoth article.
