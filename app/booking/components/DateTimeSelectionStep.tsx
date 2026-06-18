import type { Court, TimeSlot } from "../types/booking";
import { formatPrice } from "../utils/booking";
import { BackButton } from "./BackButton";
import { DatePicker } from "./DatePicker";
import { SectionHeader } from "./SectionHeader";
import { TimeSlotGrid } from "./TimeSlotGrid";

type DateTimeSelectionStepProps = {
  court: Court;
  dates: Date[];
  selectedDate: Date;
  slots: TimeSlot[];
  selectedSlots: TimeSlot[];
  loadingSlots: boolean;
  slotsError: string;
  onBack: () => void;
  onSelectDate: (date: Date) => void;
  onToggleSlot: (slot: TimeSlot) => void;
  isPastSlot: (slot: TimeSlot) => boolean;
};

export function DateTimeSelectionStep({
  court,
  dates,
  selectedDate,
  slots,
  selectedSlots,
  loadingSlots,
  slotsError,
  onBack,
  onSelectDate,
  onToggleSlot,
  isPastSlot,
}: DateTimeSelectionStepProps) {
  return (
    <div className="animate-[slideUp_0.3s_ease-out] mt-1">
      <div className="flex items-center gap-3 mb-6">
        <BackButton onClick={onBack} />
        <SectionHeader
          title="เลือกวันและเวลา"
          description={`${court.name} · ฿${formatPrice(court.pricePerHour)}/ชม.`}
        />
      </div>

      <DatePicker
        dates={dates}
        selectedDate={selectedDate}
        onSelectDate={onSelectDate}
      />

      <div className="h-px bg-white/[0.06] mb-6" />

      <TimeSlotGrid
        slots={slots}
        selectedSlots={selectedSlots}
        loading={loadingSlots}
        error={slotsError}
        isPastSlot={isPastSlot}
        onToggleSlot={onToggleSlot}
      />
    </div>
  );
}
