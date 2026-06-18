"use client";

import { LoadingSpinner } from "@/src/components/ui";
import { OperatingHoursForm } from "./components/OperatingHoursForm";
import { OperatingHoursHeader } from "./components/OperatingHoursHeader";
import { useOperatingHours } from "./hooks/useOperatingHours";

export default function OperatingHoursView() {
  const {
    hours,
    loading,
    saving,
    message,
    error,
    toggleClosed,
    changeTime,
    saveOperatingHours,
  } = useOperatingHours();

  return (
    <div
      style={{
        background:
          "rgba(255,255,255,0.01)",
        border:
          "1px solid rgba(255,255,255,0.04)",
        borderRadius: "24px",
        padding: "1.5rem",
      }}
    >
      <OperatingHoursHeader />

      {loading ? (
        <LoadingSpinner />
      ) : (
        <OperatingHoursForm
          hours={hours}
          saving={saving}
          message={message}
          error={error}
          onToggleClosed={toggleClosed}
          onTimeChange={changeTime}
          onSave={saveOperatingHours}
        />
      )}
    </div>
  );
}
