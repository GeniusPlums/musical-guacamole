"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, User, AlertTriangle, CheckCircle } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { EventTimeline } from "@/components/ledger/event-timeline";
import { AIInsightPanel } from "@/components/investigation/ai-insight-panel";
import { useSimulationData, useSimulationEvents, useSimulationInvestigations } from "@/hooks/use-simulation";
import { useSimulationStore } from "@/store/use-simulation-store";
import { formatCurrency, formatNumber } from "@/lib/utils";

export default function InvestigationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const investigation = useSimulationInvestigations().find((c) => c.id === id);
  const data = useSimulationData();
  const events = useSimulationEvents({
    inventoryItemId: investigation?.inventoryItemId,
    limit: 30,
  });
  const suspicious = events.filter((e) => e.suspicious);

  const resolveCase = (caseId: string) => {
    useSimulationStore.setState((state) => ({
      investigations: state.investigations.map((c) =>
        c.id === caseId ? { ...c, status: "resolved" as const } : c
      ),
    }));
  };

  if (!investigation) {
    return (
      <AppShell title="Case Not Found">
        <Button asChild variant="outline"><Link href="/investigations">Back</Link></Button>
      </AppShell>
    );
  }

  const employees = investigation.responsibleEmployeeIds
    .map((eid) => data.employees.find((e) => e.id === eid))
    .filter(Boolean);
  const outlet = data.outlets.find((o) => o.id === investigation.outletId);

  return (
    <AppShell title="Investigation Detail" description={`${investigation.itemName}`}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button asChild variant="ghost" size="sm" className="gap-2 -ml-2">
            <Link href="/investigations"><ArrowLeft className="h-4 w-4" />Back</Link>
          </Button>
          {investigation.status === "open" && (
            <Button variant="outline" size="sm" className="gap-2" onClick={() => resolveCase(id)}>
              <CheckCircle className="h-4 w-4" />Mark Resolved
            </Button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-xl font-semibold">{investigation.itemName}</h2>
          <Badge variant={investigation.status === "open" ? "destructive" : "success"}>{investigation.status}</Badge>
          {outlet && <Badge variant="secondary">{outlet.name}</Badge>}
        </div>

        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-4">
            <p className="text-sm font-medium flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-destructive" />Most Likely Cause</p>
            <p className="mt-1 text-sm">{investigation.mostLikelyCause}</p>
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Expected", value: `${formatNumber(investigation.expectedStock)} ${investigation.unit}` },
            { label: "Actual", value: `${formatNumber(investigation.actualStock)} ${investigation.unit}` },
            { label: "Variance", value: `${investigation.variance} ${investigation.unit}`, danger: true },
            { label: "Loss", value: formatCurrency(investigation.lossValue), danger: true },
          ].map((m) => (
            <Card key={m.label}>
              <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground uppercase">{m.label}</CardTitle></CardHeader>
              <CardContent><p className={`text-2xl font-semibold ${m.danger ? "text-destructive" : ""}`}>{m.value}</p></CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader><CardTitle className="text-sm font-medium">Event Timeline</CardTitle></CardHeader>
              <CardContent><EventTimeline events={events} employees={data.employees} inventory={data.inventory} /></CardContent>
            </Card>
            {suspicious.length > 0 && (
              <Card className="border-amber-500/30">
                <CardHeader><CardTitle className="text-sm font-medium text-amber-500">Suspicious Adjustments</CardTitle></CardHeader>
                <CardContent><EventTimeline events={suspicious} employees={data.employees} inventory={data.inventory} /></CardContent>
              </Card>
            )}
          </div>
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="text-sm font-medium flex items-center gap-2"><User className="h-4 w-4" />Responsible Staff</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {employees.map((emp) => emp && (
                  <div key={emp.id} className="flex items-center gap-3">
                    <Avatar className="h-8 w-8"><AvatarFallback className="text-[10px]">{emp.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback></Avatar>
                    <div><p className="text-sm font-medium">{emp.name}</p><p className="text-[10px] text-muted-foreground">{emp.employeeCode}</p></div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <AIInsightPanel insights={investigation.analysis} />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
