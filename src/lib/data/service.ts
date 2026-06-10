import { generateMockData, getOpeningStocks } from "../mock-data/generator";
import type {
  AIInsight,
  Alert,
  AuditReport,
  DashboardKPIs,
  Employee,
  InventoryItem,
  KitchenWastageItem,
  Outlet,
  StockEvent,
  TrendPoint,
  VarianceRecord,
} from "../types";
import { computeAllVariances, computeVarianceFromEvents } from "../variance-engine";

const data = generateMockData();
const openingStocks = getOpeningStocks(data.inventory);

export function getOutlets(): Outlet[] {
  return data.outlets;
}

export function getOutlet(id: string): Outlet | undefined {
  return data.outlets.find((o) => o.id === id);
}

export function getEmployees(outletId?: string): Employee[] {
  if (!outletId) return data.employees;
  return data.employees.filter((e) => e.outletId === outletId);
}

export function getEmployee(id: string): Employee | undefined {
  return data.employees.find((e) => e.id === id);
}

export function getInventory(outletId?: string): InventoryItem[] {
  if (!outletId) return data.inventory;
  return data.inventory.filter((i) => i.outletId === outletId);
}

export function getInventoryItem(id: string): InventoryItem | undefined {
  return data.inventory.find((i) => i.id === id);
}

export function getEvents(filters?: {
  outletId?: string;
  inventoryItemId?: string;
  limit?: number;
}): StockEvent[] {
  let events = [...data.events];
  if (filters?.outletId) {
    events = events.filter((e) => e.outletId === filters.outletId);
  }
  if (filters?.inventoryItemId) {
    events = events.filter((e) => e.inventoryItemId === filters.inventoryItemId);
  }
  if (filters?.limit) {
    events = events.slice(0, filters.limit);
  }
  return events;
}

export function getAlerts(outletId?: string): Alert[] {
  if (!outletId) return data.alerts;
  return data.alerts.filter((a) => a.outletId === outletId);
}

export function getKitchenWastage(outletId?: string): KitchenWastageItem[] {
  if (!outletId) return data.kitchenWastage;
  return data.kitchenWastage.filter((k) => k.outletId === outletId);
}

export function getAuditReports(outletId?: string): AuditReport[] {
  if (!outletId) return data.auditReports;
  return data.auditReports.filter((r) => r.outletId === outletId);
}

export function getAIInsights(filters?: {
  outletId?: string;
  inventoryItemId?: string;
}): AIInsight[] {
  let insights = data.aiInsights;
  if (filters?.outletId) {
    insights = insights.filter((i) => !i.outletId || i.outletId === filters.outletId);
  }
  if (filters?.inventoryItemId) {
    insights = insights.filter(
      (i) => !i.inventoryItemId || i.inventoryItemId === filters.inventoryItemId
    );
  }
  return insights;
}

export function getVariances(outletId?: string): VarianceRecord[] {
  const inventory = outletId
    ? data.inventory.filter((i) => i.outletId === outletId)
    : data.inventory;
  const events = outletId
    ? data.events.filter((e) => e.outletId === outletId)
    : data.events;
  return computeAllVariances(inventory, events, openingStocks);
}

export function getItemVariance(itemId: string): VarianceRecord | undefined {
  const item = getInventoryItem(itemId);
  if (!item) return undefined;
  const events = getEvents({ inventoryItemId: itemId });
  const opening = openingStocks.get(itemId) ?? item.currentStock;
  return computeVarianceFromEvents(item, events, opening, item.currentStock);
}

export function getItemEvents(itemId: string): StockEvent[] {
  return getEvents({ inventoryItemId: itemId });
}

export function getItemEmployees(itemId: string): Employee[] {
  const events = getEvents({ inventoryItemId: itemId });
  const empIds = [...new Set(events.map((e) => e.employeeId))];
  return empIds.map((id) => getEmployee(id)).filter(Boolean) as Employee[];
}

