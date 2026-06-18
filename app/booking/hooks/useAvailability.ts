"use client";

import { useEffect, useState } from "react";
import type { BookingStep, Court, TimeSlot } from "../types/booking";
import { getAvailability } from "../services/bookingService";
import { formatApiDate } from "../utils/booking";

type UseAvailabilityParams = {
  step: BookingStep;
  selectedCourt: Court | null;
  selectedDate: Date;
  clearSelectedSlots: () => void;
};

export function useAvailability({
  step,
  selectedCourt,
  selectedDate,
  clearSelectedSlots,
}: UseAvailabilityParams) {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState("");

  useEffect(() => {
    if (step !== 2 || !selectedCourt) return;

    const loadSlots = async () => {
      setLoadingSlots(true);
      setSlotsError("");
      clearSelectedSlots();

      try {
        const nextSlots = await getAvailability({
          courtId: selectedCourt.id,
          date: formatApiDate(selectedDate),
        });

        setSlots(nextSlots);
      } catch {
        setSlotsError("ไม่สามารถโหลดช่วงเวลาได้");
      } finally {
        setLoadingSlots(false);
      }
    };

    void loadSlots();
  }, [step, selectedCourt, selectedDate, clearSelectedSlots]);

  return {
    slots,
    loadingSlots,
    slotsError,
  };
}
