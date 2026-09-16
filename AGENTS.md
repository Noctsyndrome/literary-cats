# Literary Cats — Development and Maintenance

These instructions apply to development and maintenance within this repository. README is for site visitors: keep it focused on the project rather than build commands, deployment procedures, or animation internals.

Write README and this guide in English. Preserve literal Chinese UI strings and parser markers when documenting their exact values.

## Project Structure

- `entries/`: daily character articles named `YYYY-MM-DD-slug.md`.
- `assets/<slug>/`: reference images for each entry, usually numbered `01`, `02`, and so on.
- `data/characters.json`: the character index and deduplication source, linking article paths, collection dates, works, and authors.
- `src/lib/content.ts`: index loading, Markdown parsing, image resolution, and internal URL generation.
- `src/pages/index.astro` and `src/pages/cats/[slug].astro`: the homepage and entry pages.
- `src/layouts/BaseLayout.astro` and `src/styles/`: shared layout and styles.
- `src/components/MastheadPlay.astro`, `src/lib/masthead-raster.mjs`, and `src/assets/masthead/`: the animation component, scene sampling, and production sprite atlases.
- `astro.config.mjs`, `wrangler.jsonc`, and `.github/workflows/deploy-site.yml`: build, routing, and deployment configuration.

The site reads the archive directly rather than maintaining a separate content database. Preserve the article, image, and index interfaces used by the daily task.

## Content Contracts and Parsing

- Do not casually change index fields, article naming, or image directory structure. Each daily update should include the article, images, and index changes in one complete commit. Prepare the files before updating the index to avoid dangling records.
- Markdown titles follow the literal format `今天的文学猫角色：角色名` ("Today's literary cat: character name"). The parser extracts consecutive images after the title, allowing blank lines between them; preserve this compatibility.
- Extracted reference images are rearranged on the entry page: the first appears before the body, and the second after it. Blank lines between the title and images must not change this layout.
- The literal heading `### 视觉参考` separates the body from visual references. Preserve attribution, descriptions, and original links. Do not add standalone internal-path notes such as `本地文件：../assets/...`; Markdown image references themselves still use relative paths.
- Display archived local images. When adding a format, check the asset glob in `content.ts`; it currently supports jpg, jpeg, png, gif, webp, and avif. Validate GIF build output and deployed resources, not just filenames.
- Design around the stable fields that the daily task already produces. Do not require extra subtitles, introductions, or tags that are absent from the archive.
- Entries are ordered newest first. "Previous cat" means the adjacent newer record; "Next cat" means the adjacent older record. Include collection dates, do not wrap between the endpoints, and never link an entry to itself.

## Local Development and Validation

CI uses Node.js 22. Install dependencies and start the local site:

```bash
npm ci
npm run dev
```

The default local URL is `http://localhost:4321/literary-cats/`; use the actual port reported by the server.

```bash
npm run build
node --test src/lib/masthead-raster.test.mjs src/lib/masthead-pan.test.mjs
npm run build:cloudflare
```

- Normal builds write to `dist/`; Cloudflare builds write to `.cloudflare/dist/literary-cats/`. Both run Astro's type checks first.
- `SITE_URL` and `SITE_BASE` override the site URL and base path. Use `SITE_BASE=/` for a root-path build. Generate internal links with `withBase()` rather than hardcoding root-relative routes.
- Match validation to the change: check image/body order for parser edits; newest, oldest, and middle entries for navigation; desktop, mobile, and long titles for layout. Run production tests and builds before release. Documentation-only edits need content, link, and diff checks.
- Default to ego-browser for browser checks; explain any fallback if it is unavailable. Respect browser ownership and do not take over while the user is reviewing manually.
- A successful build is not visual approval. Report which checks actually ran; do not present old screenshots or unverified browser behavior as current evidence.

## Established Design Conventions

