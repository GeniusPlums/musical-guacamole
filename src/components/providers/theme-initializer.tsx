"use client";

import { useEffect } from "react";
import { useThemeStore } from "@/store/use-theme-store";

export function ThemeInitializer() {
  const hydrate = useThemeStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return null;
}
