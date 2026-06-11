"use client";

import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { useSimulationStore } from "@/store/use-simulation-store";
import { computeAllVariances, computeVarianceFromEvents } from "@/lib/variance-engine";
import type { DashboardKPIs, InvestigationCase, InventoryItem, StockEvent, TrendPoint, VarianceRecord } from "@/lib/types";

/** Subscribe to stable store slices — never call store getters inside useSimulationStore selectors. */
export function useSimulationData() {
  return useSimulationStore((s) => s.data);
}

export function useSimulationOpeningStocks() {
  return useSimulationStore((s) => s.openingStocks);
}

export function useSimulationInvestigations() {
  return useSimulationStore((s) => s.investigations);
}

export function useSimulationActivityFeed() {
  return useSimulationStore((s) => s.activityFeed);
}

export function useSimulationHydrated() {
  return useSimulationStore((s) => s.hydrated);
}

export function useSimulationActions() {
  return useSimulationStore(
    useShallow((s) => ({
      receiveDelivery: s.receiveDelivery,
      recordWastage: s.recordWastage,
      manualAdjust: s.manualAdjust,
      updateItemFields: s.updateItemFields,
      sellBeer: s.sellBeer,
      sellWhiskey: s.sellWhiskey,
      sellCocktail: s.sellCocktail,
      sellRandomOrder: s.sellRandomOrder,
      simulateTheft: s.simulateTheft,
      simulateKitchenWaste: s.simulateKitchenWaste,
      simulateUnauthorizedAdjustment: s.simulateUnauthorizedAdjustment,
      performStockCount: s.performStockCount,
      runBusyNight: s.runBusyNight,
      runWeekendRush: s.runWeekendRush,
      generateRandomSales: s.generateRandomSales,
      receiveDeliveryBatch: s.receiveDeliveryBatch,
      generateAuditReport: s.generateAuditReport,
      loadScenario: s.loadScenario,
      resetSimulation: s.resetSimulation,
    }))
  );
}

export function useSimulationInventory(outletId?: string): InventoryItem[] {
  const inventory = useSimulationStore((s) => s.data.inventory);
  return useMemo(
    () => (outletId ? inventory.filter((i) => i.outletId === outletId) : inventory),
    [inventory, outletId]
  );
}

export function useSimulationEvents(filters?: {
  outletId?: string;
  inventoryItemId?: string;
  limit?: number;
}): StockEvent[] {
  const events = useSimulationStore((s) => s.data.events);
  return useMemo(() => {
    let list = [...events].sort(
      (a, b) => toTime(b.timestamp) - toTime(a.timestamp)
    );
    if (filters?.outletId) list = list.filter((e) => e.outletId === filters.outletId);
    if (filters?.inventoryItemId)
      list = list.filter((e) => e.inventoryItemId === filters.inventoryItemId);
    if (filters?.limit) list = list.slice(0, filters.limit);
    return list;
  }, [events, filters]);
}

export function useSimulationVariances(outletId?: string): VarianceRecord[] {
  const inventory = useSimulationStore((s) => s.data.inventory);
  const events = useSimulationStore((s) => s.data.events);
  const openingStocks = useSimulationStore((s) => s.openingStocks);
  return useMemo(() => {
    const inv = outletId ? inventory.filter((i) => i.outletId === outletId) : inventory;
    const ev = outletId ? events.filter((e) => e.outletId === outletId) : events;
    return computeAllVariances(inv, ev, new Map(Object.entries(openingStocks)));
  }, [inventory, events, openingStocks, outletId]);
}

export function useSimulationItemVariance(itemId: string): VarianceRecord | undefined {
  const inventory = useSimulationStore((s) => s.data.inventory);
  const events = useSimulationStore((s) => s.data.events);
  const openingStocks = useSimulationStore((s) => s.openingStocks);
  return useMemo(() => {
    if (!itemId) return undefined;
    const item = inventory.find((i) => i.id === itemId);
    if (!item) return undefined;
    const itemEvents = events.filter((e) => e.inventoryItemId === itemId);
    const opening = openingStocks[itemId] ?? item.currentStock;
    return computeVarianceFromEvents(item, itemEvents, opening, item.currentStock);
  }, [inventory, events, openingStocks, itemId]);
}

export function useSimulationKPIs(outletId?: string): DashboardKPIs {
  const variances = useSimulationVariances(outletId);
  const inventory = useSimulationInventory(outletId);
  const events = useSimulationEvents({ outletId });
  const kitchenWastage = useSimulationStore((s) => s.data.kitchenWastage);
  const allInventory = useSimulationStore((s) => s.data.inventory);

  return useMemo(() => {
    const kitchen = outletId
      ? kitchenWastage.filter((k) => k.outletId === outletId)
      : kitchenWastage;

    const inventoryValue = inventory.reduce((s, i) => s + i.currentStock * i.costPrice, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaysSales = events
      .filter((e) => e.type === "SALE" && toTime(e.timestamp) >= today.getTime())
      .reduce((s, e) => {
        const item = allInventory.find((i) => i.id === e.inventoryItemId);
        return s + Math.abs(e.quantity) * (item?.sellingPrice ?? 0);
      }, 0);

    const negative = variances.filter((v) => v.variance < 0);
    return {
      inventoryValue,
      todaysSales,
      inventoryVariance: negative.reduce((s, v) => s + Math.abs(v.variance), 0),
      estimatedLosses: negative.reduce((s, v) => s + v.lossValue, 0),
      wastageCost: kitchen.reduce((s, k) => s + k.lossValue, 0),
    };
  }, [variances, inventory, events, kitchenWastage, allInventory, outletId]);
}

export function useSimulationLossTrend(outletId?: string): TrendPoint[] {
  const events = useSimulationEvents({ outletId });
  const inventory = useSimulationStore((s) => s.data.inventory);

  return useMemo(() => {
    const points: TrendPoint[] = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      let loss = 0;
      for (const e of events) {
        const t = toTime(e.timestamp);
        if (t >= d.getTime() && t < next.getTime() && (e.type === "WASTAGE" || e.suspicious)) {
          const item = inventory.find((i) => i.id === e.inventoryItemId);
          loss += Math.abs(e.quantity) * (item?.costPrice ?? 0);
        }
      }
      points.push({
        date: d.toISOString().split("T")[0],
        value: loss,
        label: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      });
    }
    return points;
  }, [events, inventory]);
}

export function useSimulationTopMissing(outletId?: string, limit = 5) {
  const variances = useSimulationVariances(outletId);
  return useMemo(
    () =>
      variances
        .filter((v) => v.variance < 0)
        .sort((a, b) => b.lossValue - a.lossValue)
        .slice(0, limit)
        .map((v) => ({
          name: v.itemName,
          variance: v.variance,
          lossValue: v.lossValue,
          category: v.category,
        })),
    [variances, limit]
  );
}

export function useOpenInvestigations(outletId?: string): InvestigationCase[] {
  const investigations = useSimulationInvestigations();
  return useMemo(() => {
    let list = investigations.filter((i) => i.status === "open");
    if (outletId) list = list.filter((i) => i.outletId === outletId);
    return list.sort((a, b) => toTime(b.createdAt) - toTime(a.createdAt));
  }, [investigations, outletId]);
}

export function useSimulationAlerts(outletId?: string) {
  const alerts = useSimulationStore((s) => s.data.alerts);
  return useMemo(
    () => (outletId ? alerts.filter((a) => a.outletId === outletId) : alerts),
    [alerts, outletId]
  );
}

function toTime(value: Date | string): number {
  if (value instanceof Date) return value.getTime();
  return new Date(value).getTime();
}
