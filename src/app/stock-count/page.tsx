"use client";

import { useState } from "react";
import { ClipboardCheck } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  useSimulationInventory,
  useSimulationItemVariance,
  useSimulationActions,
} from "@/hooks/use-simulation";
import { useAppStore } from "@/store/use-app-store";
import { formatCurrency, formatNumber } from "@/lib/utils";

export default function StockCountPage() {
  const outletId = useAppStore((s) => s.selectedOutletId) ?? undefined;
  const inventory = useSimulationInventory(outletId);
  const { performStockCount } = useSimulationActions();

  const [selectedId, setSelectedId] = useState("");
  const [actual, setActual] = useState("");
  const [result, setResult] = useState<{ variance: number; lossValue: number } | null>(null);

  const activeId = selectedId || inventory[0]?.id || "";
  const item = inventory.find((i) => i.id === activeId);
  const variance = useSimulationItemVariance(activeId);
  const expected = variance?.expectedStock ?? 0;

  const handleSubmit = () => {
    if (!activeId || actual === "") return;
    const res = performStockCount(activeId, Number(actual));
    setResult(res);
  };

  return (
    <AppShell
      title="Stock Count"
      description="Perform closing counts — variances automatically open investigation cases"
    >
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4" />
              Closing Stock Count
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Select Product</label>
              <Select value={activeId} onValueChange={(v) => { setSelectedId(v); setResult(null); }}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {inventory.map((i) => (
                    <SelectItem key={i.id} value={i.id}>
                      {i.name} ({formatNumber(i.currentStock)} {i.unit})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {item && variance && (
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-xs text-muted-foreground">Expected Stock</p>
                  <p className="text-2xl font-semibold tabular-nums mt-1">
                    {formatNumber(expected)} {item.unit}
                  </p>
                </div>
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-xs text-muted-foreground">System Stock</p>
                  <p className="text-2xl font-semibold tabular-nums mt-1">
                    {formatNumber(item.currentStock)} {item.unit}
                  </p>
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-muted-foreground">Actual Count</label>
              <Input
                type="number"
                className="mt-1"
                placeholder="Enter physical count..."
                value={actual}
                onChange={(e) => setActual(e.target.value)}
              />
            </div>

            <Button className="w-full" onClick={handleSubmit} disabled={!activeId || actual === ""}>
              Submit Stock Count
            </Button>
          </CardContent>
        </Card>

        {result && item && (
          <Card className={result.variance < 0 ? "border-destructive/50" : "border-emerald-500/30"}>
            <CardContent className="p-6">
              <div className="text-center space-y-2">
                <Badge variant={result.variance < 0 ? "destructive" : "success"}>
                  {result.variance < 0 ? "Variance Detected" : "Count Matched"}
                </Badge>
                <p className="text-sm text-muted-foreground">{item.name}</p>
                <div className="grid grid-cols-3 gap-4 pt-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Expected</p>
                    <p className="text-lg font-semibold">{expected}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Actual</p>
                    <p className="text-lg font-semibold">{actual}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Variance</p>
                    <p className={`text-lg font-semibold ${result.variance < 0 ? "text-destructive" : ""}`}>
                      {result.variance}
                    </p>
                  </div>
                </div>
                {result.lossValue > 0 && (
                  <p className="text-destructive font-semibold text-xl pt-2">
                    Loss: {formatCurrency(result.lossValue)}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
