"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, AlertTriangle, Plus, Package, Trash2, Pencil } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppStore } from "@/store/use-app-store";
import { useSimulationStore } from "@/store/use-simulation-store";
import { formatCurrency, formatNumber } from "@/lib/utils";
import type { InventoryCategory } from "@/lib/types";

const CATEGORIES: InventoryCategory[] = [
  "Beer", "Whiskey", "Vodka", "Rum", "Gin", "Kitchen Ingredients",
];

export default function InventoryPage() {
  const outletId = useAppStore((s) => s.selectedOutletId) ?? undefined;
  const inventory = useSimulationStore((s) => s.getInventory(outletId));
  const getVariances = useSimulationStore((s) => s.getVariances);
  const receiveDelivery = useSimulationStore((s) => s.receiveDelivery);
  const recordWastage = useSimulationStore((s) => s.recordWastage);
  const manualAdjust = useSimulationStore((s) => s.manualAdjust);
  const updateItemFields = useSimulationStore((s) => s.updateItemFields);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStock, setEditStock] = useState("");

  const variances = getVariances(outletId);
  const varianceMap = useMemo(
    () => new Map(variances.map((v) => [v.inventoryItemId, v])),
    [variances]
  );

  const filtered = inventory.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "all" || item.category === category;
    return matchesSearch && matchesCategory;
  });

  const totalValue = inventory.reduce((s, i) => s + i.currentStock * i.costPrice, 0);

  return (
    <AppShell
      title="Live Inventory"
      description="Editable inventory — receive, adjust, and record wastage in real time"
    >
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">SKUs</p>
              <p className="text-xl font-semibold">{inventory.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Inventory Value</p>
              <p className="text-xl font-semibold">{formatCurrency(totalValue)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Low Stock</p>
              <p className="text-xl font-semibold text-amber-500">
                {inventory.filter((i) => i.currentStock < i.reorderThreshold).length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">With Variance</p>
              <p className="text-xl font-semibold text-destructive">
                {variances.filter((v) => v.variance < 0).length}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-3">
          {filtered.slice(0, 40).map((item) => {
            const variance = varianceMap.get(item.id);
            const isLow = item.currentStock < item.reorderThreshold;
            const hasNegativeVariance = variance && variance.variance < 0;
            const isEditing = editingId === item.id;

            return (
              <Card key={item.id} className={hasNegativeVariance ? "border-destructive/30" : ""}>
                <CardContent className="p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link href={`/inventory/${item.id}`} className="font-medium hover:text-primary">
                          {item.name}
                        </Link>
                        <Badge variant="outline" className="text-[10px]">{item.category}</Badge>
                        {hasNegativeVariance && (
                          <Badge variant="destructive" className="text-[10px]">
                            <AlertTriangle className="mr-1 h-3 w-3" />Variance
                          </Badge>
                        )}
                        {isLow && <Badge variant="warning" className="text-[10px]">Low Stock</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {item.sku} · Cost {formatCurrency(item.costPrice)} · Sell {formatCurrency(item.sellingPrice)}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        {isEditing ? (
                          <>
                            <Input
                              type="number"
                              className="w-24 h-8"
                              value={editStock}
                              onChange={(e) => setEditStock(e.target.value)}
                            />
                            <Button
                              size="sm"
                              onClick={() => {
                                updateItemFields(item.id, { currentStock: Number(editStock) });
                                setEditingId(null);
                              }}
                            >
                              Save
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
                          </>
                        ) : (
                          <p className="text-lg font-semibold tabular-nums">
                            {formatNumber(item.currentStock)} {item.unit}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 ml-1"
                              onClick={() => { setEditingId(item.id); setEditStock(String(item.currentStock)); }}
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                          </p>
                        )}
                        {variance && (
                          <span className={`text-xs ${hasNegativeVariance ? "text-destructive" : "text-muted-foreground"}`}>
                            Var: {variance.variance > 0 ? "+" : ""}{variance.variance}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <Button size="sm" variant="outline" className="gap-1" onClick={() => receiveDelivery(item.id, 12)}>
                        <Package className="h-3 w-3" />+12
                      </Button>
                      <Button size="sm" variant="outline" className="gap-1" onClick={() => manualAdjust(item.id, 5)}>
                        <Plus className="h-3 w-3" />Adj
                      </Button>
                      <Button size="sm" variant="outline" className="gap-1" onClick={() => recordWastage(item.id, 1)}>
                        <Trash2 className="h-3 w-3" />Waste
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <p className="text-xs text-muted-foreground">
          Showing {Math.min(filtered.length, 40)} of {filtered.length} items
        </p>
      </div>
    </AppShell>
  );
}
