"use client";

import { Languages } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import type { AppLocale } from "@/i18n/routing";

type Props = {
  locale: AppLocale;
};

export function LanguageSwitcher({ locale }: Props) {
  const pathname = usePathname() || "/";
  const searchParams = useSearchParams();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const nextLocale = locale === "ru" ? "en" : "ru";
  const targetHref = useMemo(() => {
    const normalized = pathname.replace(/^\/(ru|en)(?=\/|$)/, "") || "/";
    const query = searchParams.toString();
    return `/${nextLocale}${normalized}${query ? `?${query}` : ""}`;
  }, [nextLocale, pathname, searchParams]);

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (pending) return;
        setPending(true);
        router.replace(targetHref);
      }}
      className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-bold transition hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-60"
      aria-label="Switch language"
    >
      <Languages size={16} />
      {locale.toUpperCase()}
    </button>
  );
}
