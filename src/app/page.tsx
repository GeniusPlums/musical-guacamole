"use client";

import {
  IndianRupee,
  TrendingDown,
  Package,
  AlertTriangle,
  Trash2,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { KPICard } from "@/components/dashboard/kpi-card";
import { AlertsPanel } from "@/components/dashboard/alerts-panel";
import { AreaChart } from "@/components/charts/area-chart";
import { BarChart } from "@/components/charts/bar-chart";
import { useAppStore } from "@/store/use-app-store";
import {
  getDashboardKPIs,
  getAlerts,
  getLossTrend,
  getWastageTrend,
  getTopMissingProducts,
} from "@/lib/data/service";

export default function DashboardPage() {
  const { selectedOutletId } = useAppStore();
  const outletId = selectedOutletId ?? undefined;
  const kpis = getDashboardKPIs(outletId);
  const alerts = getAlerts(outletId);
  const lossTrend = getLossTrend(outletId);
  const wastageTrend = getWastageTrend(outletId);
  const topMissing = getTopMissingProducts(outletId);

  return (
    <AppShell
      title="Owner Dashboard"
      description="Inventory visibility, loss tracking, and accountability overview"
    >
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <KPICard title="Inventory Value" value={kpis.inventoryValue} icon={Package} change={2.4} />
          <KPICard title="Today's Sales" value={kpis.todaysSales} icon={IndianRupee} change={8.1} />
          <KPICard
            title="Inventory Variance"
            value={kpis.inventoryVariance}
            format="number"
            icon={TrendingDown}
            variant="warning"
            change={-12.3}
          />
          <KPICard
            title="Estimated Losses"
            value={kpis.estimatedLosses}
            icon={AlertTriangle}
            variant="danger"
            change={-18.7}
          />
          <KPICard
            title="Wastage Cost"
            value={kpis.wastageCost}
            icon={Trash2}
            variant="warning"
            change={5.2}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <AreaChart
                title="Inventory Loss Trend"
                data={lossTrend}
                color="hsl(var(--destructive))"
              />
              <AreaChart
                title="Wastage Trend"
                data={wastageTrend}
                color="hsl(var(--chart-4))"
              />
            </div>
            <BarChart
              title="Top Missing Products"
              data={topMissing.map((p) => ({
                name: p.name.length > 15 ? p.name.slice(0, 15) + "…" : p.name,
                value: p.lossValue,
                variance: p.variance,
              }))}
            />
          </div>
          <AlertsPanel alerts={alerts} />
        </div>
      </div>
    </AppShell>
  );
}
