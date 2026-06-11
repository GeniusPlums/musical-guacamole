"use client";

import { AppShell } from "@/components/layout/app-shell";
import { useSimulationData } from "@/hooks/use-simulation";
import { OutletMetricsCard } from "@/components/simulation/outlet-metrics-card";

export default function OutletsPage() {
  const data = useSimulationData();

  return (
    <AppShell title="Multi-Outlet Overview" description="Live comparison across locations">
      <div className="grid gap-6 lg:grid-cols-2">
        {data.outlets.map((outlet) => (
          <OutletMetricsCard key={outlet.id} outlet={outlet} />
        ))}
      </div>
    </AppShell>
  );
}
