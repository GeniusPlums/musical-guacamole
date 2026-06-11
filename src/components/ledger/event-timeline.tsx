import {
  ArrowDownLeft,
  ArrowUpRight,
  Minus,
  Package,
  ShoppingCart,
  Trash2,
  ArrowLeftRight,
  ClipboardCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Employee, InventoryItem, StockEvent } from "@/lib/types";
import { formatTime } from "@/lib/utils";

const eventConfig = {
  STOCK_RECEIVED: { icon: Package, label: "Stock Received", color: "text-emerald-500" },
  SALE: { icon: ShoppingCart, label: "Sale", color: "text-blue-500" },
  WASTAGE: { icon: Trash2, label: "Wastage", color: "text-amber-500" },
  MANUAL_ADJUSTMENT: { icon: Minus, label: "Manual Adjustment", color: "text-purple-500" },
  TRANSFER: { icon: ArrowLeftRight, label: "Transfer", color: "text-cyan-500" },
  CLOSING_COUNT: { icon: ClipboardCheck, label: "Closing Count", color: "text-muted-foreground" },
};

export function EventTimeline({
  events,
  employees,
  inventory,
}: {
  events: StockEvent[];
  employees: Employee[];
  inventory: InventoryItem[];
}) {
  return (
    <div className="relative space-y-0">
      <div className="absolute left-[19px] top-2 bottom-2 w-px bg-border" />
      {events.map((event) => {
        const config = eventConfig[event.type];
        const Icon = config.icon;
        const employee = employees.find((e) => e.id === event.employeeId);
        const item = inventory.find((i) => i.id === event.inventoryItemId);
        const isPositive = event.quantity > 0;

        return (
          <div key={event.id} className="relative flex gap-4 pb-6 last:pb-0">
            <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-background">
              <Icon className={`h-4 w-4 ${config.color}`} />
            </div>
            <div className="min-w-0 flex-1 pt-1">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium">
                    {config.label}
                    {event.suspicious && (
                      <Badge variant="destructive" className="ml-2 text-[10px]">Suspicious</Badge>
                    )}
                  </p>
                  {event.reference && (
                    <p className="text-xs text-muted-foreground">{event.reference}</p>
                  )}
                  {item && <p className="text-xs text-muted-foreground">{item.name}</p>}
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">{formatTime(event.timestamp)}</p>
                  {event.quantity !== 0 && (
                    <p className={`text-sm font-semibold tabular-nums ${isPositive ? "text-emerald-500" : "text-destructive"}`}>
                      {isPositive ? (
                        <span className="inline-flex items-center gap-0.5">
                          <ArrowUpRight className="h-3 w-3" />+{event.quantity}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-0.5">
                          <ArrowDownLeft className="h-3 w-3" />{event.quantity}
                        </span>
                      )}{" "}
                      {event.unit}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="text-[10px]">{event.shift}</Badge>
                {employee && (
                  <Badge variant="secondary" className="text-[10px]">
                    {employee.name} ({employee.employeeCode})
                  </Badge>
                )}
                {event.notes && (
                  <span className="text-[10px] text-muted-foreground">{event.notes}</span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
