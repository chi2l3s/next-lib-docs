"use client";

import clsx from "clsx";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import type { DocHeading } from "@/lib/content";

export function DocsToc({ headings, title }: { headings: DocHeading[]; title: string }) {
  const pathname = usePathname();
  const base = useMemo(() => pathname?.split("#")[0] ?? "", [pathname]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (!visible.length) return;
        const id = visible[0]?.target?.id;
        if (id) setActiveId(id);
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: [0.1, 1] },
    );

    for (const heading of headings) {
      const element = document.getElementById(heading.id);
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
  }, [headings]);

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
                activeId === heading.id && "bg-black text-white dark:bg-white dark:text-black",
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
