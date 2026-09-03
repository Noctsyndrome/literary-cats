import { marked } from 'marked';
import characterData from '../../data/characters.json';

export type CharacterRecord = {
  canonical_name: string;
  aliases: string[];
  work: string;
  work_zh: string;
  author: string;
  introduced_date: string;
  entry_path: string;
  source: string;
};

export type CatEntry = CharacterRecord & {
  slug: string;
  title: string;
  chineseName: string;
  cover: string;
  images: Array<{ src: string; alt: string }>;
  excerpt: string;
  bodyHtml: string;
  referencesHtml: string;
};

const entryFiles = import.meta.glob('../../entries/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>;

const assetFiles = import.meta.glob('../../assets/**/*.{jpg,jpeg,png,webp,avif}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

marked.setOptions({ gfm: true });

function imageUrl(relativePath: string) {
  return assetFiles[`../../assets/${relativePath}`] || '';
}

function renderMarkdown(markdown: string) {
  const withBuiltAssets = markdown.replace(
    /!\[([^\]]*)\]\(\.\.\/assets\/([^)]+)\)/g,
    (_match, alt, path) => `![${alt}](${imageUrl(path)})`,
  );
  return marked.parse(withBuiltAssets) as string;
}

function chineseAlias(record: CharacterRecord) {
  return record.aliases.find((alias) => /[\u3400-\u9fff]/.test(alias)) || '';
}

function entrySlug(path: string) {
  return path.replace(/^entries\/\d{4}-\d{2}-\d{2}-/, '').replace(/\.md$/, '');
}

function parseEntry(record: CharacterRecord): CatEntry {
  const rawKey = `../../${record.entry_path}`;
  const raw = entryFiles[rawKey];
  if (!raw) throw new Error(`Missing archive entry: ${record.entry_path}`);

  const slug = entrySlug(record.entry_path);
  const lines = raw.split('\n');
  const title = lines.shift()?.replace(/^#\s+/, '') || record.canonical_name;
  while (lines[0]?.trim() === '') lines.shift();

  const images: Array<{ src: string; alt: string }> = [];
  while (lines[0]?.match(/^!\[([^\]]*)\]\(\.\.\/assets\/([^)]+)\)$/)) {
    const match = lines.shift()!.match(/^!\[([^\]]*)\]\(\.\.\/assets\/([^)]+)\)$/)!;
    images.push({ alt: match[1], src: imageUrl(match[2]) });
  }
  while (lines[0]?.trim() === '') lines.shift();

  const rest = lines.join('\n');
  const [bodyMarkdown, referencesMarkdown = ''] = rest.split(/\n### 视觉参考\n/);
  const excerpt = bodyMarkdown
    .split(/\n\s*\n/)
    .map((part) => part.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/[*_>#`]/g, '').trim())
    .find(Boolean) || '';

  const fallbackCoverKey = Object.keys(assetFiles).find((key) => key.startsWith(`../../assets/${slug}/`));
  const cover = images[0]?.src || (fallbackCoverKey ? assetFiles[fallbackCoverKey] : '');

  return {
    ...record,
    slug,
    title,
    chineseName: chineseAlias(record),
    cover,
    images,
    excerpt,
    bodyHtml: renderMarkdown(bodyMarkdown),
    referencesHtml: referencesMarkdown ? renderMarkdown(referencesMarkdown) : '',
  };
}

export function getEntries() {
  return (characterData.characters as CharacterRecord[])
    .map(parseEntry)
    .sort((a, b) => b.introduced_date.localeCompare(a.introduced_date));
}

export function withBase(path = '') {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const normalized = path ? `/${path.replace(/^\/+|\/+$/g, '')}` : '';
  return `${base}${normalized}/`.replace(/\/+/g, '/');
}

export function formatDate(date: string) {
  return date.replaceAll('-', '.');
}
