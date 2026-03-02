"use client";

import { useState } from "react";
import clsx from "clsx";
import { ChevronDown, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import type { MenuSection } from "@/config/docs-menu";
import { Link, usePathname } from "@/i18n/navigation";

export function Sidebar({ menu }: { menu: MenuSection[] }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [opened, setOpened] = useState<Record<string, boolean>>(
    Object.fromEntries(menu.map((section) => [section.id, true])),
  );

  return (
    <aside
      className={clsx(
        "sticky top-24 hidden self-start border-r-2 p-3 transition-all duration-300 lg:block",
        collapsed ? "h-[calc(100dvh-7rem)] w-16" : "h-[calc(100dvh-7rem)] w-72",
      )}
    >
      <button
        type="button"
        onClick={() => setCollapsed((prev) => !prev)}
        className="mb-3 inline-flex w-full items-center justify-center rounded-xl border p-2 transition hover:bg-black/5 dark:hover:bg-white/10"
      >
        {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
      </button>
      <div className="min-h-0 h-[calc(100%-3.25rem)] overflow-y-auto pr-1">
        {collapsed && <div className="mt-2 text-center text-[10px] font-bold opacity-60">DOCS</div>}
        {menu.map((section) => (
          <div
            key={section.id}
            className={clsx(
              "mb-3 rounded-2xl border surface p-2 transition-all duration-300",
              collapsed ? "hidden" : "block",
            )}
          >
            <button
              type="button"
              onClick={() => setOpened((prev) => ({ ...prev, [section.id]: !prev[section.id] }))}
              className="mb-1 flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-base font-extrabold transition hover:bg-black/5 dark:hover:bg-white/10"
            >
              <span className="truncate">{section.title}</span>
              <ChevronDown size={16} className={clsx("transition-transform duration-300", opened[section.id] ? "rotate-180" : "")} />
            </button>
            <div
              className={clsx(
                "grid transition-all duration-300",
                opened[section.id] ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
              )}
            >
              <ul className="space-y-1 overflow-hidden">
                {section.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={clsx(
                        "block rounded-xl px-3 py-2 text-base font-bold transition-all duration-200",
                        pathname === item.href
                          ? "bg-black text-white dark:bg-white dark:text-black"
                          : "hover:bg-black/5 dark:hover:bg-white/10",
                      )}
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
