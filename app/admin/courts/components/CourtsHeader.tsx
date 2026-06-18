interface CourtsHeaderProps {
  onAddCourt: () => void;
}

export default function CourtsHeader({
  onAddCourt,
}: CourtsHeaderProps) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
      <h2 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#ffffff" }}>
        สนามบอลทั้งหมด
      </h2>
      <button
        type="button"
        onClick={onAddCourt}
        style={{
          background:
            "linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))",
          border: "none",
          borderRadius: "10px",
          color: "#fff",
          fontWeight: 700,
          fontSize: "0.85rem",
          padding: "0.55rem 1.25rem",
          cursor: "pointer",
          boxShadow: "0 4px 12px rgba(6, 199, 85, 0.25)",
          transition: "all 0.2s",
        }}
      >
        ➕ เพิ่มสนามใหม่
      </button>
    </div>
  );
}
