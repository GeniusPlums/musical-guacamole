"use client";

import { ChefHat } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AreaChart } from "@/components/charts/area-chart";
import { useAppStore } from "@/store/use-app-store";
import { getKitchenWastage, getKitchenMonthlyTrend } from "@/lib/data/service";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils";

export default function KitchenPage() {
  const { selectedOutletId } = useAppStore();
  const items = getKitchenWastage(selectedOutletId ?? undefined);
  const monthlyTrend = getKitchenMonthlyTrend(selectedOutletId ?? undefined);

  const totalLoss = items.reduce((s, i) => s + i.lossValue, 0);
  const avgWastage =
    items.length > 0
      ? items.reduce((s, i) => s + i.wastagePercent, 0) / items.length
      : 0;

  return (
    <AppShell
      title="Kitchen Wastage"
      description="Track purchased, used, spoiled, and unaccounted ingredients"
    >
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="p-5">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Loss Value</p>
              <p className="mt-2 text-2xl font-semibold text-destructive tabular-nums">
                {formatCurrency(totalLoss)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Avg Wastage %</p>
              <p className="mt-2 text-2xl font-semibold text-amber-500 tabular-nums">
                {formatPercent(avgWastage)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Ingredients Tracked</p>
              <p className="mt-2 text-2xl font-semibold tabular-nums">{items.length}</p>
            </CardContent>
          </Card>
        </div>

        <AreaChart
          title="Monthly Wastage Trend"
          data={monthlyTrend}
          color="hsl(var(--chart-4))"
        />

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
                <tr
                  key={item.id}
                  className={`border-b border-border transition-colors hover:bg-accent/30 ${
                    item.name === "Tomatoes" ? "bg-amber-500/5" : ""
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <ChefHat className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="font-medium">{item.name}</span>
                      {item.name === "Tomatoes" && (
                        <Badge variant="warning" className="text-[10px]">Demo</Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {formatNumber(item.purchased)} {item.unit}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {formatNumber(item.used)} {item.unit}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-amber-500">
                    {formatNumber(item.spoiled)} {item.unit}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-destructive">
                    {formatNumber(item.unaccounted)} {item.unit}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums font-medium text-destructive">
                    {formatCurrency(item.lossValue)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Badge
                      variant={item.wastagePercent > 20 ? "destructive" : item.wastagePercent > 10 ? "warning" : "secondary"}
                      className="text-[10px]"
                    >
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
