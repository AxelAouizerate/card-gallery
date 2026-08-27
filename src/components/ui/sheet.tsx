"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Drawer : bottom sheet en mobile, panneau lateral en desktop.
 * Primitive Radix Dialog, habillee aux couleurs du site.
 */
export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;

export const SheetContent = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & { titre: string }
>(({ className, children, titre, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:animate-in data-[state=open]:fade-in" />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed z-50 flex flex-col gap-4 border-amber-500/30 bg-[#0e0a18] shadow-2xl",
        // mobile : bottom sheet
        "inset-x-0 bottom-0 max-h-[85vh] rounded-t-2xl border-t p-5",
        // desktop : panneau lateral
        "sm:inset-y-0 sm:right-0 sm:left-auto sm:h-full sm:w-[380px] sm:max-h-none sm:rounded-none sm:border-l sm:border-t-0",
        className,
      )}
      {...props}
    >
      <div className="flex items-center justify-between">
        <DialogPrimitive.Title className="text-base font-semibold text-amber-200">
          {titre}
        </DialogPrimitive.Title>
        <DialogPrimitive.Close className="rounded-md p-1 text-amber-100/70 hover:bg-amber-500/10 hover:text-amber-100">
          <X className="h-5 w-5" />
          <span className="sr-only">Fermer</span>
        </DialogPrimitive.Close>
      </div>
      <div className="-mx-1 flex-1 overflow-y-auto px-1">{children}</div>
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
SheetContent.displayName = "SheetContent";
