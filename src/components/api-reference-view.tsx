"use client";

import { useMemo, useState } from "react";
import type { ApiClass } from "@/lib/apiref";

export function ApiReferenceView({
  data,
  labels,
}: {
  data: ApiClass[];
  labels: {
    search: string;
    empty: string;
  };
}) {
  const [query, setQuery] = useState("");
  const [pkg, setPkg] = useState("all");

  const packages = useMemo(
    () => ["all", ...Array.from(new Set(data.map((item) => item.packageName))).sort()],
    [data],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return data.filter((item) => {
      if (pkg !== "all" && item.packageName !== pkg) return false;
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q) ||
        item.methods.some((method) => method.signature.toLowerCase().includes(q))
      );
    });
  }, [data, pkg, query]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={labels.search}
          className="h-10 min-w-72 rounded-xl border px-3 text-sm"
        />
        <select
          value={pkg}
          onChange={(event) => setPkg(event.target.value)}
          className="h-10 rounded-xl border px-3 text-sm"
        >
          {packages.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border p-4 text-sm opacity-70">{labels.empty}</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <details key={`${item.packageName}.${item.name}`} className="rounded-xl border p-4" open={false}>
              <summary className="cursor-pointer font-semibold">
                {item.kind} {item.name}
                <span className="ml-2 text-xs opacity-60">{item.packageName}</span>
              </summary>
              <p className="mt-3 text-sm opacity-80">{item.summary || "No summary."}</p>
              <div className="mt-3 space-y-2">
                {item.methods.map((method) => (
                  <div key={method.signature} className="rounded-lg border p-3">
                    <code className="text-xs">{method.signature}</code>
                    {method.summary ? <p className="mt-1 text-xs opacity-75">{method.summary}</p> : null}
                    {method.params.length ? (
                      <div className="mt-2 overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b">
                              <th className="py-1 text-left">param</th>
                              <th className="py-1 text-left">type</th>
                              <th className="py-1 text-left">description</th>
                            </tr>
                          </thead>
                          <tbody>
                            {method.params.map((param) => (
                              <tr key={param.name} className="border-b last:border-b-0">
                                <td className="py-1 pr-2 font-semibold">{param.name}</td>
                                <td className="py-1 pr-2 opacity-80">{param.type}</td>
                                <td className="py-1 opacity-80">{param.description || "—"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
