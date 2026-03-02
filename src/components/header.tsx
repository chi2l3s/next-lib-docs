import type { AppLocale } from "@/i18n/routing";
import type { MenuSection } from "@/config/docs-menu";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "./language-switcher";
import { MobileSidebar } from "./mobile-sidebar";
import { SearchBox } from "./search-box";
import { ThemeToggle } from "./theme-toggle";

type SearchDoc = {
  href: string;
  title: string;
  description: string;
  text: string;
};

type HeaderProps = {
  locale: AppLocale;
  menu: MenuSection[];
  searchDocs: SearchDoc[];
  labels: {
    repo: string;
    searchPlaceholder: string;
    docs: string;
  };
};

export function Header({ locale, menu, searchDocs, labels }: HeaderProps) {
  return (
    <header className="fixed inset-x-0 top-0 z-30 border-b glass shadow-sm">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center gap-3 px-3 lg:px-6">
        <MobileSidebar menu={menu} label={labels.docs} />
        <Link href="/" className="rounded-md px-2 py-1 text-sm font-semibold tracking-[0.12em]">
          NextLib
        </Link>
        <SearchBox docs={searchDocs} placeholder={labels.searchPlaceholder} />
        <div className="ml-auto flex items-center gap-2">
          <a
            href="https://github.com/chi2l3s/next-lib"
            target="_blank"
            rel="noreferrer"
            className="rounded-md border px-2 py-1 text-xs"
          >
            {labels.repo}
          </a>
          <LanguageSwitcher locale={locale} />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
