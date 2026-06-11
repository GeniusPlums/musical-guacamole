"use client";

import { IndianRupee, Package, AlertTriangle, TrendingDown, Trash2 } from "lucide-react";
import { KPICard } from "@/components/dashboard/kpi-card";
import { useSimulationStore } from "@/store/use-simulation-store";
import { useAppStore } from "@/store/use-app-store";

export function KPIStrip() {
  const outletId = useAppStore((s) => s.selectedOutletId) ?? undefined;
  const kpis = useSimulationStore((s) => s.getDashboardKPIs(outletId));
  const openCases = useSimulationStore((s) => s.getOpenInvestigations(outletId).length);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <KPICard title="Inventory Value" value={kpis.inventoryValue} icon={Package} />
      <KPICard title="Today's Sales" value={kpis.todaysSales} icon={IndianRupee} />
      <KPICard
        title="Inventory Variance"
        value={kpis.inventoryVariance}
        format="number"
        icon={TrendingDown}
        variant="warning"
      />
      <KPICard
        title="Estimated Losses"
        value={kpis.estimatedLosses}
        icon={AlertTriangle}
        variant="danger"
      />
      <KPICard
        title="Open Cases"
        value={openCases}
        format="number"
        icon={Trash2}
        variant={openCases > 0 ? "danger" : "default"}
      />
    </div>
  );
}
