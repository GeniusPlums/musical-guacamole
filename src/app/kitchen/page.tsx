"use client";

import { ChefHat } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/use-app-store";
import { useSimulationStore } from "@/store/use-simulation-store";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils";

export default function KitchenPage() {
  const outletId = useAppStore((s) => s.selectedOutletId) ?? undefined;
  const items = useSimulationStore((s) =>
    outletId ? s.data.kitchenWastage.filter((k) => k.outletId === outletId) : s.data.kitchenWastage
  );
  const simulateKitchenWaste = useSimulationStore((s) => s.simulateKitchenWaste);

  const totalLoss = items.reduce((s, i) => s + i.lossValue, 0);
  const avgWastage = items.length > 0 ? items.reduce((s, i) => s + i.wastagePercent, 0) / items.length : 0;

  return (
    <AppShell title="Kitchen Wastage" description="Track ingredient loss — simulate spoilage to see impact">
      <div className="space-y-6">
        <Button variant="destructive" className="gap-2" onClick={simulateKitchenWaste}>
          <ChefHat className="h-4 w-4" />
          Simulate Kitchen Waste Event
        </Button>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card><CardContent className="p-5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Total Loss</p>
            <p className="mt-2 text-2xl font-semibold text-destructive">{formatCurrency(totalLoss)}</p>
          </CardContent></Card>
          <Card><CardContent className="p-5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Avg Wastage %</p>
            <p className="mt-2 text-2xl font-semibold text-amber-500">{formatPercent(avgWastage)}</p>
          </CardContent></Card>
          <Card><CardContent className="p-5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Ingredients</p>
            <p className="mt-2 text-2xl font-semibold">{items.length}</p>
          </CardContent></Card>
        </div>

        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Ingredient</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Purchased</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Used</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Spoiled</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Missing</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Loss</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Wastage %</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-border hover:bg-accent/30">
                  <td className="px-4 py-3 font-medium">{item.name}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{formatNumber(item.purchased)} {item.unit}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{formatNumber(item.used)} {item.unit}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-amber-500">{formatNumber(item.spoiled)}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-destructive">{formatNumber(item.unaccounted)}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-destructive font-medium">{formatCurrency(item.lossValue)}</td>
                  <td className="px-4 py-3 text-right">
                    <Badge variant={item.wastagePercent > 20 ? "destructive" : "warning"} className="text-[10px]">
                      {formatPercent(item.wastagePercent)}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