export function getDashboardKPIs(outletId?: string): DashboardKPIs {
  const inventory = getInventory(outletId);
  const variances = getVariances(outletId);
  const events = getEvents({ outletId });
  const kitchen = getKitchenWastage(outletId);

  const inventoryValue = inventory.reduce(
    (sum, i) => sum + i.currentStock * i.costPrice,
    0
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todaysSales = events
    .filter(
      (e) =>
        e.type === "SALE" &&
        new Date(e.timestamp) >= today
    )
    .reduce((sum, e) => {
      const item = getInventoryItem(e.inventoryItemId);
      return sum + Math.abs(e.quantity) * (item?.sellingPrice ?? 0);
    }, 0);

  const negativeVariances = variances.filter((v) => v.variance < 0);
  const inventoryVariance = negativeVariances.reduce(
    (sum, v) => sum + Math.abs(v.variance),
    0
  );
  const estimatedLosses = negativeVariances.reduce((sum, v) => sum + v.lossValue, 0);
  const wastageCost = kitchen.reduce((sum, k) => sum + k.lossValue, 0);

  return {
    inventoryValue,
    todaysSales: todaysSales || 284750,
    inventoryVariance,
    estimatedLosses,
    wastageCost,
  };
}

export function getLossTrend(outletId?: string): TrendPoint[] {
  const points: TrendPoint[] = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const base = outletId === "outlet-a" ? 12000 : 4000;
    const weekendBoost = date.getDay() === 0 || date.getDay() === 6 ? 1.8 : 1;
    points.push({
      date: date.toISOString().split("T")[0],
      value: Math.round(base * weekendBoost * (0.7 + Math.random() * 0.6)),
      label: date.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
    });
  }
  return points;
}

export function getWastageTrend(outletId?: string): TrendPoint[] {
  const points: TrendPoint[] = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const base = outletId === "outlet-a" ? 3500 : 1200;
    points.push({
      date: date.toISOString().split("T")[0],
      value: Math.round(base * (0.6 + Math.random() * 0.8)),
      label: date.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
    });
  }
  return points;
}

export function getTopMissingProducts(outletId?: string, limit = 5) {
  return getVariances(outletId)
    .filter((v) => v.variance < 0)
    .sort((a, b) => b.lossValue - a.lossValue)
    .slice(0, limit)
    .map((v) => ({
      name: v.itemName,
      variance: v.variance,
      lossValue: v.lossValue,
      category: v.category,
    }));
}

export function getOutletMetrics() {
  return data.outlets.map((outlet) => {
    const kpis = getDashboardKPIs(outlet.id);
    const variances = getVariances(outlet.id);
    const totalStock = getInventory(outlet.id).reduce((s, i) => s + i.currentStock, 0);
    const negativeVariance = variances.filter((v) => v.variance < 0);
    const lossPercent =
      totalStock > 0
        ? (negativeVariance.reduce((s, v) => s + Math.abs(v.variance), 0) / totalStock) * 100
        : 0;
    const kitchen = getKitchenWastage(outlet.id);
    const wastagePercent =
      kitchen.length > 0
        ? kitchen.reduce((s, k) => s + k.wastagePercent, 0) / kitchen.length
        : 0;

    return {
      outlet,
      revenue: kpis.todaysSales * 30,
      inventoryValue: kpis.inventoryValue,
      lossPercent,
      wastagePercent,
      alerts: getAlerts(outlet.id),
      estimatedLosses: kpis.estimatedLosses,
    };
  });
}

export function getKitchenMonthlyTrend(outletId?: string): TrendPoint[] {
  const points: TrendPoint[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now);
    date.setMonth(date.getMonth() - i);
    points.push({
      date: date.toISOString().split("T")[0],
      value: Math.round((outletId === "outlet-a" ? 45000 : 18000) * (0.8 + Math.random() * 0.4)),
      label: date.toLocaleDateString("en-IN", { month: "short" }),
    });
  }
  return points;
}
