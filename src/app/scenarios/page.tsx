"use client";

import { Play, Skull, ChefHat, FileSearch, Calendar } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSimulationStore } from "@/store/use-simulation-store";

const scenarios = [
  {
    id: "liquor-theft",
    title: "15 Liquor Cases Disappeared",
    description:
      "Black Dog whiskey stock silently depleted. No sale records. System flags anomaly and opens investigation.",
    icon: Skull,
    severity: "critical" as const,
  },
  {
    id: "kitchen-spoilage",
    title: "Kitchen Spoilage +40%",
    description:
      "Ingredient spoilage spikes across tomatoes, cream, and proteins. Wastage costs surge.",
    icon: ChefHat,
    severity: "warning" as const,
  },
  {
    id: "audit-mismatch",
    title: "Audit Mismatch Discovered",
    description:
      "Closing counts on whiskey SKUs reveal discrepancies. Weekly audit report auto-generated.",
    icon: FileSearch,
    severity: "critical" as const,
  },
  {
    id: "weekend-overbooking",
    title: "Weekend Overbooking Stress",
    description:
      "High-volume weekend rush drains beer inventory. Operational alerts fire for low stock.",
    icon: Calendar,
    severity: "warning" as const,
  },
];

export default function ScenariosPage() {
  const loadScenario = useSimulationStore((s) => s.loadScenario);

  return (
    <AppShell
      title="Demo Scenarios"
      description="One-click scenarios that populate the system with realistic leakage stories"
    >
      <div className="grid gap-4 md:grid-cols-2">
        {scenarios.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.id} className="relative overflow-hidden group hover:border-primary/40 transition-colors">
              <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-primary/60 to-transparent" />
              <CardHeader>
                <div className="flex items-start justify-between">
                  <Icon className="h-5 w-5 text-primary" />
                  <Badge variant={s.severity === "critical" ? "destructive" : "warning"}>
                    {s.severity}
                  </Badge>
                </div>
                <CardTitle className="text-base">{s.title}</CardTitle>
                <CardDescription>{s.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full gap-2" onClick={() => loadScenario(s.id)}>
                  <Play className="h-4 w-4" />
                  Load Scenario
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="mt-6">
        <CardContent className="p-4 text-sm text-muted-foreground">
          Scenarios modify live simulation state. Use <strong>Reset Demo</strong> in the sidebar to start fresh.
          After loading, check Command Center, Investigations, and Audit Center for results.
        </CardContent>
      </Card>
    </AppShell>
  );
}
