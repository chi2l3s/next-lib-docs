"use client";

import { useRouter } from "next/navigation";

export function VersionSwitcher({ locale }: { locale: "ru" | "en" }) {
  const router = useRouter();

  return (
    <select
      defaultValue="latest"
      onChange={(event) => {
        if (event.target.value === "latest") {
          router.push(`/${locale}/docs`);
          return;
        }
        router.push(`/${locale}/docs/release-notes`);
      }}
      className="rounded-xl border px-3 py-2 text-sm font-semibold"
      aria-label="Version"
    >
      <option value="latest">latest</option>
      <option value="1.0.7">v1.0.7</option>
    </select>
  );
}
