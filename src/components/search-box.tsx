"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Search, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import AnimatedList from "@/components/AnimatedList";

type SearchDoc = {
  href: string;
  title: string;
  description: string;
  text: string;
};

export function SearchBox({ docs, placeholder }: { docs: SearchDoc[]; placeholder: string }) {
  const router = useRouter();
  const pathname = usePathname() || "/";
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const normalized = query.trim().toLowerCase();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const isPalette = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
      if (isPalette) {
        event.preventDefault();
        setOpen(true);
        return;
      }
      if (open && event.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const results = useMemo(() => {
    if (!normalized) return [];
    return docs
      .map((doc) => {
        const haystack = `${doc.title} ${doc.description} ${doc.text}`.toLowerCase();
        const score = haystack.includes(normalized) ? haystack.indexOf(normalized) : -1;
        return { doc, score };
      })
      .filter((item) => item.score >= 0)
      .sort((a, b) => a.score - b.score)
      .slice(0, 8)
      .map((item) => item.doc);
  }, [docs, normalized]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-bold transition hover:bg-black/5 dark:hover:bg-white/10"
      >
        <Search size={16} />
        <span className="hidden sm:inline">{placeholder}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1200] bg-black/45 backdrop-blur-md"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.22 }}
              className="mx-auto mt-[10vh] w-[92vw] max-w-3xl rounded-3xl border surface p-5 shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center gap-2">
                <Search size={18} />
                <input
                  autoFocus
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={placeholder}
                  className="h-12 w-full rounded-xl border bg-transparent px-4 text-base font-semibold outline-none"
                />
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-xl border p-3 transition hover:bg-black/5 dark:hover:bg-white/10"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="mt-4">
                {results.length ? (
                  <AnimatedList
                    className="!w-full max-w-none"
                    itemClassName="!rounded-xl !bg-transparent border font-bold"
                    displayScrollbar={true}
                    items={results.map((result) => `${result.title} - ${result.description}`)}
                    onItemSelect={(_, index) => {
                      const item = results[index];
                      if (!item) return;
                      setOpen(false);
                      const localePrefix = /^\/(ru|en)(?=\/|$)/.exec(pathname)?.[0] ?? "/ru";
                      router.push(`${localePrefix}${item.href}`);
                    }}
                  />
                ) : (
                  <div className="rounded-xl border p-4 text-sm font-semibold opacity-70">
                    {normalized ? "No results" : "Start typing to search docs"}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
