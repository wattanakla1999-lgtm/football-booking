import type { ReactNode } from "react";

type EmptyStateProps = {
  title?: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <section className={className || "flex min-h-72 flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center"}>
      {icon}
      {title}
      {description}
      {action}
    </section>
  );
}
