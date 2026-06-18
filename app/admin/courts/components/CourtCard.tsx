import { DEFAULT_COURT_IMAGE_URL } from "../hooks/useCourtForm";
import { themeColors } from "@/src/constants/themeColors";

import type { Court } from "../types/court";

interface CourtCardProps {
  court: Court;
  onEdit: (court: Court) => void;
  onDelete: (courtId: string, courtName: string) => void;
}

export default function CourtCard({
  court,
  onEdit,
  onDelete,
}: CourtCardProps) {
  const imageUrl =
    court.images[0]?.url ||
    DEFAULT_COURT_IMAGE_URL;

  return (
    <div className="admin-court-card">
      <div
        style={{
          height: "160px",
          background: `url(${imageUrl}) center/cover no-repeat`,
          position: "relative",
        }}
      >
        <span
          style={{
            position: "absolute",
            top: "0.75rem",
            right: "0.75rem",
            background: court.isActive ? themeColors.successBadge : themeColors.dangerBadge,
            color: themeColors.surfaceText,
            fontSize: "0.65rem",
            fontWeight: 700,
            padding: "0.25rem 0.6rem",
            borderRadius: "6px",
            backdropFilter: "blur(4px)",
          }}
        >
          {court.isActive ? "เปิดใช้งาน" : "ปิดใช้งาน"}
        </span>
      </div>

      <div style={{ padding: "1.25rem", flex: 1, display: "flex", flexDirection: "column" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.5rem", color: themeColors.surfaceText }}>
          {court.name}
        </h3>

        {court.description && (
          <p style={{ fontSize: "0.75rem", color: themeColors.surfaceTextMuted, marginBottom: "1rem", flex: 1 }}>
            {court.description}
          </p>
        )}

        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "1.25rem" }}>
          {court.surface && (
            <span style={tagStyle}>
              🌱 {court.surface}
            </span>
          )}

          {court.maxPlayers && (
            <span style={tagStyle}>
              👥 max {court.maxPlayers} คน
            </span>
          )}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid rgba(255,255,255,0.04)",
            paddingTop: "0.75rem",
            marginTop: "auto",
          }}
        >
          <div>
            <span style={{ fontSize: "0.65rem", color: themeColors.surfaceTextSoft, display: "block" }}>
              ราคาต่อชั่วโมง
            </span>
            <span style={{ fontSize: "1.1rem", fontWeight: 800, color: themeColors.successTextStrong }}>
              ฿{Number(court.pricePerHour).toLocaleString("th-TH")}
            </span>
          </div>

          <div style={{ display: "flex", gap: "0.4rem" }}>
            <button
              type="button"
              onClick={() => onEdit(court)}
              className="admin-btn admin-btn-secondary"
              style={{ padding: "0.4rem 0.8rem", borderRadius: "8px" }}
            >
              แก้ไข
            </button>
            <button
              type="button"
              onClick={() => onDelete(court.id, court.name)}
              className="admin-btn admin-btn-danger"
              style={{ padding: "0.4rem 0.8rem", borderRadius: "8px" }}
            >
              ลบ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const tagStyle: React.CSSProperties = {
  background: themeColors.surfaceBackgroundSoft,
  border: `1px solid ${themeColors.surfaceBorderSoft}`,
  borderRadius: "6px",
  padding: "0.2rem 0.5rem",
  fontSize: "0.65rem",
  color: "rgba(255,255,255,0.6)",
};
