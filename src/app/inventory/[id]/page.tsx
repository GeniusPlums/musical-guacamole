"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, Package, Trash2, Plus } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EventTimeline } from "@/components/ledger/event-timeline";
import {
  useSimulationData,
  useSimulationEvents,
  useSimulationItemVariance,
  useSimulationInvestigations,
  useSimulationActions,
} from "@/hooks/use-simulation";
import { formatCurrency, formatNumber } from "@/lib/utils";

export default function InventoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const data = useSimulationData();
  const item = data.inventory.find((i) => i.id === id);
  const variance = useSimulationItemVariance(id);
  const events = useSimulationEvents({ inventoryItemId: id, limit: 25 });
  const investigations = useSimulationInvestigations().filter(
    (c) => c.inventoryItemId === id && c.status === "open"
  );
  const { receiveDelivery, recordWastage, manualAdjust } = useSimulationActions();

  if (!item || !variance) {
    return (
      <AppShell title="Not Found">
        <Button asChild variant="outline"><Link href="/inventory">Back</Link></Button>
      </AppShell>
    );
  }

  const outlet = data.outlets.find((o) => o.id === item.outletId);

  return (
    <AppShell title={item.name} description={`${item.sku} · ${outlet?.name}`}>
      <div className="space-y-6">
        <Button asChild variant="ghost" size="sm" className="gap-2 -ml-2">
          <Link href="/inventory"><ArrowLeft className="h-4 w-4" />Back</Link>
        </Button>

        <div className="flex flex-wrap gap-2">
          <Button size="sm" className="gap-1" onClick={() => receiveDelivery(id, 12)}><Package className="h-3 w-3" />Receive +12</Button>
          <Button size="sm" variant="outline" className="gap-1" onClick={() => manualAdjust(id, 5)}><Plus className="h-3 w-3" />Adjust +5</Button>
          <Button size="sm" variant="outline" className="gap-1" onClick={() => recordWastage(id, 1)}><Trash2 className="h-3 w-3" />Wastage -1</Button>
          <Button asChild size="sm" variant="secondary"><Link href="/stock-count">Stock Count</Link></Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-4">
          {[
            { label: "Current Stock", value: `${formatNumber(item.currentStock)} ${item.unit}` },
            { label: "Expected", value: `${formatNumber(variance.expectedStock)} ${item.unit}` },
            { label: "Variance", value: `${variance.variance} ${item.unit}`, danger: variance.variance < 0 },
            { label: "Loss", value: formatCurrency(variance.lossValue), danger: variance.lossValue > 0 },
          ].map((m) => (
            <Card key={m.label}>
              <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground uppercase">{m.label}</CardTitle></CardHeader>
              <CardContent><p className={`text-xl font-semibold ${m.danger ? "text-destructive" : ""}`}>{m.value}</p></CardContent>
            </Card>
          ))}
        </div>

        {investigations.length > 0 && (
          <Card className="border-destructive/30">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <Badge variant="destructive">Open Investigation</Badge>
                <p className="text-sm mt-1">{investigations[0].mostLikelyCause}</p>
              </div>
              <Button asChild size="sm"><Link href={`/investigations/${investigations[0].id}`}>View Case</Link></Button>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader><CardTitle className="text-sm font-medium">Event Timeline</CardTitle></CardHeader>
          <CardContent>
            <EventTimeline events={events} employees={data.employees} inventory={data.inventory} />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
