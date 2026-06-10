import { type LucideIcon, TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn, formatCurrency, formatNumber } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: number;
  format?: "currency" | "number" | "percent";
  change?: number;
  icon: LucideIcon;
  variant?: "default" | "danger" | "warning";
}

export function KPICard({
  title,
  value,
  format = "currency",
  change,
  icon: Icon,
  variant = "default",
}: KPICardProps) {
  const formatted =
    format === "currency"
      ? formatCurrency(value)
      : format === "percent"
        ? `${value.toFixed(1)}%`
        : formatNumber(value);

  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {title}
            </p>
            <p
              className={cn(
                "text-2xl font-semibold tabular-nums tracking-tight",
                variant === "danger" && "text-destructive",
                variant === "warning" && "text-amber-500"
              )}
            >
              {formatted}
            </p>
            {change !== undefined && (
              <div className="flex items-center gap-1 text-xs">
                {change >= 0 ? (
                  <TrendingUp className="h-3 w-3 text-emerald-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-destructive" />
                )}
                <span className={change >= 0 ? "text-emerald-500" : "text-destructive"}>
                  {Math.abs(change).toFixed(1)}%
                </span>
                <span className="text-muted-foreground">vs last week</span>
              </div>
            )}
          </div>
          <div
            className={cn(
              "rounded-lg p-2.5",
              variant === "danger" ? "bg-destructive/10" : "bg-muted"
            )}
          >
            <Icon
              className={cn(
                "h-4 w-4",
                variant === "danger" ? "text-destructive" : "text-muted-foreground"
              )}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
