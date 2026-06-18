import type { CSSProperties, ReactNode } from "react";

import { cn } from "@/src/utils/classNames";

type BadgeProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};

export function Badge({
  children,
  className,
  style,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap border font-bold",
        className,
      )}
      style={style}
    >
      {children}
    </span>
  );
}
