"use client";

import Link from "next/link";
import { ArrowRight, AlertTriangle } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { KPIStrip } from "@/components/simulation/kpi-strip";
import { QuickActions } from "@/components/simulation/quick-actions";
import { ActivityFeed } from "@/components/simulation/activity-feed";
import { AlertsPanel } from "@/components/dashboard/alerts-panel";
import { AreaChart } from "@/components/charts/area-chart";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppStore } from "@/store/use-app-store";
import { useSimulationAlerts, useSimulationLossTrend, useOpenInvestigations } from "@/hooks/use-simulation";

export default function CommandCenterPage() {
  const outletId = useAppStore((s) => s.selectedOutletId) ?? undefined;
  const alerts = useSimulationAlerts(outletId);
  const lossTrend = useSimulationLossTrend(outletId);
  const openCases = useOpenInvestigations(outletId);

  return (
    <AppShell
      title="Command Center"
      description="Operate the bar simulation — every action updates inventory, variance, and accountability"
    >
      <div className="space-y-6">
        <KPIStrip />
        <QuickActions />

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <AreaChart
              title="Inventory Loss Trend"
              data={lossTrend}
              color="hsl(var(--destructive))"
            />

            {openCases.length > 0 && (
              <Card className="border-destructive/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    Open Investigations
                    <Badge variant="destructive">{openCases.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {openCases.slice(0, 4).map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between rounded-lg border border-border p-3"
                    >
                      <div>
                        <p className="text-sm font-medium">{c.itemName}</p>
                        <p className="text-xs text-muted-foreground">{c.mostLikelyCause}</p>
                      </div>
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/investigations/${c.id}`}>
                          Investigate
                          <ArrowRight className="ml-1 h-3 w-3" />
                        </Link>
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-4">
            <ActivityFeed />
            <AlertsPanel alerts={alerts} />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
