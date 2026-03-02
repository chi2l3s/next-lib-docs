"use client";

import { useMemo, useState } from "react";
import type { GithubReleaseItem } from "@/lib/github";

export function ChangelogView({
  releases,
  labels,
}: {
  releases: GithubReleaseItem[];
  labels: {
    search: string;
  };
}) {
  const [query, setQuery] = useState("");
  const [module, setModule] = useState<string>("all");
  const [type, setType] = useState<string>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return releases.filter((item) => {
      if (module !== "all" && item.module !== module) return false;
      if (type !== "all" && item.type !== type) return false;
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.tag.toLowerCase().includes(q) ||
        item.body.toLowerCase().includes(q)
      );
    });
  }, [module, query, releases, type]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={labels.search}
          className="h-10 min-w-72 rounded-xl border px-3 text-sm"
        />
        <select value={module} onChange={(event) => setModule(event.target.value)} className="h-10 rounded-xl border px-3 text-sm">
          <option value="all">all modules</option>
          <option value="database">database</option>
          <option value="gui">gui</option>
          <option value="command">command</option>
          <option value="item">item</option>
          <option value="color">color</option>
          <option value="config">config</option>
          <option value="core">core</option>
        </select>
        <select value={type} onChange={(event) => setType(event.target.value)} className="h-10 rounded-xl border px-3 text-sm">
          <option value="all">all types</option>
          <option value="feature">feature</option>
          <option value="fix">fix</option>
          <option value="docs">docs</option>
          <option value="breaking">breaking</option>
          <option value="chore">chore</option>
        </select>
      </div>

      <div className="space-y-3">
        {filtered.map((item) => (
          <article key={item.tag} className="rounded-xl border p-4">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-bold">{item.name}</h3>
              <span className="rounded-md border px-2 py-0.5 text-xs">{item.tag}</span>
              <span className="rounded-md border px-2 py-0.5 text-xs">{item.module}</span>
              <span className="rounded-md border px-2 py-0.5 text-xs">{item.type}</span>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm opacity-80">
              {item.body || "No release notes body."}
            </p>
            <a
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex rounded-lg border px-3 py-1 text-xs font-semibold"
            >
              GitHub release
            </a>
          </article>
        ))}
      </div>
    </div>
  );
}

