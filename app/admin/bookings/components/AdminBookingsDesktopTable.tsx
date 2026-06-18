import Link from "next/link";

import BookingActionsMenu from "./BookingActionsMenu";
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

interface AdminBookingsDesktopTableProps {
  bookings: Booking[];
  updating: boolean;
  actionMenuId: string | null;
  onToggleMenu: (bookingId: string) => void;
  onUpdateStatus: (
    bookingId: string,
    status: BookingStatus
  ) => Promise<void>;
}

export default function AdminBookingsDesktopTable({
  bookings,
  updating,
  actionMenuId,
  onToggleMenu,
  onUpdateStatus,
}: AdminBookingsDesktopTableProps) {
  return (
    <div
      className="hidden md:block"
      style={{
        background: "rgba(255,255,255,0.01)",
        border: "1px solid rgba(255,255,255,0.04)",
        borderRadius: "20px",
        overflow: "hidden",
      }}
    >
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
            {["ลูกค้า", "สนาม / วันที่", "เวลา", "ราคารวม", "สถานะ", "จัดการ"].map((heading) => (
              <th
                key={heading}
                style={{
                  padding: "0.85rem 1rem",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.35)",
                  textAlign: "left",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {bookings.map((booking) => {
            const firstItem = getFirstBookingItem(booking);
            const isOffline = isOfflineBooking(booking);

            return (
              <tr
                key={booking.id}
                style={{
                  borderBottom: "1px solid rgba(255,255,255,0.03)",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.background = "rgba(255,255,255,0.02)";
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.background = "transparent";
                }}
              >
                <td style={{ padding: "0.85rem 1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <BookingCustomerAvatar
                      pictureUrl={booking.user.pictureUrl}
                      displayName={booking.user.displayName}
                      isOffline={isOffline}
                    />
                    <div>
                      <p style={{ fontSize: "0.85rem", fontWeight: 700, color: "#fff" }}>
                        {booking.user.displayName}
                      </p>
                      {booking.user.phone && (
                        <p style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.35)" }}>
                          {booking.user.phone}
                        </p>
                      )}
                    </div>
                  </div>
                </td>

                <td style={{ padding: "0.85rem 1rem" }}>
                  {firstItem && (
                    <>
                      <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "#fff" }}>
                        {firstItem.court.name}
                      </p>
                      <p style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)" }}>
                        {formatThaiDate(firstItem.date)}
                      </p>
                    </>
                  )}
                </td>

                <td style={{ padding: "0.85rem 1rem" }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
                    {booking.items.map((item) => (
                      <span
                        key={item.id}
                        style={{
                          fontSize: "0.7rem",
                          fontWeight: 600,
                          padding: "0.15rem 0.45rem",
                          borderRadius: "5px",
                          background: "rgba(255,255,255,0.03)",
                          border: "1px solid rgba(255,255,255,0.06)",
                          color: "rgba(255,255,255,0.7)",
                        }}
                      >
                        {item.startTime}–{item.endTime}
                      </span>
                    ))}
                  </div>
                </td>

                <td style={{ padding: "0.85rem 1rem" }}>
                  <span style={{ fontSize: "0.9rem", fontWeight: 800, color: "#a5b4fc" }}>
                    ฿{formatBookingPrice(booking.totalPrice)}
                  </span>
                </td>

                <td style={{ padding: "0.85rem 1rem" }}>
                  <BookingStatusBadge status={booking.status} />
                </td>

                <td style={{ padding: "0.85rem 1rem", position: "relative" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <Link
                      href={`/admin/bookings/${booking.id}`}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "0.35rem 0.7rem",
                        borderRadius: "8px",
                        background: "rgba(99,102,241,0.12)",
                        border: "1px solid rgba(99,102,241,0.2)",
                        color: "#a5b4fc",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        textDecoration: "none",
                        whiteSpace: "nowrap",
                      }}
                    >
                      ดูรายละเอียด
                    </Link>

                    <BookingActionsMenu
                      booking={booking}
                      updating={updating}
                      actionMenuId={actionMenuId}
                      onToggleMenu={onToggleMenu}
                      onUpdateStatus={onUpdateStatus}
                    />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
