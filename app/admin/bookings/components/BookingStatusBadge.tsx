import { STATUS_CONFIG } from "../utils/bookingConstants";

import type { BookingStatus } from "../types/booking";

interface BookingStatusBadgeProps {
  status: BookingStatus;
  dotSize?: string;
  padding?: string;
  fontSize?: string;
  gap?: string;
}

export default function BookingStatusBadge({
  status,
  dotSize = "6px",
  padding = "0.25rem 0.65rem",
  fontSize = "0.7rem",
  gap = "0.3rem",
}: BookingStatusBadgeProps) {
  const statusConfig = STATUS_CONFIG[status];

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap,
        padding,
        borderRadius: "6px",
        fontSize,
        fontWeight: 700,
        background: statusConfig.bgColor,
        color: statusConfig.textColor,
      }}
    >
      <span
        style={{
          width: dotSize,
          height: dotSize,
          borderRadius: "50%",
          background: statusConfig.dotColor,
        }}
      />
      {statusConfig.label}
    </span>
  );
}
