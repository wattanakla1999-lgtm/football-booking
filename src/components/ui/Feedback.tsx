import type { CSSProperties, ReactNode } from "react";

import { feedbackColors } from "@/src/constants/statusColors";
import type { FeedbackVariant } from "@/src/types/status";

type FeedbackMessageProps = {
  children?: ReactNode;
  variant?: FeedbackVariant;
  role?: "alert" | "status";
  className?: string;
  style?: CSSProperties;
  withIcon?: boolean;
};

export function FeedbackMessage({
  children,
  variant = "error",
  role,
  className,
  style,
  withIcon = false,
}: FeedbackMessageProps) {
  if (!children) {
    return null;
  }

  const colors = feedbackColors[variant];

  return (
    <div
      role={role || (variant === "error" ? "alert" : "status")}
      className={className}
      style={{
        color: colors.text,
        fontSize: "0.8rem",
        background: colors.background,
        padding: "0.75rem",
        borderRadius: "10px",
        border: `1px solid ${colors.border}`,
        ...style,
      }}
    >
      {withIcon && variant === "error" ? "⚠️ " : null}
      {children}
    </div>
  );
}
