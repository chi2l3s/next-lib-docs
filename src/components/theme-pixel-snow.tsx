"use client";

import { useTheme } from "next-themes";
import PixelSnow from "@/components/PixelSnow";

export function ThemePixelSnow() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <div className={`pointer-events-none fixed inset-0 -z-10 ${isDark ? "opacity-40" : "opacity-20"}`}>
      <PixelSnow
        density={isDark ? 0.42 : 0.18}
        speed={isDark ? 0.9 : 0.65}
        brightness={isDark ? 1.05 : 0.45}
        variant="round"
        color={isDark ? "#ffffff" : "#374151"}
      />
    </div>
  );
}

