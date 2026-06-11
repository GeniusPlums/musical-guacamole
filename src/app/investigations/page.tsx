"use client";

import Link from "next/link";
import { Search, ArrowRight, AlertTriangle } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSimulationStore } from "@/store/use-simulation-store";
import { useAppStore } from "@/store/use-app-store";
import { formatCurrency, formatDateTime } from "@/lib/utils";

export default function InvestigationsPage() {
  const outletId = useAppStore((s) => s.selectedOutletId) ?? undefined;
  const cases = useSimulationStore((s) => s.investigations);
  const filtered = outletId ? cases.filter((c) => c.outletId === outletId) : cases;
  const open = filtered.filter((c) => c.status === "open");
  const resolved = filtered.filter((c) => c.status === "resolved");

  return (
    <AppShell
      title="Investigation Center"
      description="Where did my inventory go? — trace discrepancies to likely causes"
    >
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="p-5">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Open Cases</p>
              <p className="text-3xl font-semibold text-destructive mt-1">{open.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Total Loss (Open)</p>
              <p className="text-3xl font-semibold text-destructive mt-1">
                {formatCurrency(open.reduce((s, c) => s + c.lossValue, 0))}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Resolved</p>
              <p className="text-3xl font-semibold mt-1">{resolved.length}</p>
            </CardContent>
          </Card>
        </div>

        {open.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Search className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">
                No open investigations. Simulate theft, perform a stock count, or load a demo scenario.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {open.map((c) => (
              <Card key={c.id} className="border-destructive/20 hover:border-destructive/40 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{c.itemName}</h3>
                          <Badge variant="destructive" className="text-[10px]">{c.trigger.replace("_", " ")}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{c.mostLikelyCause}</p>
                        <div className="flex flex-wrap gap-3 mt-2 text-xs tabular-nums">
                          <span>Expected: <strong>{c.expectedStock}</strong></span>
                          <span>Actual: <strong>{c.actualStock}</strong></span>
                          <span className="text-destructive">Variance: <strong>{c.variance}</strong></span>
                          <span className="text-destructive">Loss: <strong>{formatCurrency(c.lossValue)}</strong></span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1">{formatDateTime(c.createdAt)}</p>
                      </div>
                    </div>
                    <Button asChild>
                      <Link href={`/investigations/${c.id}`}>
                        Investigate
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {resolved.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Resolved Cases</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {resolved.slice(0, 5).map((c) => (
                <div key={c.id} className="flex justify-between text-sm border-b border-border pb-2">
                  <span>{c.itemName}</span>
                  <span className="text-muted-foreground">{formatCurrency(c.lossValue)}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
