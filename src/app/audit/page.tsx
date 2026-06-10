"use client";

import { FileText, User, Clock, Building2 } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/store/use-app-store";
import { getAuditReports, getOutlet } from "@/lib/data/service";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function AuditPage() {
  const { selectedOutletId } = useAppStore();
  const reports = getAuditReports(selectedOutletId ?? undefined);
  const latestReport = reports[0];

  if (!latestReport) {
    return (
      <AppShell title="Audit Center">
        <p className="text-muted-foreground">No audit reports available.</p>
      </AppShell>
    );
  }

  const outlet = getOutlet(latestReport.outletId);

  return (
    <AppShell
      title="Audit Center"
      description="Weekly inventory audit reports and compliance tracking"
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="secondary">
            <FileText className="mr-1 h-3 w-3" />
            Week of {formatDate(latestReport.weekStart)} — {formatDate(latestReport.weekEnd)}
          </Badge>
          {outlet && <Badge variant="outline">{outlet.name}</Badge>}
        </div>

        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Inventory Loss</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-destructive tabular-nums">
              {formatCurrency(latestReport.inventoryLoss)}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Total unaccounted inventory value this week
            </p>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Top Missing Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {latestReport.topMissingProducts.map((product, i) => (
                  <div key={product.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                        {i + 1}
                      </span>
                      <div>
                        <p className="text-sm font-medium">{product.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {product.variance} units missing
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-destructive tabular-nums">
                      {formatCurrency(product.lossValue)}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Highest Variance Shift
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold">{latestReport.highestVarianceShift}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Peak discrepancy period identified by variance engine
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Highest Variance Employee
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold">{latestReport.highestVarianceEmployee.name}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Employee ID {latestReport.highestVarianceEmployee.employeeCode}
                </p>
              </CardContent>
            </Card>

            {latestReport.outletComparison && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Outlet Comparison
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{latestReport.outletComparison.outletA.name}</span>
                      <Badge variant="destructive">
                        {latestReport.outletComparison.outletA.lossPercent.toFixed(1)}% loss
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{latestReport.outletComparison.outletB.name}</span>
                      <Badge variant="warning">
                        {latestReport.outletComparison.outletB.lossPercent.toFixed(1)}% loss
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Historical Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {reports.slice(0, 8).map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {formatDate(report.weekStart)} — {formatDate(report.weekEnd)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {getOutlet(report.outletId)?.name}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-destructive tabular-nums">
                    {formatCurrency(report.inventoryLoss)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
