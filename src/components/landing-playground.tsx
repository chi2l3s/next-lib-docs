"use client";

import { useState } from "react";

const yamlTemplate = `title: "&8Main Menu"
size: 27
items:
  close:
    material: BARRIER
    slot: 13
    name: "&cClose"
    on_left_click:
      - "close"`;

const queryTemplate = `players.findMany()
  .where("coins", QueryOperator.GREATER_THAN, 1000)
  .whereLike("nickname", "Pro%")
  .execute();`;

export function LandingPlayground({ title }: { title: string }) {
  const [mode, setMode] = useState<"yaml" | "query">("yaml");
  const [value, setValue] = useState(yamlTemplate);

  return (
    <div className="rounded-3xl border surface p-6">
      <h2 className="text-2xl font-bold">{title}</h2>
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => {
            setMode("yaml");
            setValue(yamlTemplate);
          }}
          className={`rounded-xl border px-3 py-2 text-sm ${mode === "yaml" ? "bg-black text-white dark:bg-white dark:text-black" : ""}`}
        >
          YAML GUI
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("query");
            setValue(queryTemplate);
          }}
          className={`rounded-xl border px-3 py-2 text-sm ${mode === "query" ? "bg-black text-white dark:bg-white dark:text-black" : ""}`}
        >
          DB Query
        </button>
      </div>
      <textarea
        value={value}
        onChange={(event) => setValue(event.target.value)}
        className="mt-4 h-52 w-full rounded-xl border p-3 font-mono text-xs outline-none"
      />
    </div>
  );
}

