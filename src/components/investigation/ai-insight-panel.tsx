import { Sparkles, TrendingUp, AlertCircle, GitCompare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AIInsight } from "@/lib/types";

const typeIcons = {
  pattern: Sparkles,
  trend: TrendingUp,
  anomaly: AlertCircle,
  comparison: GitCompare,
};

export function AIInsightPanel({ insights }: { insights: AIInsight[] }) {
  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm font-medium">AI Insights</CardTitle>
          <Badge variant="secondary" className="text-[10px]">Beta</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.map((insight) => {
          const Icon = typeIcons[insight.type];
          return (
            <div
              key={insight.id}
              className="rounded-lg border border-border/50 bg-background/50 p-3"
            >
              <div className="flex items-start gap-2">
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div className="min-w-0">
                  <p className="text-sm leading-relaxed">{insight.insight}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] capitalize">
                      {insight.type}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                      {insight.confidence}% confidence
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
