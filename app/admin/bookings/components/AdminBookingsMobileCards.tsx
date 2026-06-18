import Link from "next/link";

import BookingCustomerAvatar from "./BookingCustomerAvatar";
import BookingStatusBadge from "./BookingStatusBadge";
import {
  formatBookingPrice,
  formatThaiDate,
  getFirstBookingItem,
  isOfflineBooking,
} from "../utils/bookingHelpers";

import type {
  Booking,
  BookingStatus,
} from "../types/booking";

interface AdminBookingsMobileCardsProps {
  bookings: Booking[];
  expandedId: string | null;
  updating: boolean;
  onToggleExpanded: (bookingId: string) => void;
  onUpdateStatus: (
    bookingId: string,
    status: BookingStatus
  ) => Promise<void>;
}

export default function AdminBookingsMobileCards({
  bookings,
  expandedId,
  updating,
  onToggleExpanded,
  onUpdateStatus,
}: AdminBookingsMobileCardsProps) {
  return (
    <div className="md:hidden" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      {bookings.map((booking) => {
        const firstItem = getFirstBookingItem(booking);
        const isOffline = isOfflineBooking(booking);
        const isExpanded = expandedId === booking.id;

        return (
          <div
            key={booking.id}
            style={{
              background: "rgba(255,255,255,0.01)",
              border: "1px solid rgba(255,255,255,0.04)",
              borderRadius: "16px",
              overflow: "hidden",
            }}
          >
            <button
              type="button"
              onClick={() => onToggleExpanded(booking.id)}
              style={{
                width: "100%",
                padding: "1rem",
                background: "none",
                border: "none",
                color: "inherit",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "0.5rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <BookingCustomerAvatar
                    pictureUrl={booking.user.pictureUrl}
                    displayName={booking.user.displayName}
                    isOffline={isOffline}
                    size={32}
                    radius="8px"
                    fontSize="0.75rem"
                  />
                  <div>
                    <p style={{ fontSize: "0.85rem", fontWeight: 700, color: "#fff" }}>
                      {booking.user.displayName}
                    </p>
                    {firstItem && (
                      <p style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)" }}>
                        {firstItem.court.name} · {formatThaiDate(firstItem.date)}
                      </p>
                    )}
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.25rem" }}>
                  <BookingStatusBadge
                    status={booking.status}
                    dotSize="5px"
                    padding="0.2rem 0.5rem"
                    fontSize="0.65rem"
                    gap="0.25rem"
                  />
                  <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "#a5b4fc" }}>
                    ฿{formatBookingPrice(booking.totalPrice)}
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem" }}>
                {booking.items.map((item) => (
                  <span
                    key={item.id}
                    style={{
                      fontSize: "0.65rem",
                      fontWeight: 600,
                      padding: "0.15rem 0.4rem",
                      borderRadius: "5px",
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      color: "rgba(255,255,255,0.6)",
                    }}
                  >
                    {item.startTime}–{item.endTime}
                  </span>
                ))}
              </div>
            </button>

            {isExpanded && (
              <div
                style={{
                  borderTop: "1px solid rgba(255,255,255,0.04)",
                  padding: "0.75rem 1rem",
                  display: "flex",
                  gap: "0.4rem",
                  flexWrap: "wrap",
                }}
              >
                {booking.user.phone && (
                  <span
                    style={{
                      fontSize: "0.7rem",
                      color: "rgba(255,255,255,0.45)",
                      padding: "0.3rem 0.6rem",
                      background: "rgba(255,255,255,0.02)",
                      borderRadius: "6px",
                      border: "1px solid rgba(255,255,255,0.04)",
                    }}
                  >
                    📞 {booking.user.phone}
                  </span>
                )}

                {booking.notes && (
                  <span
                    style={{
                      fontSize: "0.7rem",
                      color: "rgba(255,255,255,0.45)",
                      padding: "0.3rem 0.6rem",
                      background: "rgba(255,255,255,0.02)",
                      borderRadius: "6px",
                      border: "1px solid rgba(255,255,255,0.04)",
                      width: "100%",
                    }}
                  >
                    📝 {booking.notes}
                  </span>
                )}

                <div style={{ display: "flex", gap: "0.4rem", width: "100%", marginTop: "0.35rem" }}>
                  <Link
                    href={`/admin/bookings/${booking.id}`}
                    style={{
                      ...mobileActionStyle("rgba(99,102,241,0.12)", "#a5b4fc"),
                      textAlign: "center",
                      textDecoration: "none",
                    }}
                  >
                    🔎 ดูรายละเอียด
                  </Link>

                  {booking.status !== "confirmed" && (
                    <button
                      type="button"
                      onClick={() => onUpdateStatus(booking.id, "confirmed")}
                      disabled={updating}
                      style={mobileActionStyle("rgba(16,185,129,0.1)", "#34d399")}
                    >
                      ✅ ยืนยัน
                    </button>
                  )}

                  {booking.status !== "completed" && booking.status !== "cancelled" && (
                    <button
                      type="button"
                      onClick={() => onUpdateStatus(booking.id, "completed")}
                      disabled={updating}
                      style={mobileActionStyle("rgba(107,114,128,0.1)", "#9ca3af")}
                    >
                      ✔️ เสร็จสิ้น
                    </button>
                  )}

                  {booking.status !== "cancelled" && (
                    <button
                      type="button"
                      onClick={() => onUpdateStatus(booking.id, "cancelled")}
                      disabled={updating}
                      style={mobileActionStyle("rgba(239,68,68,0.08)", "#f87171")}
                    >
                      ❌ ยกเลิก
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function mobileActionStyle(background: string, color: string): React.CSSProperties {
  return {
    flex: 1,
    padding: "0.5rem",
    borderRadius: "8px",
    border: "none",
    background,
    color,
    fontSize: "0.75rem",
    fontWeight: 700,
    cursor: "pointer",
  };
}
