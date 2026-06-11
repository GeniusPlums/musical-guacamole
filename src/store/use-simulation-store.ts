"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { generateMockData, getOpeningStocks } from "@/lib/mock-data/generator";
import { generateInvestigationAnalysis } from "@/lib/analysis/investigator";
import { generateAuditReportForOutlet } from "@/lib/audit/generator";
import { computeAllVariances, computeVarianceFromEvents } from "@/lib/variance-engine";
import { isValidSimulationState, reviveSimulationState } from "@/lib/storage/revive-dates";
import type {
  ActivityFeedItem,
  AppData,
  DashboardKPIs,
  InvestigationCase,
  InventoryItem,
  ShiftName,
  StockEvent,
  TrendPoint,
  VarianceRecord,
} from "@/lib/types";

const STORAGE_KEY = "bariq-simulation-v2";

function createInitialSnapshot() {
  const data = generateMockData();
  const openingMap = getOpeningStocks(data.inventory);
  const openingStocks: Record<string, number> = {};
  openingMap.forEach((v, k) => {
    openingStocks[k] = v;
  });
  return {
    data,
    openingStocks,
    investigations: [] as InvestigationCase[],
    activityFeed: [] as ActivityFeedItem[],
    nextEventId: data.events.length + 1,
    nextAlertId: data.alerts.length + 1,
    nextInvestigationId: 1,
  };
}

