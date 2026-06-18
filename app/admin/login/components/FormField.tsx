import type {
  ChangeEvent,
  HTMLInputTypeAttribute,
} from "react";
import {
  Input,
  Label,
} from "@/src/components/ui";

type FormFieldProps = {
  id: string;
  label: string;
  type: HTMLInputTypeAttribute;
  value: string;
  placeholder: string;
  autoComplete: string;
  onChange: (
    event: ChangeEvent<HTMLInputElement>,
  ) => void;
};

export function FormField({
  id,
  label,
  type,
  value,
  placeholder,
  autoComplete,
  onChange,
}: FormFieldProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
      }}
    >
      <Label
        htmlFor={id}
        className=""
        style={{
          color: "rgba(255,255,255,0.6)",
          fontSize: "0.8rem",
          fontWeight: 500,
        }}
      >
        {label}
      </Label>

      <Input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        required
        placeholder={placeholder}
        autoComplete={autoComplete}
        className=""
        style={{
          width: "100%",
          padding: "0.75rem 1rem",
          borderRadius: "12px",
          border:
            "1px solid var(--color-outline-variant)",
          background:
            "var(--color-surface-container-low)",
          color: "var(--color-on-surface)",
          fontSize: "0.9rem",
          outline: "none",
          boxSizing: "border-box",
        }}
      />
    </div>
  );
}
