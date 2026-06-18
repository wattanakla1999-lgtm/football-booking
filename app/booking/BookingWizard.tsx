"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
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
};

export default function BookingWizard({
  user,
  initialCourts,
}: BookingWizardProps) {
  const router = useRouter();

  const [step, setStep] = useState<BookingStep>(1);
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [selectedSlots, setSelectedSlots] = useState<TimeSlot[]>([]);
  const [phone, setPhone] = useState(user.phone || "");
  const [phoneError, setPhoneError] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
  } = useAvailability({
    step,
    selectedCourt,
    selectedDate,
    clearSelectedSlots,
  });

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
      await createBooking({
        courtId: selectedCourt.id,
        date: formatApiDate(selectedDate),
        slots: selectedSlots,
        phone: phoneCheck.digits,
      });

      router.push("/history");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "เกิดข้อผิดพลาดในการจอง",
      );
      setIsSubmitting(false);
    }
  };

  return (
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

        {step === 2 && selectedCourt && (
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
      </div>

      {step === 2 && selectedSlots.length > 0 && (
        <FloatingNextButton
          selectedHours={selectedSlots.length}
          totalPrice={totalPrice}
          onClick={() => setStep(3)}
        />
      )}
    </div>
  );
}
