"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppStore } from "@/store/use-app-store";
import { getVariances } from "@/lib/data/service";
import { formatCurrency, formatNumber } from "@/lib/utils";

export default function VariancePage() {
  const { selectedOutletId } = useAppStore();
  const [filter, setFilter] = useState<string>("negative");

  const variances = getVariances(selectedOutletId ?? undefined);

  const filtered = useMemo(() => {
    let result = [...variances];
    if (filter === "negative") result = result.filter((v) => v.variance < 0);
    else if (filter === "positive") result = result.filter((v) => v.variance > 0);
    return result.sort((a, b) => a.variance - b.variance);
  }, [variances, filter]);

  const totalLoss = variances
    .filter((v) => v.variance < 0)
    .reduce((s, v) => s + v.lossValue, 0);

  const negativeCount = variances.filter((v) => v.variance < 0).length;

  return (
    <AppShell
      title="Variance Engine"
      description="Expected vs actual stock — the core of inventory intelligence"
    >
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="p-5">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Items with Variance</p>
              <p className="mt-2 text-2xl font-semibold text-destructive">{negativeCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Estimated Loss</p>
              <p className="mt-2 text-2xl font-semibold text-destructive">{formatCurrency(totalLoss)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">SKUs Tracked</p>
              <p className="mt-2 text-2xl font-semibold">{variances.length}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <p className="text-sm">
              <span className="font-medium">Variance Formula:</span>{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
                Expected = Opening + Received − Sales − Wastage
              </code>
              {" · "}
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
                Variance = Actual − Expected
              </code>
            </p>
          </CardContent>
        </Card>

        <div className="flex items-center gap-3">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="negative">Negative Variance</SelectItem>
              <SelectItem value="positive">Positive Variance</SelectItem>
              <SelectItem value="all">All Items</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Product</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Expected</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actual</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Variance</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Loss Value</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 50).map((v) => (
                <tr
                  key={v.inventoryItemId}
                  className={`border-b border-border transition-colors hover:bg-accent/30 ${
                    v.variance < 0 ? "bg-destructive/5" : ""
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {v.variance < 0 && <AlertTriangle className="h-3.5 w-3.5 text-destructive" />}
                      <div>
                        <p className="font-medium">{v.itemName}</p>
                        <p className="text-[10px] text-muted-foreground">{v.category} · {v.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{formatNumber(v.expectedStock)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{formatNumber(v.actualStock)}</td>
                  <td className={`px-4 py-3 text-right tabular-nums font-semibold ${v.variance < 0 ? "text-destructive" : "text-emerald-500"}`}>
                    {v.variance > 0 ? "+" : ""}{v.variance}
                  </td>
                  <td className={`px-4 py-3 text-right tabular-nums font-medium ${v.lossValue > 0 ? "text-destructive" : ""}`}>
                    {v.lossValue > 0 ? formatCurrency(v.lossValue) : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/inventory/${v.inventoryItemId}`}>
                        Investigate
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </Link>
                    </Button>
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
