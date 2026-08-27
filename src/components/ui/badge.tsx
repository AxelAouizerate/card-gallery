import * as React from "react";
import { cn } from "@/lib/utils";

/** Chip de filtre actif : cliquable pour se supprimer. */
export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-amber-400/40 bg-amber-500/15 px-2.5 py-1 text-xs text-amber-100",
        className,
      )}
      {...props}
    />
  );
}
