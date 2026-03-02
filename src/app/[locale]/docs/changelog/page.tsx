import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing, type AppLocale } from "@/i18n/routing";
import { getGithubReleases } from "@/lib/github";
import { ChangelogView } from "@/components/changelog-view";

const copy: Record<AppLocale, { title: string; description: string; search: string }> = {
  ru: {
    title: "Changelog",
    description: "Лента релизов из GitHub API с фильтрами по модулям и типам изменений.",
    search: "Поиск по релизам...",
  },
  en: {
    title: "Changelog",
    description: "Release stream from GitHub API with module/type filters.",
    search: "Search releases...",
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

export default async function ChangelogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const typed = locale as AppLocale;
  const t = copy[typed];
  const releases = await getGithubReleases();

  return (
    <section className="mx-auto max-w-6xl py-4">
      <h1 className="text-3xl font-bold">{t.title}</h1>
      <p className="mt-2 text-sm opacity-80">{t.description}</p>
      <div className="mt-6">
        <ChangelogView releases={releases} labels={{ search: t.search }} />
      </div>
    </section>
  );
}

