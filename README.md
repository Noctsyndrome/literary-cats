# Literary Cats

A small archive for the daily ChatGPT series introducing cats that appear in literature.

## Repository layout

- `data/characters.json` — persistent index of cats that have already been introduced. This is the primary source for deduplication.
- `entries/` — one Markdown article per successful daily run, named `YYYY-MM-DD-slug.md`.

## Daily workflow

Each scheduled run should:

1. Read `data/characters.json` before selecting a cat.
2. Reject any candidate whose canonical name or alias already exists in the index.
3. Research the character, prioritizing the original literary text for appearance details and supplementing with well-established illustrations or screen adaptations when useful.
4. Generate the ChatGPT article using the fixed title format `今天的文学猫角色：角色名`.
5. Save the complete article to `entries/YYYY-MM-DD-slug.md`.
6. Only after the entry file is written successfully, append the new character record to `data/characters.json` and commit the update.
7. Deliver the same article in ChatGPT.

If the GitHub write fails, the ChatGPT delivery may still proceed, but the response should add an `额外说明` noting that archival or index update failed. The index must not be updated before the corresponding entry file has been created successfully.

## Historical data

The initial `characters.json` is backfilled from the literary-cat series that existed before this repository was created. Exact publication dates and entry paths are intentionally left blank for those historical records rather than guessed.
