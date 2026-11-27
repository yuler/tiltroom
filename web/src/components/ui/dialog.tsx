import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

export const Dialog = BaseDialog.Root;
export const DialogTrigger = BaseDialog.Trigger;
export const DialogClose = BaseDialog.Close;

export function DialogContent({
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<typeof BaseDialog.Popup>) {
  return (
    <BaseDialog.Portal>
      <BaseDialog.Backdrop className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs transition-opacity" />
      <BaseDialog.Popup
        className={cn(
          "fixed left-1/2 top-1/2 z-50 w-[min(92vw,440px)] -translate-x-1/2 -translate-y-1/2 rounded-[28px] border border-border bg-white p-7 shadow-2xl outline-none",
          className,
        )}
        {...props}
      >
        {children}
        <BaseDialog.Close
          aria-label="关闭"
          className="absolute right-5 top-5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/5 text-muted-foreground transition-colors hover:bg-black/10 hover:text-foreground cursor-pointer"
        >
          <X className="h-4 w-4" />
        </BaseDialog.Close>
      </BaseDialog.Popup>
    </BaseDialog.Portal>
  );
}

export function DialogTitle({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof BaseDialog.Title>) {
  return (
    <BaseDialog.Title
      className={cn("text-xl font-bold tracking-tight text-foreground", className)}
      {...props}
    />
  );
}

export function DialogDescription({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof BaseDialog.Description>) {
  return (
    <BaseDialog.Description
      className={cn("mt-2 text-sm leading-6 text-muted-foreground", className)}
      {...props}
    />
  );
}
