import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-transparent bg-destructive text-destructive-foreground",
        outline: "text-foreground",
        safe: "border-transparent bg-risk-safe text-risk-safe-foreground",
        warning: "border-transparent bg-risk-warning text-risk-warning-foreground",
        high: "border-transparent bg-risk-high text-risk-high-foreground",
        critical: "border-transparent bg-risk-critical text-risk-critical-foreground",
        "surprise-low": "border-transparent bg-surprise-low text-white",
        "surprise-medium": "border-transparent bg-surprise-medium text-white",
        "surprise-high": "border-transparent bg-surprise-high text-white",
        duty: "border-transparent bg-leave-duty text-white",
        medical: "border-transparent bg-leave-medical text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
