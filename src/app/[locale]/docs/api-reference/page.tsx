import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing, type AppLocale } from "@/i18n/routing";
import { ApiReferenceView } from "@/components/api-reference-view";
import { getApiReferenceData } from "@/lib/apiref";

const copy: Record<AppLocale, { title: string; description: string; search: string; empty: string }> = {
  ru: {
    title: "API Reference",
    description: "Автогенерация по Java исходникам NextLib (public API + JavaDoc).",
    search: "Поиск по классам и методам...",
    empty: "Ничего не найдено.",
  },
  en: {
    title: "API Reference",
    description: "Auto-generated from NextLib Java sources (public API + JavaDoc).",
    search: "Search classes and methods...",
    empty: "No matches found.",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = copy[locale as AppLocale];
  return { title: t.title, description: t.description };
}

export default async function ApiReferencePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const typed = locale as AppLocale;
  const t = copy[typed];
  const data = getApiReferenceData();

  return (
    <section className="mx-auto max-w-6xl py-4">
      <h1 className="text-3xl font-bold">{t.title}</h1>
      <p className="mt-2 text-sm opacity-80">{t.description}</p>
      <div className="mt-6">
        <ApiReferenceView data={data} labels={{ search: t.search, empty: t.empty }} />
      </div>
    </section>
  );
}

