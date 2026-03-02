"use client";

import { Github, Library } from "lucide-react";
import type { AppLocale } from "@/i18n/routing";
import type { MenuSection } from "@/config/docs-menu";
import PillNav from "@/components/PillNav";
import StaggeredMenu from "@/components/StaggeredMenu";
import { LanguageSwitcher } from "./language-switcher";
import { ThemeToggle } from "./theme-toggle";
import { SearchBox } from "./search-box";
import { VersionSwitcher } from "./version-switcher";

type SearchDoc = {
  href: string;
  title: string;
  description: string;
  text: string;
};

export function LayoutNav({
  locale,
  menu,
  searchDocs,
  labels,
}: {
  locale: AppLocale;
  menu: MenuSection[];
  searchDocs: SearchDoc[];
  labels: {
    repo: string;
    searchPlaceholder: string;
  };
}) {
  const docsLinks = menu.flatMap((section) => section.items).slice(0, 7);
  const pillItems = [
    { label: "Home", href: `/${locale}` },
    { label: "Install", href: `/${locale}/docs/installation` },
    { label: "Database", href: `/${locale}/docs/modules/dynamic-database` },
    { label: "GUI", href: `/${locale}/docs/modules/gui-api` },
    { label: "Roadmap", href: `/${locale}/docs/roadmap` },
  ];

  return (
    <header className="sticky inset-x-0 top-0 z-40 glass">
      <div className="relative mx-auto max-w-[1400px] px-3 pb-3 pt-3 lg:px-6">
        <div className="hidden lg:block">
          <PillNav
            logoNode={<Library size={16} />}
            items={pillItems}
            activeHref={`/${locale}`}
            baseColor="#000"
            pillColor="#fff"
            hoveredPillTextColor="#fff"
            pillTextColor="#000"
          />
        </div>
        <div className="flex items-center gap-2 lg:absolute lg:right-6 lg:top-4">
          <VersionSwitcher locale={locale} />
          <SearchBox docs={searchDocs} placeholder={labels.searchPlaceholder} />
          <a
            href="https://github.com/chi2l3s/next-lib"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-bold transition hover:bg-black/5 dark:hover:bg-white/10"
          >
            <Github size={16} />
            {labels.repo}
          </a>
          <LanguageSwitcher locale={locale} />
          <ThemeToggle />
        </div>
      </div>

      <StaggeredMenu
        isFixed={true}
        logoText=" "
        position="right"
        menuButtonColor="var(--foreground)"
        openMenuButtonColor="var(--foreground)"
        colors={["#ffffff", "#f5f5f5"]}
        accentColor="#000000"
        items={docsLinks.map((item) => ({
          label: item.title,
          ariaLabel: item.title,
          link: `/${locale}${item.href}`,
        }))}
        socialItems={[
          { label: "GitHub", link: "https://github.com/chi2l3s/next-lib" },
          { label: "JitPack", link: "https://jitpack.io/#chi2l3s/next-lib" },
          { label: "Docs", link: `/${locale}/docs` },
        ]}
      />
    </header>
  );
}
