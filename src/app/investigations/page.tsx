"use client";

import Link from "next/link";
import { Search, ArrowRight, AlertTriangle } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSimulationInvestigations } from "@/hooks/use-simulation";
import { useAppStore } from "@/store/use-app-store";
import { formatCurrency, formatDateTime } from "@/lib/utils";

export default function InvestigationsPage() {
  const outletId = useAppStore((s) => s.selectedOutletId) ?? undefined;
  const allCases = useSimulationInvestigations();
  const filtered = outletId ? allCases.filter((c) => c.outletId === outletId) : allCases;
  const open = filtered.filter((c) => c.status === "open");
  const resolved = filtered.filter((c) => c.status === "resolved");

  return (
    <AppShell title="Investigation Center" description="Trace discrepancies to likely causes">
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <Card><CardContent className="p-5"><p className="text-xs uppercase text-muted-foreground">Open</p><p className="text-3xl font-semibold text-destructive mt-1">{open.length}</p></CardContent></Card>
          <Card><CardContent className="p-5"><p className="text-xs uppercase text-muted-foreground">Open Loss</p><p className="text-3xl font-semibold text-destructive mt-1">{formatCurrency(open.reduce((s, c) => s + c.lossValue, 0))}</p></CardContent></Card>
          <Card><CardContent className="p-5"><p className="text-xs uppercase text-muted-foreground">Resolved</p><p className="text-3xl font-semibold mt-1">{resolved.length}</p></CardContent></Card>
        </div>

        {open.length === 0 ? (
          <Card><CardContent className="py-12 text-center">
            <Search className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">No open investigations. Simulate theft or perform a stock count.</p>
          </CardContent></Card>
        ) : (
          <div className="space-y-3">
            {open.map((c) => (
              <Card key={c.id} className="border-destructive/20">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{c.itemName}</h3>
                          <Badge variant="destructive" className="text-[10px]">{c.trigger.replace("_", " ")}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{c.mostLikelyCause}</p>
                        <p className="text-xs mt-2 tabular-nums text-destructive">Loss: {formatCurrency(c.lossValue)} · Var: {c.variance}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">{formatDateTime(c.createdAt)}</p>
                      </div>
                    </div>
                    <Button asChild><Link href={`/investigations/${c.id}`}>Investigate<ArrowRight className="ml-1 h-4 w-4" /></Link></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
