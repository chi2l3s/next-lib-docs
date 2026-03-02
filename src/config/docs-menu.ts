import type { AppLocale } from "@/i18n/routing";
import type { DocMeta } from "@/lib/content";

export type MenuItem = {
  title: string;
  href: string;
};

export type MenuSection = {
  id: string;
  title: string;
  items: MenuItem[];
};

type ConfigSection = {
  id: string;
  title: Record<AppLocale, string>;
  slugs: string[];
};

const ROOT = "__root__";

const configuredSections: ConfigSection[] = [
  {
    id: "getting-started",
    title: { ru: "Начало работы", en: "Getting Started" },
    slugs: [ROOT, "installation", "quick-start"],
  },
  {
    id: "modules",
    title: { ru: "Модули", en: "Modules" },
    slugs: [
      "modules/dynamic-database",
      "modules/gui-api",
      "modules/command-api",
      "modules/item-api",
      "modules/color-api",
      "modules/config-manager",
    ],
  },
  {
    id: "operations",
    title: { ru: "Эксплуатация", en: "Operations" },
    slugs: ["api-reference", "changelog", "troubleshooting", "release-notes", "roadmap"],
  },
];

export function buildMenu(locale: AppLocale, docs: DocMeta[], moreTitle: string): MenuSection[] {
  const bySlug = new Map(docs.map((doc) => [doc.slugKey, doc]));
  const used = new Set<string>();
  const sections: MenuSection[] = [];

  for (const section of configuredSections) {
    const items: MenuItem[] = [];
    for (const slug of section.slugs) {
      const doc = bySlug.get(slug);
      if (!doc) continue;
      used.add(doc.slugKey);
      items.push({ title: doc.title, href: doc.href });
    }
    if (items.length > 0) {
      sections.push({
        id: section.id,
        title: section.title[locale],
        items,
      });
    }
  }

  const remaining = docs
    .filter((doc) => !used.has(doc.slugKey))
    .map((doc) => ({ title: doc.title, href: doc.href }));

  if (remaining.length) {
    sections.push({
      id: "more",
      title: moreTitle,
      items: remaining,
    });
  }

  return sections;
}

export function flattenMenu(menu: MenuSection[]): MenuItem[] {
  return menu.flatMap((section) => section.items);
}
