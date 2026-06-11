"use client";

import {
  Package,
  Moon,
  Calendar,
  Shuffle,
  Skull,
  ChefHat,
  AlertOctagon,
  ClipboardCheck,
  FileText,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSimulationStore } from "@/store/use-simulation-store";

export function QuickActions({ compact = false }: { compact?: boolean }) {
  const actions = useSimulationStore((s) => ({
    receiveDeliveryBatch: s.receiveDeliveryBatch,
    runBusyNight: s.runBusyNight,
    runWeekendRush: s.runWeekendRush,
    generateRandomSales: s.generateRandomSales,
    simulateTheft: s.simulateTheft,
    simulateKitchenWaste: s.simulateKitchenWaste,
    simulateUnauthorizedAdjustment: s.simulateUnauthorizedAdjustment,
    generateAuditReport: s.generateAuditReport,
  }));

  const buttons = [
    { label: "Receive Delivery", icon: Truck, action: actions.receiveDeliveryBatch, variant: "default" as const },
    { label: "Run Busy Night", icon: Moon, action: actions.runBusyNight },
    { label: "Weekend Rush", icon: Calendar, action: actions.runWeekendRush },
    { label: "Random Sales", icon: Shuffle, action: () => actions.generateRandomSales(10) },
    { label: "Inventory Theft", icon: Skull, action: actions.simulateTheft, variant: "destructive" as const },
    { label: "Kitchen Waste", icon: ChefHat, action: actions.simulateKitchenWaste, variant: "destructive" as const },
    { label: "Unauthorized Adj.", icon: AlertOctagon, action: actions.simulateUnauthorizedAdjustment, variant: "destructive" as const },
    { label: "Generate Audit", icon: FileText, action: () => actions.generateAuditReport() },
  ];

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        {buttons.map((b) => (
          <Button key={b.label} variant={b.variant ?? "outline"} size="sm" onClick={b.action} className="gap-1.5">
            <b.icon className="h-3.5 w-3.5" />
            {b.label}
          </Button>
        ))}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Package className="h-4 w-4" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {buttons.map((b) => (
            <Button
              key={b.label}
              variant={b.variant ?? "outline"}
              className="justify-start gap-2 h-auto py-3"
              onClick={b.action}
            >
              <b.icon className="h-4 w-4 shrink-0" />
              <span className="text-left text-xs">{b.label}</span>
            </Button>
          ))}
        </div>
        <p className="mt-3 text-[10px] text-muted-foreground flex items-center gap-1">
          <ClipboardCheck className="h-3 w-3" />
          Perform stock counts from the Stock Count page
        </p>
      </CardContent>
    </Card>
  );
}
