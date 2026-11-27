import { Accordion as BaseAccordion } from "@base-ui/react/accordion";
import { ChevronDown } from "lucide-react";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

export const Accordion = BaseAccordion.Root;

export function AccordionItem({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof BaseAccordion.Item>) {
  return (
    <BaseAccordion.Item
      className={cn("border-b border-border/80 last:border-b-0", className)}
      {...props}
    />
  );
}

export function AccordionTrigger({
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<typeof BaseAccordion.Trigger>) {
  return (
    <BaseAccordion.Header>
      <BaseAccordion.Trigger
        className={cn(
          "group flex w-full items-center justify-between gap-4 py-5 text-left text-[15px] font-semibold text-foreground transition-colors hover:text-primary cursor-pointer",
          className,
        )}
        {...props}
      >
        <span>{children}</span>
        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[panel-open]:rotate-180" />
      </BaseAccordion.Trigger>
    </BaseAccordion.Header>
  );
}

export function AccordionContent({
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<typeof BaseAccordion.Panel>) {
  return (
    <BaseAccordion.Panel
      className={cn(
        "overflow-hidden text-sm leading-7 text-muted-foreground pb-5",
        className,
      )}
      {...props}
    >
      {children}
    </BaseAccordion.Panel>
  );
}
