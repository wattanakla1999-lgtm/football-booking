"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import AvailabilityGrid from "./components/AvailabilityGrid";
import BookedSlotModal from "./components/BookedSlotModal";
import BookingModal from "./components/BookingModal";
import DateSelector from "./components/DateSelector";
import FloatingBookingBar from "./components/FloatingBookingBar";
import LoadingSpinner from "./components/LoadingSpinner";
import StatusLegend from "./components/StatusLegend";
import {
  createAdminBooking,
  getAvailability,
} from "./services/availabilityService";

import type {
  CourtAvailability,
  SelectedBookedSlot,
  Slot,
} from "./types/availability";

import {
  createUpcomingDates,
  formatApiDate,
} from "./utils/availability";

export default function AdminAvailabilityView() {
  const [mounted, setMounted] = useState(false);
  const [selectedDate, setSelectedDate] =
    useState<Date | null>(null);

  const [courts, setCourts] = useState<
    CourtAvailability[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [selectedCourtId, setSelectedCourtId] = useState<string | null>(null);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [selectedBookedSlot, setSelectedBookedSlot] = useState<SelectedBookedSlot | null>(null);
  const dates = useMemo(() => createUpcomingDates(14), []);

  const selectedCourt = useMemo(
    () => courts.find((court) => court.id === selectedCourtId),
    [courts, selectedCourtId],
  );

  const fetchAvailability = useCallback(async () => {
    if (!selectedDate) return;

    setLoading(true);
    setMessage("");

    try {
      const data = await getAvailability(
        formatApiDate(selectedDate)
      );

      setCourts(
        Array.isArray(data.courts)
          ? data.courts
          : []
      );

      setMessage(data.message || "");

    } catch (error) {
      console.error(
        "Fetch availability error:",
        error,
      );

      setCourts([]);
      setMessage(
        "เกิดข้อผิดพลาดในการดึงข้อมูล",
      );
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    setSelectedDate(new Date());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!selectedDate) return;

    fetchAvailability();
    setSelectedCourtId(null);
    setSelectedSlots([]);
  }, [selectedDate, fetchAvailability]);

  const handleSlotClick = (
    courtId: string,
    courtName: string,
    slot: Slot,
  ) => {
    if (!slot.isAvailable) {
      setSelectedBookedSlot({
        ...slot,
        courtName,
      });
      return;
    }

    if (selectedCourtId !== courtId) {
      setSelectedCourtId(courtId);
      setSelectedSlots([slot.startTime]);
      return;
    }

    setSelectedSlots((currentSlots) => {
      const isSelected = currentSlots.includes(
        slot.startTime,
      );

      const nextSlots = isSelected
        ? currentSlots.filter(
          (time) => time !== slot.startTime,
        )
        : [...currentSlots, slot.startTime];

      if (nextSlots.length === 0) {
        setSelectedCourtId(null);
      }

      return nextSlots;
    });
  };

  const clearSelection = () => {
    setSelectedSlots([]);
    setSelectedCourtId(null);
  };

  const closeBookingModal = () => {
    setShowModal(false);
    setSubmitError("");
  };

  const resetBookingForm = () => {
    setCustomerName("");
    setCustomerPhone("");
    setSubmitError("");
    clearSelection();
  };

  const handleCreateBooking = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (
      !selectedCourtId ||
      selectedSlots.length === 0 ||
      !customerName.trim() ||
      !selectedDate
    ) {
      setSubmitError(
        "กรุณากรอกข้อมูลให้ครบถ้วน",
      );
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const courtSlots =
        selectedCourt?.slots.filter((slot) =>
          selectedSlots.includes(slot.startTime),
        ) || [];

      await createAdminBooking({
        courtId: selectedCourtId,
        date: formatApiDate(selectedDate),
        slots: courtSlots,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
      });

      alert("บันทึกการจองสำเร็จ!");

      setShowModal(false);
      resetBookingForm();

      await fetchAvailability();
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "เกิดข้อผิดพลาดในการจองสนาม"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted || !selectedDate) {
    return <LoadingSpinner fullHeight />;
  }

  return (
    <div className="relative min-h-[60vh]">
      <DateSelector
        dates={dates}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />

      {loading && <LoadingSpinner />}

      {!loading &&
        message &&
        courts.length === 0 && (
          <div className="rounded-3xl border border-white/[0.04] bg-white/[0.01] p-12 text-center text-sm text-white/35">
            {message}
          </div>
        )}

      {!loading && courts.length > 0 && (
        <AvailabilityGrid
          courts={courts}
          selectedCourtId={selectedCourtId}
          selectedSlots={selectedSlots}
          onSlotClick={handleSlotClick}
        />
      )}

      {selectedSlots.length > 0 &&
        selectedCourt && (
          <FloatingBookingBar
            courtName={selectedCourt.name}
            selectedCount={selectedSlots.length}
            onCancel={clearSelection}
            onConfirm={() =>
              setShowModal(true)
            }
          />
        )}

      {showModal && selectedCourt && (
        <BookingModal
          court={selectedCourt}
          selectedDate={selectedDate}
          selectedSlots={selectedSlots}
          customerName={customerName}
          customerPhone={customerPhone}
          submitError={submitError}
          isSubmitting={isSubmitting}
          onCustomerNameChange={
            setCustomerName
          }
          onCustomerPhoneChange={
            setCustomerPhone
          }
          onClose={closeBookingModal}
          onSubmit={handleCreateBooking}
        />
      )}

      {selectedBookedSlot && (
        <BookedSlotModal
          slot={selectedBookedSlot}
          onClose={() =>
            setSelectedBookedSlot(null)
          }
        />
      )}

      {!loading && courts.length > 0 && (
        <StatusLegend />
      )}
    </div>
  );
}