import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { AppLocale } from "@/i18n/routing";

export type DocFrontmatter = {
  title: string;
  description: string;
  section?: string;
  order?: number;
};

export type DocMeta = {
  slug: string[];
  href: string;
  slugKey: string;
  locale: AppLocale;
  filePath: string;
  relativePath: string;
  title: string;
  description: string;
  section?: string;
  order?: number;
};

export type DocRecord = DocMeta & {
  body: string;
  updatedAt: string;
};

const CONTENT_ROOT = path.join(process.cwd(), "src", "content");

function getLocaleDir(locale: AppLocale) {
  return path.join(CONTENT_ROOT, locale);
}

function walk(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(fullPath));
      continue;
    }
    if (entry.name.endsWith(".md") || entry.name.endsWith(".mdx")) {
      files.push(fullPath);
    }
  }

  return files;
}

function stripExt(file: string) {
  return file.replace(/\.(md|mdx)$/i, "");
}

function toSlug(relativePath: string): string[] {
  const clean = stripExt(relativePath).replaceAll("\\", "/");
  const parts = clean.split("/").filter(Boolean);
  if (parts.length === 1 && parts[0].toLowerCase() === "readme") {
    return [];
  }
  return parts;
}

function createMeta(locale: AppLocale, fullPath: string): DocMeta {
  const localeDir = getLocaleDir(locale);
  const relativePath = path.relative(localeDir, fullPath).replaceAll("\\", "/");
  const raw = fs.readFileSync(fullPath, "utf8");
  const parsed = matter(raw);
  const slug = toSlug(relativePath);
  const slugKey = slug.join("/") || "__root__";
  const href = `/docs${slug.length ? `/${slug.join("/")}` : ""}`;

  return {
    slug,
    href,
    slugKey,
    locale,
    filePath: fullPath,
    relativePath,
    title: parsed.data.title ?? "Untitled",
    description: parsed.data.description ?? "",
    section: parsed.data.section,
    order: parsed.data.order,
  };
}

export function getAllDocs(locale: AppLocale): DocMeta[] {
  const localeDir = getLocaleDir(locale);
  if (!fs.existsSync(localeDir)) {
    return [];
  }
  return walk(localeDir)
    .map((filePath) => createMeta(locale, filePath))
    .sort((a, b) => {
      const aOrder = a.order ?? Number.MAX_SAFE_INTEGER;
      const bOrder = b.order ?? Number.MAX_SAFE_INTEGER;
      if (aOrder !== bOrder) return aOrder - bOrder;
      return a.href.localeCompare(b.href);
    });
}

export function getDoc(locale: AppLocale, slug: string[]): DocRecord | null {
  const docs = getAllDocs(locale);
  const slugKey = slug.join("/") || "__root__";
  const target = docs.find((doc) => doc.slugKey === slugKey);
  if (!target) return null;

  const raw = fs.readFileSync(target.filePath, "utf8");
  const parsed = matter(raw);
  const stat = fs.statSync(target.filePath);

  return {
    ...target,
    body: parsed.content,
    updatedAt: stat.mtime.toISOString(),
    title: parsed.data.title ?? target.title,
    description: parsed.data.description ?? target.description,
    section: parsed.data.section ?? target.section,
    order: parsed.data.order ?? target.order,
  };
}

export type DocHeading = {
  level: 2 | 3;
  text: string;
  id: string;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function extractHeadings(markdown: string): DocHeading[] {
  const headings: DocHeading[] = [];
  const lines = markdown.split("\n");
  for (const line of lines) {
    const match = /^(##|###)\s+(.+?)\s*$/.exec(line);
    if (!match) continue;
    const level = match[1] === "##" ? 2 : 3;
    const text = match[2].replace(/[`*_~]/g, "").trim();
    if (!text) continue;
    headings.push({
      level,
      text,
      id: slugify(text),
    });
  }
  return headings;
}

export function getSearchIndex(locale: AppLocale) {
  return getAllDocs(locale).map((doc) => {
    const raw = fs.readFileSync(doc.filePath, "utf8");
    const parsed = matter(raw);
    const plain = parsed.content.replace(/[`*_#>\-\[\]\(\)!]/g, " ");
    return {
      href: doc.href,
      title: doc.title,
      description: doc.description,
      text: plain.slice(0, 1200),
    };
  });
}
