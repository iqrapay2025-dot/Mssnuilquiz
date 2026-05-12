"use client";

import * as React from "react";
import { cn } from "./utils";

/**
 * VisuallyHidden component - hides content visually but keeps it accessible to screen readers
 * Used for accessibility labels that should not be visible on screen
 */
function VisuallyHidden({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("sr-only", className)}
      {...props}
    />
  );
}

export { VisuallyHidden };
