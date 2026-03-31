import React from "react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: { value: number; positive: boolean };
  className?: string;
}

export function StatsCard({
  title,
  value,
  description,
  icon,
  trend,
  className,
}: Readonly<StatsCardProps>) {
  return (
    <div
      className={cn("rounded-lg border border-border bg-card p-6", className)}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        {icon && <span className="text-muted-foreground">{icon}</span>}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <p className="text-2xl font-semibold text-card-foreground">{value}</p>
        {trend && (
          <span
            className={cn(
              "text-xs font-medium",
              trend.positive ? "text-success" : "text-destructive",
            )}
          >
            {trend.positive ? "+" : ""}
            {trend.value}%
          </span>
        )}
      </div>
      {description && (
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
