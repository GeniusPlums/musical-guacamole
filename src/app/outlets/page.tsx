"use client";

import Link from "next/link";
import { Building2, AlertTriangle, ArrowRight, MapPin } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getOutletMetrics } from "@/lib/data/service";
import { formatCurrency, formatPercent } from "@/lib/utils";

export default function OutletsPage() {
  const metrics = getOutletMetrics();

  return (
    <AppShell
      title="Multi-Outlet Overview"
      description="Compare performance, losses, and alerts across locations"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        {metrics.map((m) => (
          <Card key={m.outlet.id} className="relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary to-primary/50" />
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Building2 className="h-4 w-4 text-primary" />
                    {m.outlet.name}
                  </CardTitle>
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {m.outlet.location}
                  </p>
                </div>
                {m.alerts.filter((a) => a.severity === "critical").length > 0 && (
                  <Badge variant="destructive">
                    {m.alerts.filter((a) => a.severity === "critical").length} alerts
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Monthly Revenue</p>
                  <p className="mt-1 text-lg font-semibold tabular-nums">{formatCurrency(m.revenue)}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Inventory Value</p>
                  <p className="mt-1 text-lg font-semibold tabular-nums">{formatCurrency(m.inventoryValue)}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Loss %</p>
                  <p className={`mt-1 text-lg font-semibold tabular-nums ${m.lossPercent > 2 ? "text-destructive" : ""}`}>
                    {formatPercent(m.lossPercent)}
                  </p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Wastage %</p>
                  <p className={`mt-1 text-lg font-semibold tabular-nums ${m.wastagePercent > 15 ? "text-amber-500" : ""}`}>
                    {formatPercent(m.wastagePercent)}
                  </p>
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">Active Alerts</p>
                <div className="space-y-2">
                  {m.alerts.slice(0, 3).map((alert) => (
                    <div
                      key={alert.id}
                      className="flex items-start gap-2 rounded-lg border border-border p-2.5"
                    >
                      <AlertTriangle
                        className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${
                          alert.severity === "critical" ? "text-destructive" : "text-amber-500"
                        }`}
                      />
                      <p className="text-xs leading-relaxed">{alert.message}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <p className="text-sm text-muted-foreground">
                  Est. losses: <span className="font-semibold text-destructive">{formatCurrency(m.estimatedLosses)}</span>
                </p>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/?outlet=${m.outlet.id}`}>
                    View Details
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Outlet Comparison Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground">Combined Revenue</p>
              <p className="mt-1 text-xl font-semibold">
                {formatCurrency(metrics.reduce((s, m) => s + m.revenue, 0))}
              </p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground">Combined Inventory</p>
              <p className="mt-1 text-xl font-semibold">
                {formatCurrency(metrics.reduce((s, m) => s + m.inventoryValue, 0))}
              </p>
            </div>
            <div className="text-center p-4 rounded-lg bg-destructive/10">
              <p className="text-xs text-muted-foreground">Combined Losses</p>
              <p className="mt-1 text-xl font-semibold text-destructive">
                {formatCurrency(metrics.reduce((s, m) => s + m.estimatedLosses, 0))}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
