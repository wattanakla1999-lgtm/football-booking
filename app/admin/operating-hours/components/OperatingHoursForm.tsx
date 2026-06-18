import type {
  FormEvent,
} from "react";

import type {
  OperatingHourField,
  OperatingHourRow as OperatingHourRowType,
} from "../types/operatingHours";

import {
  OperatingHourRow,
} from "./OperatingHourRow";

import {
  OperatingHoursFeedback,
} from "./OperatingHoursFeedback";

type OperatingHoursFormProps = {
  hours: OperatingHourRowType[];
  saving: boolean;
  message: string;
  error: string;
  onToggleClosed: (
    dayOfWeek: number,
  ) => void;
  onTimeChange: (
    dayOfWeek: number,
    field: OperatingHourField,
    value: string,
  ) => void;
  onSave: () => Promise<boolean>;
};

export function OperatingHoursForm({
  hours,
  saving,
  message,
  error,
  onToggleClosed,
  onTimeChange,
  onSave,
}: OperatingHoursFormProps) {
  const handleSubmit = (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    void onSave();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
          marginBottom: "1.5rem",
        }}
      >
        {hours.map((row : OperatingHourRowType) => (
          <OperatingHourRow
            key={row.dayOfWeek}
            row={row}
            onToggleClosed={
              onToggleClosed
            }
            onTimeChange={
              onTimeChange
            }
          />
        ))}
      </div>

      <OperatingHoursFeedback
        message={message}
        error={error}
      />

      <button
        type="submit"
        disabled={saving}
        className="admin-btn admin-btn-primary"
        style={{
          width: "100%",
          padding: "0.85rem",
          borderRadius: "12px",
          fontSize: "0.85rem",
          background:
            "linear-gradient(135deg, #6366f1, #8b5cf6)",
          boxShadow:
            "0 4px 16px rgba(99, 102, 241, 0.2)",
          cursor: saving
            ? "not-allowed"
            : "pointer",
          opacity: saving ? 0.6 : 1,
        }}
      >
        {saving
          ? "กำลังบันทึก..."
          : "💾 บันทึกเวลาเปิด-ปิดทั้งหมด"}
      </button>
    </form>
  );
}
