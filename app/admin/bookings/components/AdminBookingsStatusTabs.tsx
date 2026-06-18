import {
  FILTER_TABS,
} from "../utils/bookingConstants";

import type {
  BookingStatus,
  StatusFilter,
} from "../types/booking";

interface AdminBookingsStatusTabsProps {
  counts: Record<
    StatusFilter,
    number
  > &
    Record<BookingStatus, number>;
  statusFilter: StatusFilter;
  onStatusChange: (status: StatusFilter) => void;
}

export default function AdminBookingsStatusTabs({
  counts,
  statusFilter,
  onStatusChange,
}: AdminBookingsStatusTabsProps) {
  return (
    <div
      className="admin-scroll"
      style={{
        display: "flex",
        gap: "0.4rem",
        overflowX: "auto",
        paddingBottom: "0.25rem",
      }}
    >
      {FILTER_TABS.map((tab) => {
        const isActive = statusFilter === tab.key;
        const count = counts[tab.key];

        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onStatusChange(tab.key)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.35rem",
              padding: "0.45rem 0.85rem",
              borderRadius: "8px",
              border: isActive ? "1px solid rgba(99,102,241,0.4)" : "1px solid rgba(255,255,255,0.05)",
              background: isActive ? "rgba(99,102,241,0.1)" : "rgba(255,255,255,0.01)",
              color: isActive ? "#a5b4fc" : "rgba(255,255,255,0.5)",
              fontSize: "0.75rem",
              fontWeight: isActive ? 700 : 500,
              cursor: "pointer",
              whiteSpace: "nowrap",
              flexShrink: 0,
              transition: "all 0.2s",
            }}
          >
            {tab.label}
            <span
              style={{
                background: isActive ? "rgba(99,102,241,0.25)" : "rgba(255,255,255,0.05)",
                padding: "0.1rem 0.4rem",
                borderRadius: "6px",
                fontSize: "0.65rem",
                fontWeight: 700,
              }}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
