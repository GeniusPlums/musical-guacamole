"use client";

import { Activity, AlertTriangle, Package, ShoppingCart, Search, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSimulationStore } from "@/store/use-simulation-store";
import { formatTime } from "@/lib/utils";
import type { ActivityType } from "@/lib/types";

const icons: Record<ActivityType, typeof Activity> = {
  sale: ShoppingCart,
  receive: Package,
  wastage: AlertTriangle,
  adjustment: Activity,
  theft: AlertTriangle,
  stock_count: Search,
  audit: FileText,
  scenario: Activity,
  alert: AlertTriangle,
  investigation: Search,
};

export function ActivityFeed({ limit = 12 }: { limit?: number }) {
  const feed = useSimulationStore((s) => s.activityFeed).slice(0, limit);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Live Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {feed.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No activity yet. Use quick actions to simulate operations.
          </p>
        ) : (
          <div className="space-y-2 max-h-[360px] overflow-y-auto">
            {feed.map((item) => {
              const Icon = icons[item.type] ?? Activity;
              return (
                <div
                  key={item.id}
                  className="flex items-start gap-2 rounded-lg border border-border p-2.5 text-sm"
                >
                  <Icon
                    className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${
                      item.severity === "critical"
                        ? "text-destructive"
                        : item.severity === "warning"
                          ? "text-amber-500"
                          : "text-muted-foreground"
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="leading-snug">{item.message}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground">
                        {formatTime(item.timestamp)}
                      </span>
                      {item.severity && (
                        <Badge variant={item.severity === "critical" ? "destructive" : "warning"} className="text-[10px]">
                          {item.severity}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
