"use client";

import { useEffect } from "react";
import { useSimulationStore } from "@/store/use-simulation-store";

export function SimulationHydrator() {
  const hydrated = useSimulationStore((s) => s.hydrated);
  const setHydrated = useSimulationStore((s) => s.setHydrated);

  useEffect(() => {
    if (!hydrated) {
      const unsub = useSimulationStore.persist.onFinishHydration(() => {
        setHydrated(true);
      });
      if (useSimulationStore.persist.hasHydrated()) {
        setHydrated(true);
      }
      return unsub;
    }
  }, [hydrated, setHydrated]);

  return null;
}
