"use client";

import { AdminRouteLoadingOverlay } from "@/src/components/common/AdminRouteLoadingOverlay";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BookingSuccessStep } from "./components/BookingSuccessStep";
import { BookingSummaryStep } from "./components/BookingSummaryStep";
import { CourtSelectionStep } from "./components/CourtSelectionStep";
import { DateTimeSelectionStep } from "./components/DateTimeSelectionStep";
import { FloatingNextButton } from "./components/FloatingNextButton";
import { useAvailability } from "./hooks/useAvailability";
import { useCourts } from "./hooks/useCourts";
import { createBooking } from "./services/bookingService";
import type {
  BookingStep,
  BookingUser,
  Court,
  TimeSlot,
} from "./types/booking";
import {
  formatApiDate,
  getBookingDates,
  isPastTimeSlot,
  validateThaiPhone,
} from "./utils/booking";

type BookingWizardProps = {
  user: BookingUser;
  initialCourts: Court[];
  initialSelection: {
    courtId: string | null;
    date: string | null;
    slotStartTimes: string[];
  };
};

export default function BookingWizard({
  user,
  initialCourts,
  initialSelection,
}: BookingWizardProps) {
  const initialCourt =
    initialCourts.find(
      (court) => court.id === initialSelection.courtId,
    ) ?? null;
  const hasInitialSlotSelection =
    Boolean(initialCourt) &&
    initialSelection.slotStartTimes.length > 0;
  const initialDate = initialSelection.date
    ? new Date(`${initialSelection.date}T00:00:00`)
    : new Date();

  const [step, setStep] = useState<BookingStep>(
    initialCourt ? 2 : 1,
  );
  const [selectedCourt, setSelectedCourt] =
    useState<Court | null>(initialCourt);
  const [selectedDate, setSelectedDate] =
    useState(() => initialDate);
  const [selectedSlots, setSelectedSlots] = useState<TimeSlot[]>([]);
  const [phone, setPhone] = useState(user.phone || "");
  const [phoneError, setPhoneError] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRouteLoading, setIsRouteLoading] =
    useState(false);
  const [successfulBookingId, setSuccessfulBookingId] =
    useState("");
  const [hasAppliedInitialSelection, setHasAppliedInitialSelection] =
    useState(false);

  const dates = useMemo(() => getBookingDates(14), []);
  const { courts, loadingCourts, courtsError } =
    useCourts(initialCourts);

  const clearSelectedSlots = useCallback(() => {
    setSelectedSlots([]);
  }, []);

  const {
    slots,
    loadingSlots,
    slotsError,
    hasLoadedSlots,
  } = useAvailability({
    step,
    selectedCourt,
    selectedDate,
    clearSelectedSlots,
  });

  useEffect(() => {
    if (
      hasAppliedInitialSelection ||
      !selectedCourt ||
      initialSelection.slotStartTimes.length === 0 ||
      !hasLoadedSlots ||
      step !== 2
    ) {
      return;
    }

    const nextSelectedSlots = slots.filter((slot) =>
      initialSelection.slotStartTimes.includes(
        slot.startTime,
      ),
    );

    if (nextSelectedSlots.length > 0) {
      setSelectedSlots(nextSelectedSlots);
      setStep(3);
    }

    setHasAppliedInitialSelection(true);
  }, [
    hasAppliedInitialSelection,
    hasLoadedSlots,
    initialSelection.slotStartTimes,
    selectedCourt,
    slots,
    step,
  ]);

  const isHydratingInitialSelection =
    hasInitialSlotSelection &&
    step === 2 &&
    !hasAppliedInitialSelection;

  const totalPrice = selectedCourt
    ? selectedSlots.length * Number(selectedCourt.pricePerHour)
    : 0;

  const selectCourt = (court: Court) => {
    setSelectedCourt(court);
    setSelectedSlots([]);
    setStep(2);
  };

  const selectDate = (date: Date) => {
    setSelectedDate(date);
    setSelectedSlots([]);
  };

  const toggleSlot = (slot: TimeSlot) => {
    if (!slot.isAvailable || isPastTimeSlot(selectedDate, slot)) return;

    setSelectedSlots((currentSlots) => {
      const alreadySelected = currentSlots.some(
        (currentSlot) => currentSlot.startTime === slot.startTime,
      );

      if (alreadySelected) {
        return currentSlots.filter(
          (currentSlot) => currentSlot.startTime !== slot.startTime,
        );
      }

      return [...currentSlots, slot].sort((a, b) =>
        a.startTime.localeCompare(b.startTime),
      );
    });
  };

  const goBackToCourts = () => {
    setSelectedCourt(null);
    setSelectedSlots([]);
    setStep(1);
  };

  const handlePhoneChange = (value: string) => {
    setPhone(value);

    if (phoneError) {
      setPhoneError("");
    }
  };

  const handleConfirm = async () => {
    if (!selectedCourt || selectedSlots.length === 0) return;

    const phoneCheck = validateThaiPhone(phone);

    if (!phoneCheck.valid) {
      setPhoneError(phoneCheck.error);
      return;
    }

    setPhoneError("");
    setIsSubmitting(true);
    setError("");

    try {
      const response = await createBooking({
        courtId: selectedCourt.id,
        date: formatApiDate(selectedDate),
        slots: selectedSlots,
        phone: phoneCheck.digits,
      });

      if (!response.bookingId) {
        throw new Error(
          "ไม่พบรหัสการจองหลังจากบันทึกสำเร็จ",
        );
      }

      setSuccessfulBookingId(response.bookingId);
      setStep(4);
      setIsSubmitting(false);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "เกิดข้อผิดพลาดในการจอง",
      );
      setIsSubmitting(false);
    }
  };

  const navigateWithLoading = (
    href: string,
  ) => {
    setIsRouteLoading(true);
    window.location.assign(href);
  };

  return (
    <>
      <div className="flex-1 flex flex-col">
      <div className="flex-1 px-6 pb-10 overflow-y-auto">
        {step === 1 && (
          <CourtSelectionStep
            user={user}
            courts={courts}
            loading={loadingCourts}
            error={courtsError}
            onSelectCourt={selectCourt}
          />
        )}

        {step === 2 &&
          selectedCourt &&
          !isHydratingInitialSelection && (
          <DateTimeSelectionStep
            court={selectedCourt}
            dates={dates}
            selectedDate={selectedDate}
            slots={slots}
            selectedSlots={selectedSlots}
            loadingSlots={loadingSlots}
            slotsError={slotsError}
            onBack={goBackToCourts}
            onSelectDate={selectDate}
            onToggleSlot={toggleSlot}
            isPastSlot={(slot) => isPastTimeSlot(selectedDate, slot)}
          />
        )}

        {step === 3 && selectedCourt && (
          <BookingSummaryStep
            court={selectedCourt}
            selectedDate={selectedDate}
            selectedSlots={selectedSlots}
            totalPrice={totalPrice}
            phone={phone}
            phoneError={phoneError}
            error={error}
            isSubmitting={isSubmitting}
            onBack={() => setStep(2)}
            onPhoneChange={handlePhoneChange}
            onConfirm={handleConfirm}
          />
        )}

        {step === 4 &&
          selectedCourt &&
          successfulBookingId && (
            <BookingSuccessStep
              bookingId={successfulBookingId}
              courtName={selectedCourt.name}
              bookingDateLabel={selectedDate.toLocaleDateString(
                "th-TH",
                {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                },
              )}
              slotLabels={selectedSlots.map(
                (slot) =>
                  `${slot.startTime.slice(0, 5)}-${slot.endTime.slice(0, 5)}`,
              )}
              totalPrice={totalPrice}
              isNavigating={isRouteLoading}
              onViewBookingDetail={() =>
                navigateWithLoading(
                  `/history?bookingId=${successfulBookingId}`,
                )
              }
              onViewHistory={() =>
                navigateWithLoading("/history")
              }
            />
          )}
      </div>

      {step === 2 && selectedSlots.length > 0 && (
        <FloatingNextButton
          selectedHours={selectedSlots.length}
          totalPrice={totalPrice}
          onClick={() => setStep(3)}
        />
      )}
      </div>

      <AdminRouteLoadingOverlay
        open={
          isSubmitting ||
          isRouteLoading ||
          isHydratingInitialSelection
        }
      />
    </>
  );
}
