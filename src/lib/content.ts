import { marked } from 'marked';
import characterData from '../../data/characters.json';

export type CharacterRecord = {
  canonical_name: string;
  aliases: string[];
  work: string;
  work_zh: string;
  author: string;
  language: string;
  form: string;
  coat: string[];
  sex: string;
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

const assetFiles = import.meta.glob('../../assets/**/*.{jpg,jpeg,png,gif,webp,avif}', {
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

function assertTagFields(record: CharacterRecord) {
  const isText = (value: unknown) => typeof value === 'string' && value.trim() !== '';
  const problems = [
    !isText(record.language) && 'language',
    !isText(record.form) && 'form',
    !(Array.isArray(record.coat) && record.coat.every(isText)) && 'coat',
    !isText(record.sex) && 'sex',
  ].filter(Boolean);
  if (problems.length) {
    throw new Error(`Invalid index fields for ${record.canonical_name}: ${problems.join(', ')}`);
  }
}

function parseEntry(record: CharacterRecord): CatEntry {
  assertTagFields(record);
  const rawKey = `../../${record.entry_path}`;
  const raw = entryFiles[rawKey];
  if (!raw) throw new Error(`Missing archive entry: ${record.entry_path}`);

  const slug = entrySlug(record.entry_path);
  const lines = raw.split('\n');
  const title = lines.shift()?.replace(/^#\s+/, '') || record.canonical_name;
  while (lines[0]?.trim() === '') lines.shift();

  const images: Array<{ src: string; alt: string }> = [];
  while (true) {
    const match = lines[0]?.match(/^!\[([^\]]*)\]\(\.\.\/assets\/([^)]+)\)$/);
    if (!match) break;

    lines.shift();
    images.push({ alt: match[1], src: imageUrl(match[2]) });
    while (lines[0]?.trim() === '') lines.shift();
  }

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

export const tagGroups = [
  { key: 'language', label: '语言' },
  { key: 'form', label: '体裁' },
  { key: 'coat', label: '花色' },
  { key: 'sex', label: '性别' },
] as const;

export type TagKey = (typeof tagGroups)[number]['key'];

export function tagValues(entry: CharacterRecord, key: TagKey) {
  const value = entry[key];
  return Array.isArray(value) ? value : [value];
}

export function tagLabel(key: TagKey, value: string) {
  if (key !== 'sex') return value;
  return { 公: '公猫', 母: '母猫', 未提及: '未提及性别' }[value] || value;
}

export function tagFacets(entries: CharacterRecord[]) {
  return tagGroups.map(({ key, label }) => {
    const counts = new Map<string, number>();
    for (const entry of entries) {
      for (const value of tagValues(entry, key)) counts.set(value, (counts.get(value) || 0) + 1);
    }
    const values = [...counts].map(([value, count]) => ({ value, count, label: tagLabel(key, value) }));
    values.sort((a, b) => b.count - a.count);
    return { key, label, values };
  });
}