- Preserve the literary-newspaper direction, warm yellow accent, and readable article layout. Do not replace them with a red theme or generic product landing page.
- Keep the site title `文学猫档案` and tagline `认识文学作品里的猫。` unchanged.
- The footer cat is decorative, not a home button or other control. Keep the beer emoji, visible underline, and normal font weight on the Dennki Brewing link.
- Entry navigation is side by side on desktop and stacked on mobile. At an endpoint, show only the available direction.

## Masthead Animation Maintenance

The following behavior has been approved. Keep the implementation, tests, and this section in sync when changing it.

- Use six imagegen-created whole-frame raster atlases, emitted as WebP by Astro. Load and decode images on demand rather than unconditionally loading all animation assets on the initial page view.
- On desktop, hovering over the title for 500ms starts the approximately 8.6-second story. Moving the pointer away after playback starts does not interrupt it. Leaving and re-entering after completion replays it without an extra cooldown. Insufficient space falls back to a brief peek or no decoration.
- On touch screens, only the homepage explicitly enables autoplay through `mastheadAutoPlay`. Once at least 60% of the title area is visible, wait 1200ms, then prepare the artwork and play. Autoplay runs once per homepage load; entry pages do not autoplay.
- On phones, the full story shares the title row without increasing header height. The title exits with the ball's cubic ease-out over 0.85 seconds, then returns linearly from 6.25 to 8.35 seconds, overlapping the cat and ball as they leave. Do not use separate acceleration/cruise/braking stages or bounce.
- Align the stage's right edge with the title underline's right endpoint. The cat and ball enter and leave through that edge. Preserve the complete silhouette and tail. Leftward travel reuses the approved return-run atlas; turning uses separate transition frames.
- Falling below the visibility threshold, hiding the page, changing layout, or a drawing failure stops playback and restores the title. An interrupted, already-started autoplay neither resumes nor automatically repeats.
- Respect `prefers-reduced-motion` and keep the title link and navigation usable without JavaScript.
- Early SVG, character, or gait experiments may still exist locally. Do not treat untracked experiments as production dependencies or include them in commits without approval.

## Branches and Deployment

- Check the branch, working tree, and remote state before editing. Preserve existing user changes. Prefer safe fast-forwards when synchronizing branches; do not forcibly overwrite local history.
- UI work defaults to `redesign`: offer a local preview and obtain approval before merging into `main`. Follow an explicit request to use a different branch.
- Without authorization to commit, push, or deploy, keep changes local. A passing build is not permission to publish.
- Production is `https://www.denkibrew.com/literary-cats/`, served by Cloudflare Worker Static Assets and managed through the project-local Wrangler dependency.
- The production Worker is `literary-cats-production`. Its routes cover only `www.denkibrew.com/literary-cats` and `www.denkibrew.com/literary-cats/*`; do not expand them to the main site or unrelated paths.
- Actions currently deploys only when a `main` push matches its path filters: the character index, `src/**`, and Astro/package/Wrangler configuration. README, AGENTS, and other documentation-only changes do not trigger it. Treat the workflow file as the source of truth.
- Use the existing Actions release flow: install locked dependencies, build production output, deploy with Wrangler, and check the live site. The workflow can also be dispatched manually when appropriate; avoid deploying the same update twice.
- CI requires secrets named `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`. Local authentication does not establish CI access. Check permissions and presence only; never print or commit credentials.
- Use the commands below only for an authorized manual release. `npm run deploy` targets the non-production workers.dev environment; `npm run deploy:production` targets production.

```bash
npx wrangler login
npm run deploy
npm run deploy:production
```

- For a push that triggers deployment, wait for the matching commit's Actions run to finish, then check the live version, homepage, entry navigation, and relevant resources. A successful push alone does not prove deployment. Distinguish browser playback checks from static resource checks.
- Keep build output, caches, credentials, and unapproved experiments out of release commits. At handoff, state the current branch, push and deployment status, and any changes still retained locally.
