import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/src/utils/classNames";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "danger"
  | "ghost"
  | "unstyled";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  fullWidth?: boolean;
  loading?: boolean;
  loadingLabel?: ReactNode;
};

const variantClassNames: Record<ButtonVariant, string> = {
  primary: "admin-btn admin-btn-primary",
  secondary: "admin-btn admin-btn-secondary",
  danger: "admin-btn admin-btn-danger",
  ghost: "admin-btn",
  unstyled: "",
};

export function Button({
  variant = "primary",
  fullWidth = false,
  loading = false,
  loadingLabel,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={cn(
        variantClassNames[variant],
        fullWidth && "w-full",
        className,
      )}
    >
      {loading && loadingLabel
        ? loadingLabel
        : children}
    </button>
  );
}
