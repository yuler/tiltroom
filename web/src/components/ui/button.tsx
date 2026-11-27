import { Button as BaseButton } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all outline-none select-none focus-visible:ring-2 focus-visible:ring-ring/60 disabled:pointer-events-none disabled:opacity-45 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-[#0077ed] active:scale-[0.98]",
        dark:
          "bg-[#1d1d1f] text-white shadow-xs hover:bg-[#333336] active:scale-[0.98]",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-[#dcdce3] active:scale-[0.98]",
        outline:
          "border border-border bg-white/80 text-foreground hover:bg-white active:scale-[0.98]",
        ghost:
          "text-foreground hover:bg-black/5 active:scale-[0.98]",
      },
      size: {
        sm: "h-8 px-3.5 text-xs",
        md: "h-10 px-5 text-sm",
        lg: "h-12 px-7 text-[15px]",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends ComponentPropsWithoutRef<typeof BaseButton>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <BaseButton
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { buttonVariants };
