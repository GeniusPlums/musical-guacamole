"use client";

import { Beer, Wine, Martini, Shuffle, Moon, Calendar } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { ActivityFeed } from "@/components/simulation/activity-feed";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSimulationStore } from "@/store/use-simulation-store";
import { useAppStore } from "@/store/use-app-store";
import { formatCurrency } from "@/lib/utils";

export default function ServicePage() {
  const outletId = useAppStore((s) => s.selectedOutletId) ?? undefined;
  const kpis = useSimulationStore((s) => s.getDashboardKPIs(outletId));
  const store = useSimulationStore();

  const saleButtons = [
    { label: "Sell 1 Beer", icon: Beer, action: () => store.sellBeer(1) },
    { label: "Sell 5 Beers", icon: Beer, action: () => store.sellBeer(5) },
    { label: "Sell 1 Whiskey", icon: Wine, action: () => store.sellWhiskey() },
    { label: "Sell 1 Cocktail", icon: Martini, action: () => store.sellCocktail() },
    { label: "Random Customer Order", icon: Shuffle, action: () => store.sellRandomOrder() },
  ];

  return (
    <AppShell
      title="Run Service"
      description="Simulate POS sales — stock decreases and ledger events are created instantly"
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Point of Sale Simulator</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                {saleButtons.map((b) => (
                  <Button
                    key={b.label}
                    variant="outline"
                    className="h-auto py-6 flex-col gap-2"
                    onClick={b.action}
                  >
                    <b.icon className="h-6 w-6" />
                    <span>{b.label}</span>
                  </Button>
                ))}
              </div>

              <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                <Button variant="secondary" size="sm" className="gap-2" onClick={() => store.runBusyNight()}>
                  <Moon className="h-4 w-4" />
                  Run Busy Night (25 sales)
                </Button>
                <Button variant="secondary" size="sm" className="gap-2" onClick={() => store.runWeekendRush()}>
                  <Calendar className="h-4 w-4" />
                  Weekend Rush
                </Button>
                <Button variant="secondary" size="sm" onClick={() => store.generateRandomSales(20)}>
                  Burst: 20 Random Sales
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Session Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-lg bg-muted/50 p-4 text-center">
                  <p className="text-xs text-muted-foreground">Today&apos;s Sales</p>
                  <p className="text-xl font-semibold tabular-nums mt-1">
                    {formatCurrency(kpis.todaysSales)}
                  </p>
                </div>
                <div className="rounded-lg bg-muted/50 p-4 text-center">
                  <p className="text-xs text-muted-foreground">Inventory Value</p>
                  <p className="text-xl font-semibold tabular-nums mt-1">
                    {formatCurrency(kpis.inventoryValue)}
                  </p>
                </div>
                <div className="rounded-lg bg-muted/50 p-4 text-center">
                  <p className="text-xs text-muted-foreground">Est. Losses</p>
                  <p className="text-xl font-semibold tabular-nums mt-1 text-destructive">
                    {formatCurrency(kpis.estimatedLosses)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <Badge variant="secondary" className="mb-2">Live</Badge>
              <p className="text-sm text-muted-foreground">
                Each sale creates a ledger event, reduces stock, and updates variance calculations in real time.
              </p>
            </CardContent>
          </Card>
          <ActivityFeed limit={20} />
        </div>
      </div>
    </AppShell>
  );
}
