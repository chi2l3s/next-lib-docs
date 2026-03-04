"use client";

import { Languages } from "lucide-react";
import { useTransition } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";

type Props = {
  locale: AppLocale;
};

export function LanguageSwitcher({ locale }: Props) {
  const pathname = usePathname() || "/";
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const nextLocale = locale === "ru" ? "en" : "ru";

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (pending) return;
        startTransition(() => {
          router.replace(pathname, { locale: nextLocale });
        });
      }}
      className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-bold transition hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-60"
      aria-label="Switch language"
    >
      <Languages size={16} />
      {locale.toUpperCase()}
    </button>
  );
}
