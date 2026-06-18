"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import { searchAdminCustomers } from "@/src/services/adminCustomers";
import AvailabilityGrid from "./components/AvailabilityGrid";
import BookedSlotModal from "./components/BookedSlotModal";
import BookingModal from "./components/BookingModal";
import DateSelector from "./components/DateSelector";
import FloatingBookingBar from "./components/FloatingBookingBar";
import StatusLegend from "./components/StatusLegend";
import {
  createAdminBooking,
  getAvailability,
} from "./services/availabilityService";
import type {
  CourtAvailability,
  CustomerMode,
  CustomerSearchItem,
  ManualBookingStatus,
  ManualPaymentStatus,
  SelectedBookedSlot,
  Slot,
} from "./types/availability";
import {
  createUpcomingDates,
  formatApiDate,
} from "./utils/availability";

const CUSTOMER_SEARCH_MIN_LENGTH = 2;

type AdminAvailabilityViewProps = {
  initialSelectedDate: string;
  initialCourts: CourtAvailability[];
  initialMessage: string;
};

export default function AdminAvailabilityView({
  initialSelectedDate,
  initialCourts,
  initialMessage,
}: AdminAvailabilityViewProps) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] =
    useState<Date | null>(
      new Date(initialSelectedDate),
    );
  const [courts, setCourts] = useState<
    CourtAvailability[]
  >(initialCourts);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] =
    useState(initialMessage);
  const [selectedCourtId, setSelectedCourtId] =
    useState<string | null>(null);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [customerMode, setCustomerMode] =
    useState<CustomerMode>("existing");
  const [customerSearchQuery, setCustomerSearchQuery] =
    useState("");
  const [customerResults, setCustomerResults] =
    useState<CustomerSearchItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerSearchItem | null>(null);
  const [searchingCustomers, setSearchingCustomers] =
    useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [bookingStatus, setBookingStatus] =
    useState<ManualBookingStatus>("confirmed");
  const [paymentStatus, setPaymentStatus] =
    useState<ManualPaymentStatus>("unpaid");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [selectedBookedSlot, setSelectedBookedSlot] =
    useState<SelectedBookedSlot | null>(null);
  const dates = useMemo(() => createUpcomingDates(14), []);
  const hasHydratedInitialData = useRef(
    Boolean(initialSelectedDate),
  );

  const selectedCourt = useMemo(
    () => courts.find((court) => court.id === selectedCourtId),
    [courts, selectedCourtId],
  );

  const selectedCourtSlots = useMemo(
    () =>
      selectedCourt?.slots.filter((slot) =>
        selectedSlots.includes(slot.startTime),
      ) || [],
    [selectedCourt, selectedSlots],
  );

  const fetchAvailability = useCallback(async () => {
    if (!selectedDate) {
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const data = await getAvailability(
        formatApiDate(selectedDate),
      );

      setCourts(
        Array.isArray(data.courts)
          ? data.courts
          : [],
      );
      setMessage(data.message || "");
    } catch (error) {
      console.error(
        "Fetch availability error:",
        error,
      );

      setCourts([]);
      setMessage("เกิดข้อผิดพลาดในการดึงข้อมูล");
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    if (!selectedDate) {
      return;
    }

    if (hasHydratedInitialData.current) {
      hasHydratedInitialData.current = false;
      return;
    }

    queueMicrotask(() => {
      void fetchAvailability();
      setSelectedCourtId(null);
      setSelectedSlots([]);
    });
  }, [
    fetchAvailability,
    selectedDate,
  ]);

  useEffect(() => {
    if (
      !showModal ||
      customerMode !== "existing"
    ) {
      return;
    }

    const query = customerSearchQuery.trim();

    if (query.length < CUSTOMER_SEARCH_MIN_LENGTH) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setSearchingCustomers(true);

      void searchAdminCustomers(query)
        .then((customers) => {
          setCustomerResults(customers);
        })
        .catch((error) => {
          console.error(
            "Search customers error:",
            error,
          );
          setCustomerResults([]);
        })
        .finally(() => {
          setSearchingCustomers(false);
        });
    }, 250);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [
    customerMode,
    customerSearchQuery,
    showModal,
  ]);

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

  const resetBookingForm = useCallback(() => {
    setCustomerMode("existing");
    setCustomerSearchQuery("");
    setCustomerResults([]);
    setSelectedCustomer(null);
    setSearchingCustomers(false);
    setCustomerName("");
    setCustomerPhone("");
    setBookingStatus("confirmed");
    setPaymentStatus("unpaid");
    setSubmitError("");
  }, []);

  const closeBookingModal = () => {
    setShowModal(false);
    setSubmitError("");
  };

  const selectExistingCustomer = (
    customer: CustomerSearchItem,
  ) => {
    setSelectedCustomer(customer);
    setCustomerSearchQuery(customer.displayName);
    setCustomerName(customer.displayName);
    setCustomerPhone(customer.phone || "");
    setSubmitError("");
  };

  const handleCustomerSearchChange = (
    value: string,
  ) => {
    setCustomerSearchQuery(value);

    if (
      value.trim().length <
      CUSTOMER_SEARCH_MIN_LENGTH
    ) {
      setCustomerResults([]);
      setSearchingCustomers(false);
    }

    if (
      selectedCustomer &&
      value !== selectedCustomer.displayName
    ) {
      setSelectedCustomer(null);
      setCustomerName("");
      setCustomerPhone("");
    }
  };

  const handleCustomerModeChange = (
    mode: CustomerMode,
  ) => {
    setCustomerMode(mode);
    setSubmitError("");

    if (mode === "existing") {
      setCustomerSearchQuery("");
      setCustomerResults([]);
      setSelectedCustomer(null);
      setCustomerName("");
      setCustomerPhone("");
    } else {
      setCustomerSearchQuery("");
      setCustomerResults([]);
      setSelectedCustomer(null);
      setCustomerName("");
      setCustomerPhone("");
    }
  };

  const handleCreateBooking = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (
      !selectedCourtId ||
      selectedSlots.length === 0 ||
      !selectedDate
    ) {
      setSubmitError("กรุณาเลือกสนาม วันที่ และช่วงเวลา");
      return;
    }

    if (
      customerMode === "existing" &&
      !selectedCustomer
    ) {
      setSubmitError("กรุณาเลือกลูกค้าที่มีอยู่");
      return;
    }

    if (
      customerMode === "new" &&
      (!customerName.trim() ||
        !customerPhone.trim())
    ) {
      setSubmitError("กรุณากรอกชื่อลูกค้าและเบอร์โทรศัพท์");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const response = await createAdminBooking({
        courtId: selectedCourtId,
        date: formatApiDate(selectedDate),
        slots: selectedCourtSlots,
        customerMode,
        existingCustomerId:
          selectedCustomer?.id,
        customerName:
          customerMode === "existing"
            ? selectedCustomer?.displayName || ""
            : customerName.trim(),
        customerPhone:
          customerMode === "existing"
            ? selectedCustomer?.phone || ""
            : customerPhone.trim(),
        bookingStatus,
        paymentStatus,
      });

      setShowModal(false);
      resetBookingForm();
      clearSelection();
      await fetchAvailability();
      router.push(
        `/admin/bookings/${response.bookingId}`,
      );
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "เกิดข้อผิดพลาดในการจองสนาม",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-[60vh]">
      <DateSelector
        dates={dates}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />

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
            onConfirm={() => {
              resetBookingForm();
              setShowModal(true);
            }}
          />
        )}

      {showModal && selectedCourt && (
        <BookingModal
          court={selectedCourt}
          selectedDate={selectedDate}
          selectedSlots={selectedSlots}
          customerMode={customerMode}
          customerSearchQuery={customerSearchQuery}
          customerResults={customerResults}
          searchingCustomers={searchingCustomers}
          selectedCustomer={selectedCustomer}
          customerName={customerName}
          customerPhone={customerPhone}
          bookingStatus={bookingStatus}
          paymentStatus={paymentStatus}
          submitError={submitError}
          isSubmitting={isSubmitting}
          onCustomerModeChange={
            handleCustomerModeChange
          }
          onCustomerSearchChange={
            handleCustomerSearchChange
          }
          onSelectCustomer={
            selectExistingCustomer
          }
          onCustomerNameChange={
            setCustomerName
          }
          onCustomerPhoneChange={
            setCustomerPhone
          }
          onBookingStatusChange={
            setBookingStatus
          }
          onPaymentStatusChange={
            setPaymentStatus
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
