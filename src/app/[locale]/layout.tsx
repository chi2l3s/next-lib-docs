import type { ReactNode } from "react";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import { LayoutNav } from "@/components/layout-nav";
import { Sidebar } from "@/components/sidebar";
import { DocsAssistant } from "@/components/docs-assistant";
import { ThemePixelSnow } from "@/components/theme-pixel-snow";
import { ThemeProvider } from "@/components/theme-provider";
import { buildMenu } from "@/config/docs-menu";
import { routing, type AppLocale } from "@/i18n/routing";
import { getAllDocs, getSearchIndex } from "@/lib/content";
import { uiCopy } from "@/lib/ui-copy";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const typedLocale = locale as AppLocale;
  const messages = uiCopy[typedLocale];
  const docs = getAllDocs(typedLocale);
  const menu = buildMenu(typedLocale, docs, messages.more);
  const searchIndex = getSearchIndex(typedLocale);

  return (
    <NextIntlClientProvider messages={{}}>
      <ThemeProvider>
        <ThemePixelSnow />
        <a
          href="#content-start"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[1500] focus:rounded-xl focus:border focus:bg-background focus:px-3 focus:py-2 focus:font-bold"
        >
          Skip to content
        </a>
        <div className="docs-shell">
          <LayoutNav
            locale={typedLocale}
            menu={menu}
            searchDocs={searchIndex}
            labels={{
              repo: messages.repo,
              searchPlaceholder: messages.searchPlaceholder,
            }}
          />
          <div className="mx-auto mt-6 flex max-w-[1400px] items-start">
            <Sidebar menu={menu} />
            <main id="content-start" className="min-w-0 flex-1 p-4 lg:p-8">
              {children}
            </main>
          </div>
        </div>
        <DocsAssistant locale={typedLocale} />
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}
