import { bookingStatusMeta } from "@/src/constants/statusColors";
import { Badge } from "@/src/components/ui";
import type { BookingStatus } from "@/src/types/status";
import { cn } from "@/src/utils/classNames";

type StatusBadgeProps = {
  status: BookingStatus;
  tone?: "history" | "admin" | "dashboard";
  className?: string;
  labelMode?: "label" | "shortLabel";
};

export function BookingStatusBadge({
  status,
  tone = "admin",
  className,
  labelMode = "label",
}: StatusBadgeProps) {
  const config = bookingStatusMeta[status];

  if (tone === "dashboard") {
    return (
      <Badge
        className={cn(
          "rounded-full border px-3 py-1 text-label-sm font-bold",
          status === "cancelled"
            ? "bg-error-container/20 text-error border-error/20"
            : status === "pending" || status === "paid"
              ? "bg-surface-variant/40 text-on-surface-variant border-outline-variant/20"
              : "bg-primary-container/20 text-primary border-primary/20",
          className,
        )}
      >
        {status === "paid"
          ? "รอดำเนินการ"
          : config[labelMode]}
      </Badge>
    );
  }

  return (
    <Badge
      className={cn(
        "inline-flex shrink-0 items-center gap-1 border font-bold",
        tone === "history"
          ? "rounded-lg px-2 py-1 text-[10px]"
          : "rounded-full px-2 py-0.5 text-[9px]",
        tone === "history"
          ? config.borderClassName
          : config.softClassName,
        className,
      )}
    >
      <span className="material-symbols-outlined text-[13px]">
        {config.icon}
      </span>
      <span className={tone === "history" ? "hidden xs:inline" : "hidden sm:inline"}>
        {config[labelMode]}
      </span>
    </Badge>
  );
}
