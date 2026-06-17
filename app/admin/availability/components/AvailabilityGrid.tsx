import type {
    CourtAvailability,
    Slot,
} from "../types/availability";

import { getStatusColor } from "../utils/availability";

interface AvailabilityGridProps {
    courts: CourtAvailability[];
    selectedCourtId: string | null;
    selectedSlots: string[];

    onSlotClick: (
        courtId: string,
        courtName: string,
        slot: Slot,
    ) => void;
}

export default function AvailabilityGrid({
    courts,
    selectedCourtId,
    selectedSlots,
    onSlotClick,
}: AvailabilityGridProps) {
    return (
        <div
            className={`flex flex-col gap-6 ${selectedSlots.length > 0 ? "pb-24" : ""
                }`}
        >
            {courts.map((court) => {
                const availableCount = court.slots.filter(
                    (slot) => slot.isAvailable,
                ).length;

                return (
                    <section
                        key={court.id}
                        className="rounded-3xl border border-white/[0.04] bg-white/[0.01] p-6"
                    >
                        <div className="mb-5 flex items-center justify-between gap-4">
                            <h3 className="text-base font-extrabold text-white">
                                {court.name}
                            </h3>

                            <span
                                className={`text-xs font-bold ${availableCount > 0
                                        ? "text-emerald-500"
                                        : "text-red-500"
                                    }`}
                            >
                                ว่าง {availableCount}/{court.slots.length} ช่วง
                            </span>
                        </div>

                        <div className="grid grid-cols-[repeat(auto-fill,minmax(130px,1fr))] gap-2.5">
                            {court.slots.map((slot) => {
                                const statusColor = getStatusColor(
                                    slot.bookingStatus,
                                );

                                const isSelected =
                                    selectedCourtId === court.id &&
                                    selectedSlots.includes(slot.startTime);

                                const style = isSelected
                                    ? {
                                        borderColor: "#6366f1",
                                        background:
                                            "rgba(99,102,241,0.12)",
                                    }
                                    : slot.isAvailable
                                        ? {
                                            borderColor:
                                                "rgba(16,185,129,0.2)",
                                            background:
                                                "rgba(16,185,129,0.03)",
                                        }
                                        : {
                                            borderColor: statusColor.border,
                                            background: statusColor.bg,
                                        };

                                return (
                                    <button
                                        key={slot.startTime}
                                        type="button"
                                        onClick={() =>
                                            onSlotClick(
                                                court.id,
                                                court.name,
                                                slot,
                                            )
                                        }
                                        className="admin-slot-btn w-full border text-left"
                                        style={{
                                            ...style,
                                            cursor: slot.isAvailable
                                                ? "pointer"
                                                : "default",
                                            color: "inherit",
                                        }}
                                    >
                                        <div
                                            className="font-bold"
                                            style={{
                                                marginBottom: slot.bookedBy
                                                    ? "0.25rem"
                                                    : 0,
                                                color: isSelected
                                                    ? "#c7d2fe"
                                                    : slot.isAvailable
                                                        ? "#10b981"
                                                        : statusColor.text,
                                            }}
                                        >
                                            {slot.startTime} - {slot.endTime}
                                        </div>

                                        {slot.isAvailable ? (
                                            <span
                                                className="text-[0.7rem]"
                                                style={{
                                                    color: isSelected
                                                        ? "#a5b4fc"
                                                        : "rgba(16,185,129,0.65)",
                                                }}
                                            >
                                                {isSelected
                                                    ? "● เลือกแล้ว"
                                                    : "✓ ว่าง"}
                                            </span>
                                        ) : (
                                            <span className="block truncate text-[0.7rem] text-white/40">
                                                👤 {slot.bookedBy || "ไม่ระบุ"}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </section>
                );
            })}
        </div>
    );
}