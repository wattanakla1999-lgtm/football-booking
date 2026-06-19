"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AdminRouteLoadingOverlay } from "@/src/components/common/AdminRouteLoadingOverlay";
import { CourtCard } from "../booking/components/CourtCard";
import { DatePicker } from "../booking/components/DatePicker";
import { getAvailability } from "../booking/services/bookingService";
import type {
  Court,
  TimeSlot,
} from "../booking/types/booking";
import {
  formatApiDate,
  formatPrice,
  getBookingDates,
  isPastTimeSlot,
} from "../booking/utils/booking";

type AvailabilityViewerProps = {
  userName: string;
  initialCourts: Court[];
};

export default function AvailabilityViewer({
  userName,
  initialCourts,
}: AvailabilityViewerProps) {
  const router = useRouter();
  const [selectedCourt, setSelectedCourt] =
    useState<Court | null>(initialCourts[0] ?? null);
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] =
    useState(false);
  const [slotsError, setSlotsError] = useState("");
  const [selectedSlotStartTimes, setSelectedSlotStartTimes] =
    useState<string[]>([]);
  const [isRouteLoading, setIsRouteLoading] =
    useState(false);

  const dates = useMemo(() => getBookingDates(14), []);

  useEffect(() => {
    if (!selectedCourt) {
      setSlots([]);
      setSelectedSlotStartTimes([]);
      return;
    }

    const loadSlots = async () => {
      setLoadingSlots(true);
      setSlotsError("");

      try {
        const nextSlots = await getAvailability({
          courtId: selectedCourt.id,
          date: formatApiDate(selectedDate),
        });

        setSlots(nextSlots);
      } catch {
        setSlotsError("ไม่สามารถโหลดข้อมูลสนามว่างได้");
      } finally {
        setLoadingSlots(false);
      }
    };

    void loadSlots();
  }, [selectedCourt, selectedDate]);

  useEffect(() => {
    setSelectedSlotStartTimes([]);
  }, [selectedCourt?.id, selectedDate]);

  const toggleSlot = (slot: TimeSlot) => {
    const isPast = isPastTimeSlot(selectedDate, slot);

    if (!slot.isAvailable || isPast) {
      return;
    }

    setSelectedSlotStartTimes((current) => {
      if (current.includes(slot.startTime)) {
        return current.filter(
          (startTime) => startTime !== slot.startTime,
        );
      }

      return [...current, slot.startTime].sort((a, b) =>
        a.localeCompare(b),
      );
    });
  };

  const handleBookSelectedSlots = () => {
    if (
      !selectedCourt ||
      selectedSlotStartTimes.length === 0
    ) {
      return;
    }

    const params = new URLSearchParams({
      courtId: selectedCourt.id,
      date: formatApiDate(selectedDate),
      slots: selectedSlotStartTimes.join(","),
    });

    setIsRouteLoading(true);
    router.push(`/booking?${params.toString()}`);
  };

  return (
    <main className="min-h-dvh bg-[#06111d] text-white">
      <div className="relative mx-auto min-h-dvh w-full max-w-[440px] overflow-hidden border-x border-green-400/10 bg-[#071624]">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(74,222,128,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(74,222,128,0.06)_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.18),transparent_28%),linear-gradient(180deg,rgba(4,10,18,0.15),rgba(4,10,18,0.94))]" />

        <div className="relative z-10 px-5 pb-28 pt-5">
          <header className="sticky top-0 z-20 -mx-5 mb-5 border-b border-green-400/10 bg-[#071624]/92 px-5 py-4 backdrop-blur">
            <div className="flex items-center justify-between">
              <Link
                href="/dashboard"
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl text-green-300 transition-colors hover:bg-white/5"
                aria-label="กลับหน้าหลัก"
              >
                <span className="material-symbols-outlined text-[30px]">
                  arrow_back
                </span>
              </Link>

              <div className="text-center">
                <h1 className="text-2xl font-black tracking-tight text-green-300">
                  ดูสนามว่าง
                </h1>
                <p className="mt-1 text-xs font-bold tracking-[0.14em] text-slate-300">
                  คุณ{userName} ตรวจสอบสนามที่ว่าง
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center text-green-300">
                <span className="material-symbols-outlined text-[28px]">
                  sports_soccer
                </span>
              </div>
            </div>
          </header>

          <section className="rounded-[28px] border border-white/10 bg-[#091b2d]/92 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-black text-slate-200">
                  เลือกสนาม
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  มี {initialCourts.length} สนามให้ตรวจสอบ
                </p>
              </div>
              <div className="rounded-full bg-green-400/10 px-3 py-1 text-xs font-black text-green-300">
                ดูอย่างเดียว
              </div>
            </div>

            {initialCourts.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-12 text-center">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-green-400/10 text-green-300">
                  <span className="material-symbols-outlined text-[30px]">
                    stadium
                  </span>
                </div>
                <p className="mt-4 text-base font-bold text-slate-200">
                  ยังไม่มีสนามที่เปิดใช้งาน
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {initialCourts.map((court) => (
                  <div
                    key={court.id}
                    className={`rounded-[22px] transition-all ${
                      selectedCourt?.id === court.id
                        ? "ring-2 ring-green-400/70 ring-offset-0"
                        : ""
                    }`}
                  >
                    <CourtCard
                      court={court}
                      onSelect={setSelectedCourt}
                    />
                  </div>
                ))}
              </div>
            )}
          </section>

          {selectedCourt && (
            <section className="mt-5 rounded-[28px] border border-white/10 bg-[#091b2d]/92 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-black text-slate-200">
                    วันที่ต้องการดู
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {selectedCourt.name} · ฿{formatPrice(selectedCourt.pricePerHour)}/ชม.
                  </p>
                </div>
                <div className="rounded-full bg-white/[0.05] px-3 py-1 text-xs font-bold text-slate-300">
                  {selectedDate.toLocaleDateString("th-TH", {
                    day: "numeric",
                    month: "short",
                  })}
                </div>
              </div>

              <DatePicker
                dates={dates}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
              />

              <div className="mb-4 mt-2 flex items-center justify-between">
                <p className="text-sm font-black text-slate-200">
                  ตารางช่วงเวลา
                </p>
                <div className="flex items-center gap-3 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
                    ว่าง
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-green-200 shadow-[0_0_12px_rgba(187,247,208,0.45)]" />
                    เลือกแล้ว
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                    ไม่ว่าง
                  </span>
                </div>
              </div>

              {loadingSlots ? (
                <div className="grid grid-cols-3 gap-3">
                  {Array.from({ length: 12 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-[76px] animate-pulse rounded-2xl bg-white/[0.05]"
                    />
                  ))}
                </div>
              ) : slotsError ? (
                <div className="rounded-3xl border border-red-400/20 bg-red-500/10 px-5 py-10 text-center text-sm font-bold text-red-300">
                  {slotsError}
                </div>
              ) : slots.length === 0 ? (
                <div className="rounded-3xl border border-white/10 bg-white/[0.03] px-5 py-10 text-center">
                  <p className="text-base font-bold text-slate-200">
                    วันนี้สนามนี้ไม่มีรอบให้บริการ
                  </p>
                  <p className="mt-2 text-sm text-slate-400">
                    ลองเปลี่ยนวันเพื่อดูรอบว่างเพิ่มเติม
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                  {slots.map((slot) => {
                    const isPast = isPastTimeSlot(
                      selectedDate,
                      slot,
                    );
                    const isAvailable =
                      slot.isAvailable && !isPast;
                    const isSelected =
                      selectedSlotStartTimes.includes(
                        slot.startTime,
                      );

                    return (
                      <button
                        type="button"
                        key={slot.startTime}
                        disabled={!isAvailable}
                        onClick={() => toggleSlot(slot)}
                        className={`rounded-2xl border px-2 py-4 text-center transition-all ${
                          !isAvailable
                            ? "cursor-not-allowed border-white/10 bg-white/[0.03] text-slate-500"
                            : isSelected
                              ? "border-green-200 bg-green-400/22 text-green-100 shadow-[0_0_28px_rgba(74,222,128,0.22)]"
                              : "border-green-400/35 bg-green-400/12 text-green-300 shadow-[0_0_20px_rgba(74,222,128,0.12)] hover:scale-[1.02]"
                        }`}
                      >
                        <p className="text-lg font-black">
                          {slot.startTime.slice(0, 5)}
                        </p>
                        <p className="mt-1 text-[11px] font-bold tracking-[0.14em]">
                          {isPast
                            ? "เลยเวลา"
                            : !isAvailable
                              ? "ไม่ว่าง"
                              : "ว่าง"}
                        </p>
                        {isAvailable && (
                          <p className="mt-1 text-[10px] font-bold">
                            {isSelected
                              ? "เลือกแล้ว"
                              : "แตะเพื่อจอง"}
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {selectedSlotStartTimes.length > 0 && (
                <div className="mt-5 rounded-3xl border border-green-300/20 bg-green-400/8 p-4">
                  <p className="text-sm font-black text-green-200">
                    เลือกไว้แล้ว {selectedSlotStartTimes.length} ช่วงเวลา
                  </p>
                  <p className="mt-1 text-xs text-slate-300">
                    {selectedSlotStartTimes
                      .map((startTime) => startTime.slice(0, 5))
                      .join(", ")}
                  </p>
                </div>
              )}
            </section>
          )}
        </div>
      </div>

      {selectedCourt &&
        selectedSlotStartTimes.length > 0 && (
          <div className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-[440px] border-t border-green-400/10 bg-[#071624]/95 px-5 py-5 backdrop-blur">
            <button
              type="button"
              onClick={handleBookSelectedSlots}
              className="flex h-16 w-full items-center justify-center gap-2 rounded-3xl bg-green-400 text-lg font-black text-[#062015] shadow-[0_16px_40px_rgba(74,222,128,0.22)] transition-transform active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-[28px]">
                calendar_add_on
              </span>
              ไปหน้าสรุปการจอง
            </button>
          </div>
        )}

      <AdminRouteLoadingOverlay open={isRouteLoading} />
    </main>
  );
}
