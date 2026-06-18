interface AdminBookingsHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export default function AdminBookingsHeader({
  searchQuery,
  onSearchChange,
}: AdminBookingsHeaderProps) {
  return (
    <>
      <div style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#ffffff", marginBottom: "0.25rem" }}>
          📋 รายการจองทั้งหมด
        </h2>
        <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)" }}>
          ดูและจัดการรายการจองสนามฟุตบอลทั้งหมดของระบบ
        </p>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "12px",
          padding: "0.6rem 1rem",
        }}
      >
        <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "1.1rem" }}>🔍</span>
        <input
          type="text"
          placeholder="ค้นหาชื่อลูกค้า, สนาม, เบอร์โทร..."
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          style={{
            background: "transparent",
            border: "none",
            outline: "none",
            color: "#fff",
            fontSize: "0.85rem",
            width: "100%",
          }}
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            style={{
              background: "none",
              border: "none",
              color: "rgba(255,255,255,0.4)",
              cursor: "pointer",
              fontSize: "0.85rem",
            }}
          >
            ✕
          </button>
        )}
      </div>
    </>
  );
}