function getCurrentShift(): ShiftName {
  const hour = new Date().getHours();
  const day = new Date().getDay();
  if (day === 6 && hour >= 18) return "Saturday Night Shift";
  if (day === 0 && hour < 14) return "Sunday Brunch Shift";
  if (hour < 12) return "Morning Shift";
  if (hour < 17) return "Afternoon Shift";
  return "Evening Shift";
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function toEventTime(value: Date | string): number {
  if (value instanceof Date) return value.getTime();
  return new Date(value).getTime();
}

interface SimulationStore {
  data: AppData;
  openingStocks: Record<string, number>;
  investigations: InvestigationCase[];
  activityFeed: ActivityFeedItem[];
  nextEventId: number;
  nextAlertId: number;
  nextInvestigationId: number;
  hydrated: boolean;

  setHydrated: (v: boolean) => void;
  resetSimulation: () => void;

  getActiveOutletId: (override?: string | null) => string;
  getInventory: (outletId?: string) => InventoryItem[];
  getEvents: (filters?: { outletId?: string; inventoryItemId?: string; limit?: number }) => StockEvent[];
  getVariances: (outletId?: string) => VarianceRecord[];
  getItemVariance: (itemId: string) => VarianceRecord | undefined;
  getDashboardKPIs: (outletId?: string) => DashboardKPIs;
  getLossTrend: (outletId?: string) => TrendPoint[];
  getWastageTrend: (outletId?: string) => TrendPoint[];
  getTopMissingProducts: (outletId?: string, limit?: number) => { name: string; variance: number; lossValue: number; category: string }[];
  getOpenInvestigations: (outletId?: string) => InvestigationCase[];

  pushActivity: (item: Omit<ActivityFeedItem, "id" | "timestamp">) => void;
  addAlert: (alert: Omit<import("@/lib/types").Alert, "id" | "timestamp">) => void;
  createInvestigation: (
    item: InventoryItem,
    variance: VarianceRecord,
    trigger: InvestigationCase["trigger"]
  ) => void;

  recordEvent: (
    itemId: string,
    type: StockEvent["type"],
    quantity: number,
    opts?: { notes?: string; reference?: string; suspicious?: boolean; employeeId?: string }
  ) => void;

  receiveDelivery: (itemId: string, quantity: number) => void;
  recordWastage: (itemId: string, quantity: number) => void;
  manualAdjust: (itemId: string, quantity: number, suspicious?: boolean) => void;
  updateItemStock: (itemId: string, stock: number) => void;
  updateItemFields: (itemId: string, fields: Partial<InventoryItem>) => void;

  sellItem: (itemId: string, quantity: number) => void;
  sellBeer: (count?: number) => void;
  sellWhiskey: () => void;
  sellCocktail: () => void;
  sellRandomOrder: () => void;

  simulateTheft: () => void;
  simulateKitchenWaste: () => void;
  simulateUnauthorizedAdjustment: () => void;
  performStockCount: (itemId: string, actualCount: number) => { variance: number; lossValue: number };

  runBusyNight: () => void;
  runWeekendRush: () => void;
  generateRandomSales: (count?: number) => void;
  receiveDeliveryBatch: () => void;
  generateAuditReport: (outletId?: string) => void;
  loadScenario: (scenarioId: string) => void;
}

export const useSimulationStore = create<SimulationStore>()(
  persist(
    (set, get) => ({
      ...createInitialSnapshot(),
      hydrated: false,

      setHydrated: (v) => set({ hydrated: v }),

      resetSimulation: () => {
        const fresh = createInitialSnapshot();
        set({ ...fresh, hydrated: true });
        void useSimulationStore.persist.clearStorage();
      },

      getActiveOutletId: (override) => {
        if (override) return override;
        return get().data.outlets[0]?.id ?? "outlet-a";
      },

      getInventory: (outletId) => {
        const inv = get().data.inventory;
        return outletId ? inv.filter((i) => i.outletId === outletId) : inv;
      },

      getEvents: (filters) => {
        let events = [...get().data.events].sort(
          (a, b) => toEventTime(b.timestamp) - toEventTime(a.timestamp)
        );
        if (filters?.outletId) events = events.filter((e) => e.outletId === filters.outletId);
        if (filters?.inventoryItemId)
          events = events.filter((e) => e.inventoryItemId === filters.inventoryItemId);
        if (filters?.limit) events = events.slice(0, filters.limit);
        return events;
      },

      getVariances: (outletId) => {
        const { data, openingStocks } = get();
        const inventory = outletId
          ? data.inventory.filter((i) => i.outletId === outletId)
          : data.inventory;
        const events = outletId
          ? data.events.filter((e) => e.outletId === outletId)
          : data.events;
        const map = new Map(Object.entries(openingStocks));
        return computeAllVariances(inventory, events, map);
      },

      getItemVariance: (itemId) => {
        const item = get().data.inventory.find((i) => i.id === itemId);
        if (!item) return undefined;
        const events = get().data.events.filter((e) => e.inventoryItemId === itemId);
        const opening = get().openingStocks[itemId] ?? item.currentStock;
        return computeVarianceFromEvents(item, events, opening, item.currentStock);
      },

      getDashboardKPIs: (outletId) => {
        const variances = get().getVariances(outletId);
        const inventory = get().getInventory(outletId);
        const events = get().getEvents({ outletId });
        const kitchen = outletId
          ? get().data.kitchenWastage.filter((k) => k.outletId === outletId)
          : get().data.kitchenWastage;

        const inventoryValue = inventory.reduce((s, i) => s + i.currentStock * i.costPrice, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todaysSales = events
          .filter((e) => e.type === "SALE" && new Date(e.timestamp) >= today)
          .reduce((s, e) => {
            const item = get().data.inventory.find((i) => i.id === e.inventoryItemId);
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
      },

      getLossTrend: (outletId) => {
        const events = get().getEvents({ outletId });
        const points: TrendPoint[] = [];
        const now = new Date();
        for (let i = 29; i >= 0; i--) {
          const d = new Date(now);
          d.setDate(d.getDate() - i);
          d.setHours(0, 0, 0, 0);
          const next = new Date(d);
          next.setDate(next.getDate() + 1);
          const dayEvents = events.filter((e) => {
            const t = new Date(e.timestamp);
            return t >= d && t < next;
          });
          let loss = 0;
          for (const e of dayEvents) {
            if (e.type === "WASTAGE" || e.suspicious) {
              const item = get().data.inventory.find((i) => i.id === e.inventoryItemId);
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
      },

      getWastageTrend: (outletId) => {
        const events = get().getEvents({ outletId });
        const points: TrendPoint[] = [];
        const now = new Date();
        for (let i = 29; i >= 0; i--) {
          const d = new Date(now);
          d.setDate(d.getDate() - i);
          d.setHours(0, 0, 0, 0);
          const next = new Date(d);
          next.setDate(next.getDate() + 1);
          const value = events
            .filter((e) => {
              const t = new Date(e.timestamp);
              return e.type === "WASTAGE" && t >= d && t < next;
            })
            .reduce((s, e) => {
              const item = get().data.inventory.find((i) => i.id === e.inventoryItemId);
              return s + Math.abs(e.quantity) * (item?.costPrice ?? 0);
            }, 0);
          points.push({
            date: d.toISOString().split("T")[0],
            value,
            label: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
          });
        }
        return points;
      },

      getTopMissingProducts: (outletId, limit = 5) =>
        get()
          .getVariances(outletId)
          .filter((v) => v.variance < 0)
          .sort((a, b) => b.lossValue - a.lossValue)
          .slice(0, limit)
          .map((v) => ({
            name: v.itemName,
            variance: v.variance,
            lossValue: v.lossValue,
            category: v.category,
          })),

      getOpenInvestigations: (outletId) => {
        let list = get().investigations.filter((i) => i.status === "open");
        if (outletId) list = list.filter((i) => i.outletId === outletId);
        return list.sort((a, b) => toEventTime(b.createdAt) - toEventTime(a.createdAt));
      },

      pushActivity: (item) => {
        const feed: ActivityFeedItem = {
          ...item,
          id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          timestamp: new Date(),
        };
        set((s) => ({
          activityFeed: [feed, ...s.activityFeed].slice(0, 100),
        }));
      },

      addAlert: (alert) => {
        const id = `alert-${get().nextAlertId}`;
        set((s) => ({
          nextAlertId: s.nextAlertId + 1,
          data: {
            ...s.data,
            alerts: [
              {
                ...alert,
                id,
                timestamp: new Date(),
              },
              ...s.data.alerts,
            ].slice(0, 20),
          },
        }));
      },

      createInvestigation: (item, variance, trigger) => {
        const { data, nextInvestigationId } = get();
        const events = data.events.filter((e) => e.inventoryItemId === item.id);
        const employees = data.employees.filter((e) => e.outletId === item.outletId);
        const opening = get().openingStocks[item.id] ?? item.currentStock;
        const { analysis, mostLikelyCause, responsibleEmployeeIds } =
          generateInvestigationAnalysis(item, events, employees, opening, trigger);

        const investigation: InvestigationCase = {
          id: `inv-case-${nextInvestigationId}`,
          outletId: item.outletId,
          inventoryItemId: item.id,
          itemName: item.name,
          status: "open",
          expectedStock: variance.expectedStock,
          actualStock: variance.actualStock,
          variance: variance.variance,
          lossValue: variance.lossValue,
          unit: item.unit,
          createdAt: new Date(),
          trigger,
          mostLikelyCause,
          analysis,
          responsibleEmployeeIds,
        };

        set((s) => ({
          nextInvestigationId: s.nextInvestigationId + 1,
          investigations: [investigation, ...s.investigations],
        }));

        get().pushActivity({
          type: "investigation",
          message: `Investigation opened: ${item.name} (${variance.variance} ${item.unit} variance)`,
          severity: "critical",
          outletId: item.outletId,
          inventoryItemId: item.id,
        });
      },

      recordEvent: (itemId, type, quantity, opts) => {
        const state = get();
        const item = state.data.inventory.find((i) => i.id === itemId);
        if (!item) return;

        const emps = state.data.employees.filter((e) => e.outletId === item.outletId);
        const employeeId = opts?.employeeId ?? pickRandom(emps).id;
        const eventId = `evt-live-${state.nextEventId}`;

        const event: StockEvent = {
          id: eventId,
          outletId: item.outletId,
          inventoryItemId: itemId,
          type,
          quantity,
          unit: item.unit,
          reference: opts?.reference,
          notes: opts?.notes,
          suspicious: opts?.suspicious,
          employeeId,
          shift: getCurrentShift(),
          timestamp: new Date(),
        };

        const newStock =
          type === "CLOSING_COUNT"
            ? item.currentStock
            : item.currentStock + quantity;

        set((s) => ({
          nextEventId: s.nextEventId + 1,
          data: {
            ...s.data,
            events: [event, ...s.data.events],
            inventory: s.data.inventory.map((i) =>
              i.id === itemId ? { ...i, currentStock: Math.max(0, newStock) } : i
            ),
          },
        }));
      },

      receiveDelivery: (itemId, quantity) => {
        const item = get().data.inventory.find((i) => i.id === itemId);
        if (!item) return;
        get().recordEvent(itemId, "STOCK_RECEIVED", quantity, {
          reference: `PO-${Math.floor(1000 + Math.random() * 9000)}`,
          notes: `Received ${quantity} ${item.unit}`,
        });
        get().pushActivity({
          type: "receive",
          message: `Received ${quantity} ${item.unit} of ${item.name}`,
          outletId: item.outletId,
          inventoryItemId: itemId,
        });
      },

      recordWastage: (itemId, quantity) => {
        const item = get().data.inventory.find((i) => i.id === itemId);
        if (!item) return;
        get().recordEvent(itemId, "WASTAGE", -quantity, {
          notes: pickRandom(["Broken bottle", "Spillage", "Expired", "Quality reject"]),
        });
        get().pushActivity({
          type: "wastage",
          message: `Wastage recorded: ${quantity} ${item.unit} of ${item.name}`,
          severity: "warning",
          outletId: item.outletId,
          inventoryItemId: itemId,
        });
      },

      manualAdjust: (itemId, quantity, suspicious = false) => {
        const item = get().data.inventory.find((i) => i.id === itemId);
        if (!item) return;
        get().recordEvent(itemId, "MANUAL_ADJUSTMENT", quantity, {
          notes: suspicious ? "Unauthorized adjustment" : "Inventory reconciliation",
          suspicious,
        });
        get().pushActivity({
          type: "adjustment",
          message: `Adjustment ${quantity > 0 ? "+" : ""}${quantity} ${item.unit} on ${item.name}${suspicious ? " (suspicious)" : ""}`,
          severity: suspicious ? "critical" : "info",
          outletId: item.outletId,
          inventoryItemId: itemId,
        });
        if (suspicious) {
          const variance = get().getItemVariance(itemId);
          if (variance && variance.variance < 0) {
            get().createInvestigation(item, variance, "adjustment");
          }
        }
      },

      updateItemStock: (itemId, stock) => {
        set((s) => ({
          data: {
            ...s.data,
            inventory: s.data.inventory.map((i) =>
              i.id === itemId ? { ...i, currentStock: Math.max(0, stock) } : i
            ),
          },
        }));
      },

      updateItemFields: (itemId, fields) => {
        set((s) => ({
          data: {
            ...s.data,
            inventory: s.data.inventory.map((i) =>
              i.id === itemId ? { ...i, ...fields } : i
            ),
          },
        }));
      },

      sellItem: (itemId, quantity) => {
        const item = get().data.inventory.find((i) => i.id === itemId);
        if (!item || item.currentStock < quantity) return;
        get().recordEvent(itemId, "SALE", -quantity, {
          reference: `Sale #${Math.floor(100 + Math.random() * 9900)}`,
        });
        get().pushActivity({
          type: "sale",
          message: `Sold ${quantity} ${item.unit} of ${item.name}`,
          outletId: item.outletId,
          inventoryItemId: itemId,
        });
      },

      sellBeer: (count = 1) => {
        const outletId = get().getActiveOutletId();
        const beers = get().data.inventory.filter(
          (i) => i.outletId === outletId && i.category === "Beer" && i.currentStock >= count
        );
        if (beers.length === 0) return;
        get().sellItem(pickRandom(beers).id, count);
      },

      sellWhiskey: () => {
        const outletId = get().getActiveOutletId();
        const items = get().data.inventory.filter(
          (i) => i.outletId === outletId && i.category === "Whiskey" && i.currentStock >= 1
        );
        if (items.length === 0) return;
        get().sellItem(pickRandom(items).id, 1);
      },

      sellCocktail: () => {
        const outletId = get().getActiveOutletId();
        const spirits = get().data.inventory.filter(
          (i) =>
            i.outletId === outletId &&
            ["Vodka", "Rum", "Gin"].includes(i.category) &&
            i.currentStock >= 1
        );
        if (spirits.length > 0) get().sellItem(pickRandom(spirits).id, 1);
        const kitchen = get().data.kitchenWastage.filter((k) => k.outletId === outletId);
        if (kitchen.length > 0) {
          const k = pickRandom(kitchen);
          set((s) => ({
            data: {
              ...s.data,
              kitchenWastage: s.data.kitchenWastage.map((ki) =>
                ki.id === k.id
                  ? { ...ki, used: ki.used + 0.2, unaccounted: Math.max(0, ki.unaccounted - 0.1) }
                  : ki
              ),
            },
          }));
        }
      },

      sellRandomOrder: () => {
        const outletId = get().getActiveOutletId();
        const available = get().data.inventory.filter(
          (i) => i.outletId === outletId && i.currentStock > 0 && i.category !== "Kitchen Ingredients"
        );
        if (available.length === 0) return;
        const item = pickRandom(available);
        const qty = Math.min(item.currentStock, 1 + Math.floor(Math.random() * 3));
        get().sellItem(item.id, qty);
      },

      simulateTheft: () => {
        const outletId = get().getActiveOutletId();
        const spirits = get().data.inventory.filter(
          (i) =>
            i.outletId === outletId &&
            i.category !== "Kitchen Ingredients" &&
            i.currentStock >= 3
        );
        if (spirits.length === 0) return;
        const item = pickRandom(spirits);
        const stolen = 1 + Math.floor(Math.random() * 5);
        const newStock = Math.max(0, item.currentStock - stolen);

        set((s) => ({
          data: {
            ...s.data,
            inventory: s.data.inventory.map((i) =>
              i.id === item.id ? { ...i, currentStock: newStock } : i
            ),
          },
        }));

        get().addAlert({
          outletId,
          severity: "critical",
          message: `Inventory anomaly detected: ${stolen} ${item.unit} of ${item.name} unaccounted for`,
          inventoryItemId: item.id,
        });

        get().pushActivity({
          type: "theft",
          message: `⚠ Missing ${stolen} ${item.unit} of ${item.name} — no sale record`,
          severity: "critical",
          outletId,
          inventoryItemId: item.id,
        });

        const updated = get().data.inventory.find((i) => i.id === item.id)!;
        const variance = get().getItemVariance(item.id);
        if (variance && variance.variance < 0) {
          get().createInvestigation(updated, variance, "anomaly");
        }
      },

      simulateKitchenWaste: () => {
        const outletId = get().getActiveOutletId();
        const kitchen = get().data.kitchenWastage.filter((k) => k.outletId === outletId);
        if (kitchen.length === 0) return;
        const item = pickRandom(kitchen);
        const spoiled = 2 + Math.floor(Math.random() * 8);

        set((s) => ({
          data: {
            ...s.data,
            kitchenWastage: s.data.kitchenWastage.map((k) => {
              if (k.id !== item.id) return k;
              const newSpoiled = k.spoiled + spoiled;
              const newUnaccounted = Math.max(0, k.unaccounted + spoiled * 0.3);
              const lossValue = (newSpoiled + newUnaccounted) * k.costPerUnit;
              const wastagePercent = ((newSpoiled + newUnaccounted) / k.purchased) * 100;
              return {
                ...k,
                spoiled: newSpoiled,
                unaccounted: newUnaccounted,
                lossValue,
                wastagePercent,
              };
            }),
          },
        }));

        get().pushActivity({
          type: "wastage",
          message: `Kitchen waste: ${spoiled}kg ${item.name} spoiled`,
          severity: "warning",
          outletId,
        });

        get().addAlert({
          outletId,
          severity: "warning",
          message: `Kitchen spoilage spike: ${item.name} +${spoiled}kg`,
        });
      },

      simulateUnauthorizedAdjustment: () => {
        const outletId = get().getActiveOutletId();
        const items = get().data.inventory.filter(
          (i) => i.outletId === outletId && i.category !== "Kitchen Ingredients"
        );
        if (items.length === 0) return;
        const item = pickRandom(items);
        const adj = -(2 + Math.floor(Math.random() * 6));
        get().manualAdjust(item.id, adj, true);
        get().addAlert({
          outletId,
          severity: "critical",
          message: `Suspicious adjustment on ${item.name}: ${adj} ${item.unit}`,
          inventoryItemId: item.id,
        });
      },

      performStockCount: (itemId, actualCount) => {
        const item = get().data.inventory.find((i) => i.id === itemId);
        if (!item) return { variance: 0, lossValue: 0 };

        const opening = get().openingStocks[itemId] ?? item.currentStock;
        const events = get().data.events.filter((e) => e.inventoryItemId === itemId);
        const expected = computeVarianceFromEvents(item, events, opening, item.currentStock);

        get().updateItemStock(itemId, actualCount);
        get().recordEvent(itemId, "CLOSING_COUNT", 0, {
          notes: `Physical count: ${actualCount} ${item.unit} (expected ${expected.expectedStock})`,
        });

        const updatedItem = { ...item, currentStock: actualCount };
        const variance = computeVarianceFromEvents(updatedItem, events, opening, actualCount);
        const result = { variance: variance.variance, lossValue: variance.lossValue };

        get().pushActivity({
          type: "stock_count",
          message: `Stock count ${item.name}: expected ${variance.expectedStock}, actual ${actualCount} (variance ${variance.variance})`,
          severity: variance.variance < 0 ? "critical" : "info",
          outletId: item.outletId,
          inventoryItemId: itemId,
        });

        if (variance.variance < 0) {
          get().createInvestigation(updatedItem, variance, "stock_count");
          get().addAlert({
            outletId: item.outletId,
            severity: "critical",
            message: `Variance detected: ${item.name} — ${variance.variance} ${item.unit} (₹${variance.lossValue.toLocaleString("en-IN")} loss)`,
            inventoryItemId: itemId,
          });
        }

        return result;
      },

      runBusyNight: () => {
        for (let i = 0; i < 25; i++) get().sellRandomOrder();
        get().pushActivity({
          type: "sale",
          message: "Busy night simulated — 25 random sales processed",
          outletId: get().getActiveOutletId(),
        });
      },

      runWeekendRush: () => {
        for (let i = 0; i < 15; i++) get().sellBeer(2);
        for (let i = 0; i < 10; i++) get().sellWhiskey();
        for (let i = 0; i < 8; i++) get().sellCocktail();
        get().pushActivity({
          type: "sale",
          message: "Weekend rush simulated — high volume service",
          outletId: get().getActiveOutletId(),
        });
      },

      generateRandomSales: (count = 10) => {
        for (let i = 0; i < count; i++) get().sellRandomOrder();
        get().pushActivity({
          type: "sale",
          message: `Generated ${count} random sales`,
          outletId: get().getActiveOutletId(),
        });
      },

      receiveDeliveryBatch: () => {
        const outletId = get().getActiveOutletId();
        const low = get()
          .data.inventory.filter(
            (i) => i.outletId === outletId && i.currentStock < i.reorderThreshold
          )
          .slice(0, 5);
        const items = low.length > 0 ? low : get().data.inventory.filter((i) => i.outletId === outletId).slice(0, 5);
        for (const item of items) {
          get().receiveDelivery(item.id, 12 + Math.floor(Math.random() * 24));
        }
        get().pushActivity({
          type: "receive",
          message: `Delivery received for ${items.length} SKUs`,
          outletId,
        });
      },

      generateAuditReport: (outletId) => {
        const oid = outletId ?? get().getActiveOutletId();
        const variances = get().getVariances(oid);
        const report = generateAuditReportForOutlet(get().data, variances, oid);
        set((s) => ({
          data: {
            ...s.data,
            auditReports: [report, ...s.data.auditReports],
          },
        }));
        get().pushActivity({
          type: "audit",
          message: `Audit report generated — ₹${report.inventoryLoss.toLocaleString("en-IN")} inventory loss`,
          outletId: oid,
        });
      },

      loadScenario: (scenarioId) => {
        const outletId = get().getActiveOutletId();

        if (scenarioId === "liquor-theft") {
          const blackDog = get().data.inventory.find(
            (i) => i.outletId === outletId && i.name === "Black Dog"
          );
          if (blackDog) {
            const stolen = 15;
            set((s) => ({
              data: {
                ...s.data,
                inventory: s.data.inventory.map((i) =>
                  i.id === blackDog.id
                    ? { ...i, currentStock: Math.max(0, i.currentStock - stolen) }
                    : i
                ),
              },
            }));
            get().addAlert({
              outletId,
              severity: "critical",
              message: "15 bottles of Black Dog unaccounted for",
              inventoryItemId: blackDog.id,
            });
            const updated = get().data.inventory.find((i) => i.id === blackDog.id)!;
            const v = get().getItemVariance(blackDog.id);
            if (v) get().createInvestigation(updated, v, "anomaly");
          }
          get().pushActivity({
            type: "scenario",
            message: "Scenario loaded: 15 liquor cases disappeared",
            severity: "critical",
            outletId,
          });
        }

        if (scenarioId === "kitchen-spoilage") {
          set((s) => ({
            data: {
              ...s.data,
              kitchenWastage: s.data.kitchenWastage.map((k) => {
                if (k.outletId !== outletId) return k;
                const spoiled = Math.round(k.spoiled * 1.4);
                const unaccounted = Math.round(k.unaccounted * 1.4);
                return {
                  ...k,
                  spoiled,
                  unaccounted,
                  lossValue: (spoiled + unaccounted) * k.costPerUnit,
                  wastagePercent: ((spoiled + unaccounted) / k.purchased) * 100,
                };
              }),
            },
          }));
          get().addAlert({
            outletId,
            severity: "warning",
            message: "Kitchen spoilage increased 40% across ingredients",
          });
          get().pushActivity({
            type: "scenario",
            message: "Scenario loaded: Kitchen spoilage +40%",
            severity: "warning",
            outletId,
          });
        }

        if (scenarioId === "audit-mismatch") {
          const items = get()
            .data.inventory.filter((i) => i.outletId === outletId && i.category === "Whiskey")
            .slice(0, 3);
          for (const item of items) {
            const actual = Math.max(0, item.currentStock - (3 + Math.floor(Math.random() * 5)));
            get().performStockCount(item.id, actual);
          }
          get().generateAuditReport(outletId);
          get().pushActivity({
            type: "scenario",
            message: "Scenario loaded: Audit mismatch discovered",
            severity: "critical",
            outletId,
          });
        }

        if (scenarioId === "weekend-overbooking") {
          get().runWeekendRush();
          const beers = get().data.inventory.filter(
            (i) => i.outletId === outletId && i.category === "Beer"
          );
          set((s) => ({
            data: {
              ...s.data,
              inventory: s.data.inventory.map((i) => {
                const beer = beers.find((b) => b.id === i.id);
                if (!beer) return i;
                return { ...i, currentStock: Math.max(2, Math.floor(i.currentStock * 0.3)) };
              }),
            },
          }));
          get().addAlert({
            outletId,
            severity: "warning",
            message: "Beer stock critically low after weekend overbooking",
          });
          get().pushActivity({
            type: "scenario",
            message: "Scenario loaded: Weekend overbooking operational stress",
            severity: "warning",
            outletId,
          });
        }
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage, {
        reviver: (_key, value) => {
          if (
            typeof value === "string" &&
            /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)
          ) {
            return new Date(value);
          }
          return value;
        },
      }),
      partialize: (state) => ({
        data: state.data,
        openingStocks: state.openingStocks,
        investigations: state.investigations,
        activityFeed: state.activityFeed,
        nextEventId: state.nextEventId,
        nextAlertId: state.nextAlertId,
        nextInvestigationId: state.nextInvestigationId,
      }),
      merge: (persisted, current) => {
        const revived = reviveSimulationState(
          persisted as Partial<typeof current>
        );
        if (!isValidSimulationState(revived)) {
          return { ...current, ...createInitialSnapshot(), hydrated: true };
        }
        return { ...current, ...revived };
      },
      onRehydrateStorage: () => (state) => {
        if (state) {
          if (!isValidSimulationState(state)) {
            const fresh = createInitialSnapshot();
            Object.assign(state, fresh);
          } else {
            const revived = reviveSimulationState(state);
            Object.assign(state, revived);
          }
          state.setHydrated(true);
        }
      },
    }
  )
);
