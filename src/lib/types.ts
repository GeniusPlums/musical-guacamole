export type UserRole = "owner" | "manager";

export type InventoryCategory =
  | "Beer"
  | "Whiskey"
  | "Vodka"
  | "Rum"
  | "Gin"
  | "Kitchen Ingredients";

export type EventType =
  | "STOCK_RECEIVED"
  | "SALE"
  | "WASTAGE"
  | "MANUAL_ADJUSTMENT"
  | "TRANSFER"
  | "CLOSING_COUNT";

export type ShiftName =
  | "Morning Shift"
  | "Afternoon Shift"
  | "Evening Shift"
  | "Saturday Night Shift"
  | "Sunday Brunch Shift";

export interface Outlet {
  id: string;
  name: string;
  location: string;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  outletId: string;
  employeeCode: string;
}

export interface InventoryItem {
  id: string;
  outletId: string;
  name: string;
  category: InventoryCategory;
  sku: string;
  costPrice: number;
  sellingPrice: number;
  currentStock: number;
  reorderThreshold: number;
  unit: string;
}

export interface StockEvent {
  id: string;
  outletId: string;
  inventoryItemId: string;
  type: EventType;
  quantity: number;
  unit: string;
  reference?: string;
  employeeId: string;
  shift: ShiftName;
  timestamp: Date;
  notes?: string;
}

export interface VarianceRecord {
  inventoryItemId: string;
  outletId: string;
  itemName: string;
  category: InventoryCategory;
  sku: string;
  openingStock: number;
  received: number;
  sold: number;
  wastage: number;
  expectedStock: number;
  actualStock: number;
  variance: number;
  lossValue: number;
  unit: string;
  costPrice: number;
}

export interface Alert {
  id: string;
  outletId: string;
  severity: "critical" | "warning" | "info";
  message: string;
  timestamp: Date;
  inventoryItemId?: string;
}

export interface KitchenWastageItem {
  id: string;
  outletId: string;
  name: string;
  purchased: number;
  used: number;
  spoiled: number;
  unaccounted: number;
  unit: string;
  costPerUnit: number;
  lossValue: number;
  wastagePercent: number;
}

export interface AuditReport {
  id: string;
  weekStart: Date;
  weekEnd: Date;
  outletId: string;
  inventoryLoss: number;
  topMissingProducts: { name: string; variance: number; lossValue: number }[];
  highestVarianceShift: ShiftName;
  highestVarianceEmployee: { id: string; name: string; employeeCode: string };
  outletComparison?: {
    outletA: { name: string; lossPercent: number };
    outletB: { name: string; lossPercent: number };
  };
}

export interface DashboardKPIs {
  inventoryValue: number;
  todaysSales: number;
  inventoryVariance: number;
  estimatedLosses: number;
  wastageCost: number;
}

export interface TrendPoint {
  date: string;
  value: number;
  label?: string;
}

export interface AIInsight {
  id: string;
  inventoryItemId?: string;
  outletId?: string;
  insight: string;
  confidence: number;
  type: "pattern" | "trend" | "anomaly" | "comparison";
}

export interface AppData {
  outlets: Outlet[];
  employees: Employee[];
  inventory: InventoryItem[];
  events: StockEvent[];
  alerts: Alert[];
  kitchenWastage: KitchenWastageItem[];
  auditReports: AuditReport[];
  aiInsights: AIInsight[];
}
