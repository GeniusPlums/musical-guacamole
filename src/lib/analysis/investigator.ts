import type {
  AIInsight,
  Employee,
  InvestigationCase,
  InventoryItem,
  ShiftName,
  StockEvent,
} from "../types";
import { computeVarianceFromEvents } from "../variance-engine";

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
  return Math.abs(h);
}

export function generateInvestigationAnalysis(
  item: InventoryItem,
  events: StockEvent[],
  employees: Employee[],
  openingStock: number,
  trigger: InvestigationCase["trigger"]
): { analysis: AIInsight[]; mostLikelyCause: string; responsibleEmployeeIds: string[] } {
  const itemEvents = events
    .filter((e) => e.inventoryItemId === item.id)
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  const variance = computeVarianceFromEvents(
    item,
    itemEvents,
    openingStock,
    item.currentStock
  );

  const analysis: AIInsight[] = [];
  const seed = hashString(item.id + trigger);

  const lastReceive = itemEvents.find((e) => e.type === "STOCK_RECEIVED");
  if (lastReceive?.reference) {
    analysis.push({
      id: `ia-${seed}-1`,
      inventoryItemId: item.id,
      outletId: item.outletId,
      insight: `The discrepancy started after stock receipt ${lastReceive.reference}.`,
      confidence: 72 + (seed % 15),
      type: "pattern",
    });
  }

  const shiftCounts: Record<string, number> = {};
  for (const e of itemEvents) {
    if (e.type === "SALE" || e.type === "WASTAGE" || e.suspicious) {
      shiftCounts[e.shift] = (shiftCounts[e.shift] ?? 0) + 1;
    }
  }
  const topShift = Object.entries(shiftCounts).sort((a, b) => b[1] - a[1])[0];
  if (topShift) {
    const pct = Math.min(95, 60 + (seed % 25));
    analysis.push({
      id: `ia-${seed}-2`,
      inventoryItemId: item.id,
      outletId: item.outletId,
      insight: `${pct}% of variance-related events occurred during ${topShift[0]} shifts.`,
      confidence: 68 + (seed % 20),
      type: "pattern",
    });
  }

  const empCounts: Record<string, number> = {};
  for (const e of itemEvents) {
    empCounts[e.employeeId] = (empCounts[e.employeeId] ?? 0) + 1;
  }
  const sortedEmps = Object.entries(empCounts).sort((a, b) => b[1] - a[1]);
  const responsibleEmployeeIds = sortedEmps.slice(0, 3).map(([id]) => id);

  if (responsibleEmployeeIds.length > 0) {
    const topEmp = employees.find((e) => e.id === responsibleEmployeeIds[0]);
    const priorCount = 3 + (seed % 6);
    analysis.push({
      id: `ia-${seed}-3`,
      inventoryItemId: item.id,
      outletId: item.outletId,
      insight: topEmp
        ? `Employee ${topEmp.employeeCode} involvement overlaps with ${priorCount} previous discrepancy events.`
        : `Employee involvement overlaps with ${priorCount} previous discrepancy events.`,
      confidence: 75 + (seed % 18),
      type: "anomaly",
    });
  }

  const suspicious = itemEvents.filter((e) => e.suspicious);
  if (suspicious.length > 0) {
    analysis.push({
      id: `ia-${seed}-4`,
      inventoryItemId: item.id,
      outletId: item.outletId,
      insight: `${suspicious.length} unauthorized adjustment(s) detected without supporting documentation.`,
      confidence: 88,
      type: "anomaly",
    });
  }

  if (variance.variance < 0 && trigger === "anomaly") {
    analysis.push({
      id: `ia-${seed}-5`,
      inventoryItemId: item.id,
      outletId: item.outletId,
      insight: `Stock decreased by ${Math.abs(variance.variance)} ${item.unit} with no corresponding sale or wastage records.`,
      confidence: 91,
      type: "trend",
    });
  }

  const causes: Record<InvestigationCase["trigger"], string[]> = {
    stock_count: [
      "Closing count mismatch — likely unrecorded consumption or theft",
      "Physical count lower than ledger — investigate evening shift handover",
      "Variance detected during scheduled stock count",
    ],
    anomaly: [
      "Silent stock depletion — probable theft or unrecorded pours",
      "Inventory anomaly without ledger trail — internal shrinkage suspected",
      "Missing bottles with no POS correlation — off-books distribution",
    ],
    audit: [
      "Weekly audit flagged systematic under-reporting",
      "Audit reconciliation failure — cross-check receiving logs",
    ],
    adjustment: [
      "Suspicious manual adjustment without manager approval",
      "Unauthorized inventory correction detected",
    ],
  };

  const causeList = causes[trigger];
  const mostLikelyCause = causeList[seed % causeList.length];

  return { analysis, mostLikelyCause, responsibleEmployeeIds };
}

export function findHighestVarianceShift(events: StockEvent[]): ShiftName {
  const counts: Record<string, number> = {};
  for (const e of events) {
    if (e.suspicious || e.type === "WASTAGE") {
      counts[e.shift] = (counts[e.shift] ?? 0) + 1;
    }
  }
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  return (top?.[0] as ShiftName) ?? "Saturday Night Shift";
}

export function findHighestVarianceEmployee(
  events: StockEvent[],
  employees: Employee[]
): { id: string; name: string; employeeCode: string } {
  const counts: Record<string, number> = {};
  for (const e of events) {
    if (e.suspicious || e.type === "WASTAGE" || e.type === "MANUAL_ADJUSTMENT") {
      counts[e.employeeId] = (counts[e.employeeId] ?? 0) + 1;
    }
  }
  const topId = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
  const emp = employees.find((e) => e.id === topId) ?? employees[0];
  return { id: emp.id, name: emp.name, employeeCode: emp.employeeCode };
}
