import { defineConfig } from 'astro/config';

const configuredBase = process.env.SITE_BASE || '/literary-cats';
const base = configuredBase === '/' ? '/' : `/${configuredBase.replace(/^\/+|\/+$/g, '')}`;
const outDir = process.env.CLOUDFLARE_BUILD
  ? './.cloudflare/dist/literary-cats'
  : './dist';

export default defineConfig({
  site: process.env.SITE_URL || 'https://www.denkibrew.com',
  base,
  outDir,
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
});
