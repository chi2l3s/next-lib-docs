"use client";

import { useState } from "react";
import clsx from "clsx";
import type { MenuSection } from "@/config/docs-menu";
import { Link, usePathname } from "@/i18n/navigation";

export function MobileSidebar({ menu, label }: { menu: MenuSection[]; label: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="rounded-md border px-2 py-1 text-xs"
      >
        {label}
      </button>
      {open && (
        <div className="absolute left-3 right-3 top-14 z-40 rounded-lg border surface p-3 shadow-lg">
          {menu.map((section) => (
            <div key={section.id} className="mb-3 last:mb-0">
              <div className="mb-1 text-xs font-semibold uppercase opacity-70">{section.title}</div>
              <ul className="space-y-1">
                {section.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={clsx(
                        "block rounded px-2 py-1 text-sm",
                        pathname === item.href
                          ? "bg-blue-600 text-white"
                          : "hover:bg-black/5 dark:hover:bg-white/10",
                      )}
                      onClick={() => setOpen(false)}
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
