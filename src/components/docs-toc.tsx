"use client";

import clsx from "clsx";
import { useMemo } from "react";
import { usePathname } from "next/navigation";
import type { DocHeading } from "@/lib/content";

export function DocsToc({ headings, title }: { headings: DocHeading[]; title: string }) {
  const pathname = usePathname();
  const base = useMemo(() => pathname?.split("#")[0] ?? "", [pathname]);

  if (!headings.length) return null;

  return (
    <aside className="sticky top-28 hidden w-64 self-start rounded-2xl border surface p-4 xl:block max-h-[calc(100dvh-8rem)]">
      <h2 className="mb-3 text-sm font-bold uppercase tracking-wide">{title}</h2>
      <ul className="space-y-1 overflow-y-auto pr-1 text-sm max-h-[calc(100dvh-11rem)]">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`${base}#${heading.id}`}
              className={clsx(
                "block rounded-lg px-2 py-1 hover:bg-black/5 dark:hover:bg-white/10",
                heading.level === 3 && "ml-3 text-xs opacity-80",
              )}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}
