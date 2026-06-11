"use client";

import { useMemo } from "react";
import { ChefHat } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/use-app-store";
import { useSimulationData, useSimulationActions } from "@/hooks/use-simulation";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils";

export default function KitchenPage() {
  const outletId = useAppStore((s) => s.selectedOutletId) ?? undefined;
  const kitchenWastage = useSimulationData().kitchenWastage;
  const { simulateKitchenWaste } = useSimulationActions();

  const items = useMemo(
    () => (outletId ? kitchenWastage.filter((k) => k.outletId === outletId) : kitchenWastage),
    [kitchenWastage, outletId]
  );

  const totalLoss = items.reduce((s, i) => s + i.lossValue, 0);
  const avgWastage = items.length > 0 ? items.reduce((s, i) => s + i.wastagePercent, 0) / items.length : 0;

  return (
    <AppShell title="Kitchen Wastage" description="Track and simulate ingredient loss">
      <div className="space-y-6">
        <Button variant="destructive" className="gap-2" onClick={simulateKitchenWaste}><ChefHat className="h-4 w-4" />Simulate Kitchen Waste</Button>
        <div className="grid gap-4 sm:grid-cols-3">
          <Card><CardContent className="p-5"><p className="text-xs uppercase text-muted-foreground">Total Loss</p><p className="mt-2 text-2xl font-semibold text-destructive">{formatCurrency(totalLoss)}</p></CardContent></Card>
          <Card><CardContent className="p-5"><p className="text-xs uppercase text-muted-foreground">Avg Wastage</p><p className="mt-2 text-2xl font-semibold text-amber-500">{formatPercent(avgWastage)}</p></CardContent></Card>
          <Card><CardContent className="p-5"><p className="text-xs uppercase text-muted-foreground">Items</p><p className="mt-2 text-2xl font-semibold">{items.length}</p></CardContent></Card>
        </div>
        <div className="rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left">Ingredient</th>
              <th className="px-4 py-3 text-right">Purchased</th>
              <th className="px-4 py-3 text-right">Used</th>
              <th className="px-4 py-3 text-right">Spoiled</th>
              <th className="px-4 py-3 text-right">Missing</th>
              <th className="px-4 py-3 text-right">Loss</th>
            </tr></thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b hover:bg-accent/30">
                  <td className="px-4 py-3 font-medium">{item.name}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{formatNumber(item.purchased)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{formatNumber(item.used)}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-amber-500">{formatNumber(item.spoiled)}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-destructive">{formatNumber(item.unaccounted)}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-destructive font-medium">{formatCurrency(item.lossValue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
