import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { flattenMenu, buildMenu } from "@/config/docs-menu";
import { routing, type AppLocale } from "@/i18n/routing";
import { extractHeadings, getAllDocs, getDoc } from "@/lib/content";
import { renderMdx } from "@/lib/mdx";
import { DocsToc } from "@/components/docs-toc";
import { PagerNav } from "@/components/pager-nav";
import { uiCopy } from "@/lib/ui-copy";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    getAllDocs(locale).map((doc) => ({
      locale,
      slug: doc.slug,
    })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug?: string[] }>;
}): Promise<Metadata> {
  const { locale, slug = [] } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const doc = getDoc(locale as AppLocale, slug);
  if (!doc) return {};
  return {
    title: doc.title,
    description: doc.description,
  };
}

export default async function DocPage({
  params,
}: {
  params: Promise<{ locale: string; slug?: string[] }>;
}) {
  const { locale, slug = [] } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const typedLocale = locale as AppLocale;
  const doc = getDoc(typedLocale, slug);
  if (!doc) notFound();

  const messages = uiCopy[typedLocale];
  const docs = getAllDocs(typedLocale);
  const menu = buildMenu(typedLocale, docs, messages.more);
  const flat = flattenMenu(menu);
  const index = flat.findIndex((item) => item.href === doc.href);

  const content = await renderMdx(doc.body);
  const headings = extractHeadings(doc.body);
  const updated = new Intl.DateTimeFormat(typedLocale === "ru" ? "ru-RU" : "en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(doc.updatedAt));
  const editBase = process.env.NEXT_PUBLIC_DOCS_EDIT_BASE_URL;
  const editUrl = editBase ? `${editBase.replace(/\/$/, "")}/${doc.relativePath}` : null;

  return (
    <div className="mx-auto flex max-w-6xl gap-8 py-4">
      <article className="min-w-0 max-w-4xl flex-1">
        <h1 className="mb-2 text-3xl font-bold tracking-tight">{doc.title}</h1>
        {doc.description ? <p className="mb-4 text-sm opacity-80">{doc.description}</p> : null}
        <div className="mb-6 flex flex-wrap items-center gap-3 text-xs opacity-75">
          <span>
            {messages.updated}: {updated}
          </span>
          {editUrl ? (
            <a href={editUrl} target="_blank" rel="noreferrer" className="rounded-lg border px-2 py-1">
              {messages.edit}
            </a>
          ) : null}
        </div>
        <div className="prose prose-slate max-w-none dark:prose-invert">{content}</div>
        <PagerNav
          prev={index > 0 ? flat[index - 1] : undefined}
          next={index >= 0 && index < flat.length - 1 ? flat[index + 1] : undefined}
          labels={{ previous: messages.previous, next: messages.next }}
        />
      </article>
      <DocsToc headings={headings} title={messages.onThisPage} />
    </div>
  );
}
