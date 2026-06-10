"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { EventTimeline } from "@/components/ledger/event-timeline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/store/use-app-store";
import { getEvents } from "@/lib/data/service";
import type { EventType } from "@/lib/types";

const EVENT_TYPES: { value: EventType | "all"; label: string }[] = [
  { value: "all", label: "All Events" },
  { value: "STOCK_RECEIVED", label: "Stock Received" },
  { value: "SALE", label: "Sale" },
  { value: "WASTAGE", label: "Wastage" },
  { value: "MANUAL_ADJUSTMENT", label: "Manual Adjustment" },
  { value: "TRANSFER", label: "Transfer" },
  { value: "CLOSING_COUNT", label: "Closing Count" },
];

export default function LedgerPage() {
  const { selectedOutletId } = useAppStore();
  const [eventType, setEventType] = useState<string>("all");

  let events = getEvents({
    outletId: selectedOutletId ?? undefined,
    limit: 100,
  });

  if (eventType !== "all") {
    events = events.filter((e) => e.type === eventType);
  }

  const eventCounts = EVENT_TYPES.slice(1).map((t) => ({
    type: t.label,
    count: getEvents({ outletId: selectedOutletId ?? undefined }).filter(
      (e) => e.type === t.value
    ).length,
  }));

  return (
    <AppShell
      title="Stock Movement Ledger"
      description="Immutable audit trail of every inventory action"
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <Select value={eventType} onValueChange={setEventType}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EVENT_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Badge variant="secondary">{events.length} events shown</Badge>
        </div>

        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
          {eventCounts.map((ec) => (
            <Card key={ec.type}>
              <CardContent className="p-4">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{ec.type}</p>
                <p className="mt-1 text-xl font-semibold tabular-nums">{ec.count.toLocaleString()}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <EventTimeline events={events} />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
