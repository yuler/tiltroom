import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium tracking-tight",
  {
    variants: {
      variant: {
        default: "bg-primary/10 text-primary",
        neutral: "bg-black/5 text-foreground",
        dark: "bg-[#1d1d1f] text-white",
        gold: "bg-[#1c1813] text-[#e7c27a] border border-[#e7c27a]/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
