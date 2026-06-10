"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, User, AlertTriangle } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { EventTimeline } from "@/components/ledger/event-timeline";
import { AIInsightPanel } from "@/components/investigation/ai-insight-panel";
import {
  getInventoryItem,
  getItemVariance,
  getItemEvents,
  getItemEmployees,
  getAIInsights,
  getOutlet,
} from "@/lib/data/service";
import { formatCurrency, formatNumber } from "@/lib/utils";

export default function InvestigationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const item = getInventoryItem(id);
  const variance = getItemVariance(id);
  const events = getItemEvents(id).slice(0, 25);
  const employees = getItemEmployees(id);
  const insights = getAIInsights({ inventoryItemId: id });

  if (!item || !variance) {
    return (
      <AppShell title="Item Not Found">
        <p className="text-muted-foreground">Inventory item not found.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/inventory">Back to Inventory</Link>
        </Button>
      </AppShell>
    );
  }

  const outlet = getOutlet(item.outletId);

  return (
    <AppShell
      title="Variance Investigation"
      description={`Detective dashboard for ${item.name}`}
    >
      <div className="space-y-6">
        <Button asChild variant="ghost" size="sm" className="gap-2 -ml-2">
          <Link href="/inventory">
            <ArrowLeft className="h-4 w-4" />
            Back to Inventory
          </Link>
        </Button>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold">{item.name}</h2>
              <Badge variant="outline">{item.category}</Badge>
              {variance.variance < 0 && (
                <Badge variant="destructive">
                  <AlertTriangle className="mr-1 h-3 w-3" />
                  Negative Variance
                </Badge>
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {item.sku} · {outlet?.name}
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Expected Stock
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold tabular-nums">
                {formatNumber(variance.expectedStock)} {item.unit}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Actual Stock
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold tabular-nums">
                {formatNumber(variance.actualStock)} {item.unit}
              </p>
            </CardContent>
          </Card>
          <Card className={variance.variance < 0 ? "border-destructive/50" : ""}>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Variance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-semibold tabular-nums ${variance.variance < 0 ? "text-destructive" : ""}`}>
                {variance.variance > 0 ? "+" : ""}{variance.variance} {item.unit}
              </p>
            </CardContent>
          </Card>
          <Card className={variance.lossValue > 0 ? "border-destructive/50" : ""}>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Estimated Loss
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-semibold tabular-nums ${variance.lossValue > 0 ? "text-destructive" : ""}`}>
                {formatCurrency(variance.lossValue)}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Variance Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {[
                    { label: "Opening", value: variance.openingStock },
                    { label: "Received", value: `+${variance.received}` },
                    { label: "Sold", value: `-${variance.sold}` },
                    { label: "Wastage", value: `-${variance.wastage}` },
                  ].map((row) => (
                    <div key={row.label} className="rounded-lg bg-muted/50 p-3">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{row.label}</p>
                      <p className="mt-1 text-lg font-semibold tabular-nums">{row.value}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Event Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <EventTimeline events={events} />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Responsible Staff
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {employees.slice(0, 8).map((emp) => {
                  const empEvents = events.filter((e) => e.employeeId === emp.id);
                  return (
                    <div key={emp.id} className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-[10px]">
                          {emp.name.split(" ").map((n) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{emp.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {emp.role} · {emp.employeeCode} · {empEvents.length} events
                        </p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <AIInsightPanel insights={insights.length > 0 ? insights : [
              {
                id: "default",
                insight: "Insufficient data for AI analysis on this item.",
                confidence: 0,
                type: "pattern" as const,
              },
            ]} />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
