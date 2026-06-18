type OperatingStatusToggleProps = {
  dayOfWeek: number;
  isClosed: boolean;
  onToggle: () => void;
};

export function OperatingStatusToggle({
  dayOfWeek,
  isClosed,
  onToggle,
}: OperatingStatusToggleProps) {
  const inputId =
    `day-toggle-${dayOfWeek}`;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
      }}
    >
      <input
        type="checkbox"
        id={inputId}
        checked={!isClosed}
        onChange={onToggle}
        style={{
          width: "18px",
          height: "18px",
          accentColor: "#10b981",
          cursor: "pointer",
        }}
      />

      <label
        htmlFor={inputId}
        style={{
          fontSize: "0.8rem",
          color: isClosed
            ? "#ef4444"
            : "#10b981",
          fontWeight: 700,
          cursor: "pointer",
          minWidth: "80px",
        }}
      >
        {isClosed
          ? "ปิดบริการ ✕"
          : "เปิดบริการ ✓"}
      </label>
    </div>
  );
}
