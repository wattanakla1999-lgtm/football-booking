interface AdminBookingsEmptyStateProps {
  hasFilters: boolean;
}

export default function AdminBookingsEmptyState({
  hasFilters,
}: AdminBookingsEmptyStateProps) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.01)",
        border: "1px solid rgba(255,255,255,0.04)",
        borderRadius: "20px",
        padding: "3rem",
        textAlign: "center",
        color: "rgba(255,255,255,0.35)",
        fontSize: "0.85rem",
      }}
    >
      {hasFilters
        ? "ไม่พบรายการจองที่ตรงกับเงื่อนไข"
        : "ยังไม่มีรายการจองในระบบ"}
    </div>
  );
}
