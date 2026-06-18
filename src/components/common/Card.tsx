import type { HTMLAttributes } from "react";

import { cn } from "@/src/utils/classNames";

export function Card({
  className,
  ...props
}: HTMLAttributes<HTMLElement>) {
  return (
    <section
      {...props}
      className={cn("glass-card", className)}
    />
  );
}

export function PageSection({
  className,
  ...props
}: HTMLAttributes<HTMLElement>) {
  return (
    <section
      {...props}
      className={className}
    />
  );
}
