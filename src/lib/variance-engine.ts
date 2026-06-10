import type { InventoryItem, StockEvent, VarianceRecord } from "./types";

export function calculateExpectedStock(
  openingStock: number,
  received: number,
  sold: number,
  wastage: number,
  adjustments: number = 0,
  transfers: number = 0
): number {
  return openingStock + received - sold - wastage + adjustments + transfers;
}

export function computeVarianceFromEvents(
  item: InventoryItem,
  events: StockEvent[],
  openingStock: number,
  actualStock: number
): VarianceRecord {
  const received = events
    .filter((e) => e.type === "STOCK_RECEIVED")
    .reduce((sum, e) => sum + e.quantity, 0);

  const sold = events
    .filter((e) => e.type === "SALE")
    .reduce((sum, e) => sum + Math.abs(e.quantity), 0);

  const wastage = events
    .filter((e) => e.type === "WASTAGE")
    .reduce((sum, e) => sum + Math.abs(e.quantity), 0);

  const adjustments = events
    .filter((e) => e.type === "MANUAL_ADJUSTMENT")
    .reduce((sum, e) => sum + e.quantity, 0);

  const transfers = events
    .filter((e) => e.type === "TRANSFER")
    .reduce((sum, e) => sum + e.quantity, 0);

  const expectedStock = calculateExpectedStock(
    openingStock,
    received,
    sold,
    wastage,
    adjustments,
    transfers
  );

  const variance = actualStock - expectedStock;
  const lossValue = variance < 0 ? Math.abs(variance) * item.costPrice : 0;

  return {
    inventoryItemId: item.id,
    outletId: item.outletId,
    itemName: item.name,
    category: item.category,
    sku: item.sku,
    openingStock,
    received,
    sold,
    wastage,
    expectedStock,
    actualStock,
    variance,
    lossValue,
    unit: item.unit,
    costPrice: item.costPrice,
  };
}

export function computeAllVariances(
  inventory: InventoryItem[],
  events: StockEvent[],
  openingStocks: Map<string, number>
): VarianceRecord[] {
  return inventory.map((item) => {
    const itemEvents = events.filter((e) => e.inventoryItemId === item.id);
    const opening = openingStocks.get(item.id) ?? item.currentStock;
    return computeVarianceFromEvents(item, itemEvents, opening, item.currentStock);
  });
}
