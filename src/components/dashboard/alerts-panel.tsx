import Link from "next/link";
import { AlertTriangle, Info, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Alert } from "@/lib/types";
import { formatTime } from "@/lib/utils";

const severityConfig = {
  critical: { icon: XCircle, variant: "destructive" as const, label: "Critical" },
  warning: { icon: AlertTriangle, variant: "warning" as const, label: "Warning" },
  info: { icon: Info, variant: "secondary" as const, label: "Info" },
};

export function AlertsPanel({ alerts }: { alerts: Alert[] }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Alert Center</CardTitle>
          <Badge variant="destructive">
            {alerts.filter((a) => a.severity === "critical").length} critical
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {alerts.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No active alerts</p>
        ) : (
          alerts.slice(0, 6).map((alert) => {
            const config = severityConfig[alert.severity];
            const Icon = config.icon;
            const inner = (
              <div className="flex items-start gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-accent/30">
                <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${alert.severity === "critical" ? "text-destructive" : alert.severity === "warning" ? "text-amber-500" : "text-muted-foreground"}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium leading-snug">{alert.message}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge variant={config.variant} className="text-[10px]">{config.label}</Badge>
                    <span className="text-[10px] text-muted-foreground">{formatTime(alert.timestamp)}</span>
                  </div>
                </div>
              </div>
            );
            return alert.inventoryItemId ? (
              <Link key={alert.id} href="/investigations">{inner}</Link>
            ) : (
              <div key={alert.id}>{inner}</div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
