import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  gradient?: boolean;
}

export function StatCard({ title, value, subtitle, icon: Icon, trend, gradient }: StatCardProps) {
  return (
    <Card className={`p-6 ${gradient ? "gradient-primary text-white" : ""} hover:shadow-card transition-all duration-200`}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className={`text-sm font-medium ${gradient ? "text-white/90" : "text-muted-foreground"}`}>{title}</p>
          <Icon className={`h-5 w-5 ${gradient ? "text-white/90" : "text-primary"}`} />
        </div>
        <div className="space-y-1">
          <p className={`text-3xl font-bold ${gradient ? "text-white" : "text-foreground"}`}>{value}</p>
          {subtitle && (
            <p className={`text-xs ${gradient ? "text-white/80" : "text-muted-foreground"}`}>{subtitle}</p>
          )}
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-xs">
            {trend === "up" && <span className="text-risk-safe">↑ Improving</span>}
            {trend === "down" && <span className="text-risk-critical">↓ Declining</span>}
            {trend === "neutral" && <span className={gradient ? "text-white/70" : "text-muted-foreground"}>→ Stable</span>}
          </div>
        )}
      </div>
    </Card>
  );
}
