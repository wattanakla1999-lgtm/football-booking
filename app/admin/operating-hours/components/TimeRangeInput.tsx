import type {
  OperatingHourField,
} from "../types/operatingHours";

type TimeRangeInputProps = {
  openTime: string;
  closeTime: string;
  disabled: boolean;
  onChange: (
    field: OperatingHourField,
    value: string,
  ) => void;
};

export function TimeRangeInput({
  openTime,
  closeTime,
  disabled,
  onChange,
}: TimeRangeInputProps) {
  const textColor = disabled
    ? "rgba(255,255,255,0.2)"
    : "#fff";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
      }}
    >
      <span
        style={{
          fontSize: "0.75rem",
          color:
            "rgba(255,255,255,0.4)",
        }}
      >
        ตั้งแต่:
      </span>

      <input
        type="time"
        disabled={disabled}
        value={openTime}
        onChange={(event) =>
          onChange(
            "openTime",
            event.target.value,
          )
        }
        className="admin-input"
        style={{
          padding: "0.4rem 0.6rem",
          width: "auto",
          color: textColor,
        }}
      />

      <span
        style={{
          fontSize: "0.75rem",
          color:
            "rgba(255,255,255,0.4)",
        }}
      >
        ถึง:
      </span>

      <input
        type="time"
        disabled={disabled}
        value={closeTime}
        onChange={(event) =>
          onChange(
            "closeTime",
            event.target.value,
          )
        }
        className="admin-input"
        style={{
          padding: "0.4rem 0.6rem",
          width: "auto",
          color: textColor,
        }}
      />
    </div>
  );
}
