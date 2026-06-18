import {
  DAY_NAMES,
} from "../constants/operatingHours";

import type {
  OperatingHourField,
  OperatingHourRow as OperatingHourRowType,
} from "../types/operatingHours";

import {
  OperatingStatusToggle,
} from "./OperatingStatusToggle";

import {
  TimeRangeInput,
} from "./TimeRangeInput";

type OperatingHourRowProps = {
  row: OperatingHourRowType;
  onToggleClosed: (
    dayOfWeek: number,
  ) => void;
  onTimeChange: (
    dayOfWeek: number,
    field: OperatingHourField,
    value: string,
  ) => void;
};

export function OperatingHourRow({
  row,
  onToggleClosed,
  onTimeChange,
}: OperatingHourRowProps) {
  const day =
    DAY_NAMES[row.dayOfWeek];

  if (!day) {
    return null;
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent:
          "space-between",
        padding: "1rem",
        borderRadius: "16px",
        background: row.isClosed
          ? "rgba(239, 68, 68, 0.02)"
          : "rgba(255,255,255,0.01)",
        border: row.isClosed
          ? "1px solid rgba(239, 68, 68, 0.08)"
          : "1px solid rgba(255,255,255,0.03)",
        flexWrap: "wrap",
        gap: "1rem",
        transition: "all 0.2s",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          minWidth: "140px",
        }}
      >
        <div
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: day.color,
          }}
        />

        <span
          style={{
            fontSize: "0.9rem",
            fontWeight: 700,
            color: "#fff",
          }}
        >
          {day.name}
        </span>
      </div>

      <OperatingStatusToggle
        dayOfWeek={row.dayOfWeek}
        isClosed={row.isClosed}
        onToggle={() =>
          onToggleClosed(
            row.dayOfWeek,
          )
        }
      />

      <TimeRangeInput
        openTime={row.openTime}
        closeTime={row.closeTime}
        disabled={row.isClosed}
        onChange={(field, value) =>
          onTimeChange(
            row.dayOfWeek,
            field,
            value,
          )
        }
      />
    </div>
  );
}
