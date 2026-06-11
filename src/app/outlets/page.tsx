"use client";

import Link from "next/link";
import { Building2, AlertTriangle, ArrowRight, MapPin } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSimulationStore } from "@/store/use-simulation-store";
import { formatCurrency, formatPercent } from "@/lib/utils";

export default function OutletsPage() {
  const data = useSimulationStore((s) => s.data);
  const getVariances = useSimulationStore((s) => s.getVariances);
  const getDashboardKPIs = useSimulationStore((s) => s.getDashboardKPIs);

  const metrics = data.outlets.map((outlet) => {
    const kpis = getDashboardKPIs(outlet.id);
    const variances = getVariances(outlet.id);
    const totalStock = data.inventory.filter((i) => i.outletId === outlet.id).reduce((s, i) => s + i.currentStock, 0);
    const lossPercent = totalStock > 0
      ? (variances.filter((v) => v.variance < 0).reduce((s, v) => s + Math.abs(v.variance), 0) / totalStock) * 100
      : 0;
    const kitchen = data.kitchenWastage.filter((k) => k.outletId === outlet.id);
    const wastagePercent = kitchen.length > 0 ? kitchen.reduce((s, k) => s + k.wastagePercent, 0) / kitchen.length : 0;
    const alerts = data.alerts.filter((a) => a.outletId === outlet.id);

    return { outlet, revenue: kpis.todaysSales * 30, inventoryValue: kpis.inventoryValue, lossPercent, wastagePercent, alerts, estimatedLosses: kpis.estimatedLosses };
  });

  return (
    <AppShell title="Multi-Outlet Overview" description="Live comparison across locations">
      <div className="grid gap-6 lg:grid-cols-2">
        {metrics.map((m) => (
          <Card key={m.outlet.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Building2 className="h-4 w-4 text-primary" />{m.outlet.name}
              </CardTitle>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" />{m.outlet.location}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-[10px] uppercase text-muted-foreground">Revenue</p>
                  <p className="text-lg font-semibold">{formatCurrency(m.revenue)}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-[10px] uppercase text-muted-foreground">Inventory</p>
                  <p className="text-lg font-semibold">{formatCurrency(m.inventoryValue)}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-[10px] uppercase text-muted-foreground">Loss %</p>
                  <p className={`text-lg font-semibold ${m.lossPercent > 2 ? "text-destructive" : ""}`}>{formatPercent(m.lossPercent)}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-[10px] uppercase text-muted-foreground">Wastage %</p>
                  <p className={`text-lg font-semibold ${m.wastagePercent > 15 ? "text-amber-500" : ""}`}>{formatPercent(m.wastagePercent)}</p>
                </div>
              </div>
              {m.alerts.slice(0, 2).map((a) => (
                <div key={a.id} className="flex gap-2 text-xs border border-border rounded-lg p-2">
                  <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" />
                  {a.message}
                </div>
              ))}
              <div className="flex justify-between items-center">
                <span className="text-sm">Losses: <strong className="text-destructive">{formatCurrency(m.estimatedLosses)}</strong></span>
                <Button asChild variant="outline" size="sm">
                  <Link href="/"><ArrowRight className="h-3 w-3" /></Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
