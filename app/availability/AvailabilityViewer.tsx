"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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
  const [selectedCourt, setSelectedCourt] =
    useState<Court | null>(initialCourts[0] ?? null);
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] =
    useState(false);
  const [slotsError, setSlotsError] = useState("");

  const dates = useMemo(() => getBookingDates(14), []);

  useEffect(() => {
    if (!selectedCourt) {
      setSlots([]);
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

  return (
    <main className="min-h-dvh bg-[#06111d] text-white">
      <div className="relative mx-auto min-h-dvh w-full max-w-[440px] overflow-hidden border-x border-green-400/10 bg-[#071624]">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(74,222,128,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(74,222,128,0.06)_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.18),transparent_28%),linear-gradient(180deg,rgba(4,10,18,0.15),rgba(4,10,18,0.94))]" />

        <div className="relative z-10 px-5 pb-10 pt-5">
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
                  ตรวจสอบสนามที่ว่าง
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center text-green-300">
                <span className="material-symbols-outlined text-[28px]">
                  sports_soccer
                </span>
              </div>
            </div>
          </header>

          {/* <section className="mb-5 rounded-[28px] border border-green-400/15 bg-[linear-gradient(180deg,rgba(16,40,31,0.95),rgba(8,24,37,0.92))] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-black tracking-[0.2em] text-green-300/90">
                  สถานะล่าสุด
                </p>
                <h2 className="mt-2 text-3xl font-black leading-tight text-white">
                  สนามว่างวันนี้ดูได้ทันที
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  สวัสดีคุณ{userName} เลือกสนามและวันที่เพื่อเช็กช่วงเวลาที่พร้อมใช้งานได้เลย
                </p>
              </div>

              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-green-400/15 text-green-300 shadow-[0_0_30px_rgba(74,222,128,0.22)]">
                <span className="material-symbols-outlined text-[30px]">
                  event_available
                </span>
              </div>
            </div>
          </section> */}

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

                    return (
                      <div
                        key={slot.startTime}
                        className={`rounded-2xl border px-2 py-4 text-center transition-all ${
                          isAvailable
                            ? "border-green-400/35 bg-green-400/12 text-green-300 shadow-[0_0_20px_rgba(74,222,128,0.12)]"
                            : "border-white/10 bg-white/[0.03] text-slate-500"
                        }`}
                      >
                        <p className="text-lg font-black">
                          {slot.startTime.slice(0, 5)}
                        </p>
                        <p className="mt-1 text-[11px] font-bold tracking-[0.14em]">
                          {isPast
                            ? "เลยเวลา"
                            : isAvailable
                              ? "ว่าง"
                              : "ไม่ว่าง"}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}
        </div>
      </div>

    </main>
  );
}
