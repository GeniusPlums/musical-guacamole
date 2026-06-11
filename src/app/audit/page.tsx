"use client";

import { FileText, User, Clock, Building2, Download, Plus } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/use-app-store";
import { useSimulationData, useSimulationActions } from "@/hooks/use-simulation";
import { exportAuditToPdf } from "@/lib/audit/generator";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function AuditPage() {
  const outletId = useAppStore((s) => s.selectedOutletId) ?? undefined;
  const data = useSimulationData();
  const { generateAuditReport } = useSimulationActions();
  const reports = outletId ? data.auditReports.filter((r) => r.outletId === outletId) : data.auditReports;
  const latestReport = reports[0];
  const outlet = latestReport ? data.outlets.find((o) => o.id === latestReport.outletId) : undefined;

  return (
    <AppShell title="Audit Center" description="Generate and export weekly audit reports from live data">
      <div className="space-y-6">
        <div className="flex flex-wrap gap-3">
          <Button className="gap-2" onClick={() => generateAuditReport(outletId)}><Plus className="h-4 w-4" />Generate Audit Report</Button>
          {latestReport && outlet && (
            <Button variant="outline" className="gap-2" onClick={() => exportAuditToPdf(latestReport, outlet.name)}>
              <Download className="h-4 w-4" />Export to PDF
            </Button>
          )}
        </div>

        {!latestReport ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">No reports yet. Generate one from live data.</CardContent></Card>
        ) : (
          <>
            <div className="flex gap-3">
              <Badge variant="secondary"><FileText className="mr-1 h-3 w-3" />{formatDate(latestReport.weekStart)} — {formatDate(latestReport.weekEnd)}</Badge>
              {outlet && <Badge variant="outline">{outlet.name}</Badge>}
            </div>
            <Card className="border-destructive/30">
              <CardHeader><CardTitle className="text-sm">Inventory Loss</CardTitle></CardHeader>
              <CardContent><p className="text-4xl font-bold text-destructive">{formatCurrency(latestReport.inventoryLoss)}</p></CardContent>
            </Card>
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader><CardTitle className="text-sm">Top Missing Products</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {latestReport.topMissingProducts.map((p, i) => (
                    <div key={p.name} className="flex justify-between">
                      <span className="text-sm">{i + 1}. {p.name} ({p.variance})</span>
                      <span className="text-sm font-semibold text-destructive">{formatCurrency(p.lossValue)}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
              <div className="space-y-4">
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Clock className="h-4 w-4" />Highest Variance Shift</CardTitle></CardHeader><CardContent><p className="text-lg font-semibold">{latestReport.highestVarianceShift}</p></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><User className="h-4 w-4" />Highest Variance Employee</CardTitle></CardHeader><CardContent><p className="text-lg font-semibold">{latestReport.highestVarianceEmployee.name}</p><p className="text-xs text-muted-foreground">{latestReport.highestVarianceEmployee.employeeCode}</p></CardContent></Card>
                {latestReport.outletComparison && (
                  <Card><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Building2 className="h-4 w-4" />Outlet Comparison</CardTitle></CardHeader><CardContent className="space-y-2">
                    <div className="flex justify-between"><span>{latestReport.outletComparison.outletA.name}</span><Badge variant="destructive">{latestReport.outletComparison.outletA.lossPercent.toFixed(1)}%</Badge></div>
                    <div className="flex justify-between"><span>{latestReport.outletComparison.outletB.name}</span><Badge variant="warning">{latestReport.outletComparison.outletB.lossPercent.toFixed(1)}%</Badge></div>
                  </CardContent></Card>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
