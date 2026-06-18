import type {
  Booking,
  BookingStatus,
} from "../types/booking";

interface BookingActionsMenuProps {
  booking: Booking;
  updating: boolean;
  actionMenuId: string | null;
  onToggleMenu: (bookingId: string) => void;
  onUpdateStatus: (
    bookingId: string,
    status: BookingStatus
  ) => Promise<void>;
}

export default function BookingActionsMenu({
  booking,
  updating,
  actionMenuId,
  onToggleMenu,
  onUpdateStatus,
}: BookingActionsMenuProps) {
  const isOpen = actionMenuId === booking.id;

  return (
    <>
      <button
        type="button"
        onClick={() => onToggleMenu(booking.id)}
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "8px",
          padding: "0.35rem 0.6rem",
          cursor: "pointer",
          color: "rgba(255,255,255,0.5)",
          fontSize: "0.85rem",
        }}
      >
        ⋮
      </button>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            right: "1rem",
            top: "100%",
            zIndex: 60,
            background: "#0d1117",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "12px",
            padding: "0.35rem",
            minWidth: "160px",
            boxShadow: "0 12px 32px rgba(0,0,0,0.5)",
          }}
        >
          {booking.status !== "confirmed" && (
            <button
              type="button"
              onClick={() => onUpdateStatus(booking.id, "confirmed")}
              disabled={updating}
              style={menuBtnStyle("#10b981")}
            >
              ✅ ยืนยัน
            </button>
          )}

          {booking.status !== "completed" && booking.status !== "cancelled" && (
            <button
              type="button"
              onClick={() => onUpdateStatus(booking.id, "completed")}
              disabled={updating}
              style={menuBtnStyle("#6b7280")}
            >
              ✔️ เสร็จสิ้น
            </button>
          )}

          {booking.status !== "cancelled" && (
            <button
              type="button"
              onClick={() => onUpdateStatus(booking.id, "cancelled")}
              disabled={updating}
              style={menuBtnStyle("#ef4444")}
            >
              ❌ ยกเลิก
            </button>
          )}

          <button
            type="button"
            onClick={() => onToggleMenu(booking.id)}
            style={{
              ...menuBtnStyle("rgba(255,255,255,0.4)"),
              borderTop: "1px solid rgba(255,255,255,0.05)",
              marginTop: "0.2rem",
              paddingTop: "0.5rem",
            }}
          >
            ปิดเมนู
          </button>
        </div>
      )}
    </>
  );
}

function menuBtnStyle(color: string): React.CSSProperties {
  return {
    display: "flex",
    alignItems: "center",
    gap: "0.4rem",
    width: "100%",
    padding: "0.45rem 0.7rem",
    background: "transparent",
    border: "none",
    borderRadius: "8px",
    color,
    fontSize: "0.8rem",
    fontWeight: 600,
    cursor: "pointer",
    textAlign: "left",
    transition: "background 0.15s",
  };
}
