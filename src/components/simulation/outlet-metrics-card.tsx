"use client";

import Link from "next/link";
import { Building2, AlertTriangle, ArrowRight, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  useSimulationData,
  useSimulationKPIs,
  useSimulationVariances,
  useSimulationAlerts,
} from "@/hooks/use-simulation";
import { formatCurrency, formatPercent } from "@/lib/utils";
import type { Outlet } from "@/lib/types";

export function OutletMetricsCard({ outlet }: { outlet: Outlet }) {
  const data = useSimulationData();
  const kpis = useSimulationKPIs(outlet.id);
  const variances = useSimulationVariances(outlet.id);
  const alerts = useSimulationAlerts(outlet.id);

  const totalStock = data.inventory
    .filter((i) => i.outletId === outlet.id)
    .reduce((s, i) => s + i.currentStock, 0);
  const lossPercent =
    totalStock > 0
      ? (variances.filter((v) => v.variance < 0).reduce((s, v) => s + Math.abs(v.variance), 0) / totalStock) * 100
      : 0;
  const kitchen = data.kitchenWastage.filter((k) => k.outletId === outlet.id);
  const wastagePercent =
    kitchen.length > 0 ? kitchen.reduce((s, k) => s + k.wastagePercent, 0) / kitchen.length : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Building2 className="h-4 w-4 text-primary" />
          {outlet.name}
        </CardTitle>
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          {outlet.location}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-[10px] uppercase text-muted-foreground">Revenue</p>
            <p className="text-lg font-semibold">{formatCurrency(kpis.todaysSales * 30)}</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-[10px] uppercase text-muted-foreground">Inventory</p>
            <p className="text-lg font-semibold">{formatCurrency(kpis.inventoryValue)}</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-[10px] uppercase text-muted-foreground">Loss %</p>
            <p className={`text-lg font-semibold ${lossPercent > 2 ? "text-destructive" : ""}`}>
              {formatPercent(lossPercent)}
            </p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-[10px] uppercase text-muted-foreground">Wastage %</p>
            <p className={`text-lg font-semibold ${wastagePercent > 15 ? "text-amber-500" : ""}`}>
              {formatPercent(wastagePercent)}
            </p>
          </div>
        </div>
        {alerts.slice(0, 2).map((a) => (
          <div key={a.id} className="flex gap-2 text-xs border rounded-lg p-2">
            <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" />
            {a.message}
          </div>
        ))}
        <div className="flex justify-between items-center">
          <span className="text-sm">
            Losses: <strong className="text-destructive">{formatCurrency(kpis.estimatedLosses)}</strong>
          </span>
          <Button asChild variant="outline" size="sm">
            <Link href="/">
              <ArrowRight className="h-3 w-3" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
