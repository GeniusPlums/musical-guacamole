"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, AlertTriangle } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppStore } from "@/store/use-app-store";
import { getInventory, getVariances } from "@/lib/data/service";
import { formatCurrency, formatNumber } from "@/lib/utils";
import type { InventoryCategory } from "@/lib/types";

const CATEGORIES: InventoryCategory[] = [
  "Beer", "Whiskey", "Vodka", "Rum", "Gin", "Kitchen Ingredients",
];

export default function InventoryPage() {
  const { selectedOutletId } = useAppStore();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");

  const inventory = getInventory(selectedOutletId ?? undefined);
  const variances = getVariances(selectedOutletId ?? undefined);
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

  return (
    <AppShell
      title="Inventory"
      description="Track stock levels, thresholds, and variance across all SKUs"
    >
      <div className="space-y-4">
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
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Product</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Category</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">SKU</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Cost</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Sell</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Stock</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Variance</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => {
                const variance = varianceMap.get(item.id);
                const isLow = item.currentStock < item.reorderThreshold;
                const hasNegativeVariance = variance && variance.variance < 0;

                return (
                  <tr
                    key={item.id}
                    className="border-b border-border transition-colors hover:bg-accent/30"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/inventory/${item.id}`}
                        className="font-medium hover:text-primary hover:underline"
                      >
                        {item.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="text-[10px]">{item.category}</Badge>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{item.sku}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatCurrency(item.costPrice)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatCurrency(item.sellingPrice)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {formatNumber(item.currentStock)} {item.unit}
                    </td>
                    <td className={`px-4 py-3 text-right tabular-nums font-medium ${hasNegativeVariance ? "text-destructive" : "text-muted-foreground"}`}>
                      {variance ? `${variance.variance > 0 ? "+" : ""}${variance.variance}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {hasNegativeVariance && (
                        <Badge variant="destructive" className="text-[10px]">
                          <AlertTriangle className="mr-1 h-3 w-3" />
                          Variance
                        </Badge>
                      )}
                      {isLow && !hasNegativeVariance && (
                        <Badge variant="warning" className="text-[10px]">Low Stock</Badge>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-muted-foreground">
          Showing {filtered.length} of {inventory.length} items
        </p>
      </div>
    </AppShell>
  );
}
