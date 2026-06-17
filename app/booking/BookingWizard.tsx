"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

// ─── Types ──────────────────────────────────────────────────────────────────

type Court = {
  id: string;
  name: string;
  surface: string | null;
  maxPlayers: number | null;
  pricePerHour: number | string;
  images: { url: string }[];
};

type TimeSlot = {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
};

// ─── Helpers ────────────────────────────────────────────────────────────────

const formatPrice = (price: any) => Number(price).toLocaleString("th-TH");

/** Strip non-digits and check Thai mobile format: 0X-XXXX-XXXX (10 digits, starts with 0) */
const validateThaiPhone = (raw: string): { valid: boolean; digits: string; error: string } => {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 0) return { valid: false, digits, error: "กรุณากรอกเบอร์โทรศัพท์" };
  if (!digits.startsWith("0")) return { valid: false, digits, error: "เบอร์โทรต้องเริ่มต้นด้วย 0" };
  if (digits.length < 10) return { valid: false, digits, error: "เบอร์โทรต้องมี 10 หลัก" };
  if (digits.length > 10) return { valid: false, digits, error: "เบอร์โทรต้องมีไม่เกิน 10 หลัก" };
  return { valid: true, digits, error: "" };
};

const THAI_DAY_SHORT = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];
const THAI_MONTH = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
];

// ─── Component ──────────────────────────────────────────────────────────────

type BookingWizardProps = {
  user: {
    id: string;
    displayName: string;
    pictureUrl: string | null;
    phone: string | null;
  };
};

export default function BookingWizard({ user }: BookingWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [courts, setCourts] = useState<Court[]>([]);
  const [loadingCourts, setLoadingCourts] = useState(true);
  const [courtsError, setCourtsError] = useState("");

  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState("");
  const [selectedSlots, setSelectedSlots] = useState<TimeSlot[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [phone, setPhone] = useState(user.phone || "");
  const [phoneError, setPhoneError] = useState("");

  const dateListRef = useRef<HTMLDivElement>(null);

  // Fetch courts
  useEffect(() => {
    fetch("/api/courts")
      .then((res) => res.json())
      .then((data) => {
        if (data.courts) setCourts(data.courts);
        else setCourtsError("ไม่พบข้อมูลสนาม");
      })
      .catch(() => setCourtsError("เกิดข้อผิดพลาดในการโหลดข้อมูล"))
      .finally(() => setLoadingCourts(false));
  }, []);

  // Fetch slots
  useEffect(() => {
    if (step !== 2 || !selectedCourt) return;
    setLoadingSlots(true);
    setSlotsError("");
    setSelectedSlots([]);

    const dateString = selectedDate.toISOString().split("T")[0];
    fetch(`/api/availability?courtId=${selectedCourt.id}&date=${dateString}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.slots) setSlots(data.slots);
        else setSlots([]);
      })
      .catch(() => setSlotsError("ไม่สามารถโหลดช่วงเวลาได้"))
      .finally(() => setLoadingSlots(false));
  }, [step, selectedCourt, selectedDate]);

  // Auto-scroll selected date
  useEffect(() => {
    if (dateListRef.current) {
      const el = dateListRef.current.querySelector("[data-selected='true']");
      el?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [selectedDate]);

  const dates = (() => {
    const list = [];
    for (let i = 0; i < 14; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      list.push(d);
    }
    return list;
  })();

  const selectCourt = (court: Court) => {
    setSelectedCourt(court);
    setSelectedSlots([]);
    setStep(2);
  };

  // เช็คว่า slot นี้เป็นเวลาที่ผ่านไปแล้วหรือยัง (เฉพาะกรณีเลือกวันนี้)
  const isPastSlot = (slot: TimeSlot) => {
    const now = new Date();
    const isToday = selectedDate.toDateString() === now.toDateString();
    if (!isToday) return false;
    const [h, m] = slot.startTime.split(":").map(Number);
    const slotTime = new Date(selectedDate);
    slotTime.setHours(h, m, 0, 0);
    return slotTime.getTime() <= now.getTime();
  };

  const toggleSlot = (slot: TimeSlot) => {
    if (!slot.isAvailable || isPastSlot(slot)) return;
    setSelectedSlots((prev) => {
      const exists = prev.some((s) => s.startTime === slot.startTime);
      if (exists) return prev.filter((s) => s.startTime !== slot.startTime);
      return [...prev, slot].sort((a, b) => a.startTime.localeCompare(b.startTime));
    });
  };

  const goBackToCourts = () => {
    setSelectedCourt(null);
    setSelectedSlots([]);
    setStep(1);
  };

  const handleConfirm = async () => {
    if (!selectedCourt || selectedSlots.length === 0) return;

    // Validate phone
    const phoneCheck = validateThaiPhone(phone);
    if (!phoneCheck.valid) {
      setPhoneError(phoneCheck.error);
      return;
    }
    setPhoneError("");

    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courtId: selectedCourt.id,
          date: selectedDate.toISOString().split("T")[0],
          slots: selectedSlots,
          phone: phone.replace(/\D/g, ""),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "จองไม่สำเร็จ");

      router.push("/history");
    } catch (err: any) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  const totalPrice = selectedCourt
    ? selectedSlots.length * Number(selectedCourt.pricePerHour)
    : 0;

  // ──────────────────────────────────────────────────────────────────────────
  // Step indicator
  // ──────────────────────────────────────────────────────────────────────────
  const StepIndicator = () => (
    <div className="flex items-center gap-3 w-full">
      {[
        { n: 1, label: "เลือกสนาม" },
        { n: 2, label: "วันและเวลา" },
        { n: 3, label: "ยืนยัน" },
      ].map((s, i) => (
        <div key={s.n} className="flex items-center w-full">
          <div className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${step >= s.n
                  ? "bg-green-500 text-white"
                  : "bg-white/10 text-white/40"
                }`}
            >
              {step > s.n ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                s.n
              )}
            </div>
            <span
              className={`text-xs font-medium hidden sm:inline transition-colors ${step >= s.n ? "text-white/70" : "text-white/30"
                }`}
            >
              {s.label}
            </span>
          </div>
          {i < 2 && (
            <div
              className={`flex-1 h-[1px] mx-3 rounded-full transition-all duration-500 ${step > s.n ? "bg-green-500/60" : "bg-white/10"
                }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  // ──────────────────────────────────────────────────────────────────────────
  // RENDER
  // ──────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 flex flex-col">
      {/* Step progress bar */}
      {/* <div className="px-6 pt-6 pb-4">
        <StepIndicator />
      </div> */}

      <div className="flex-1 px-6 pb-10 overflow-y-auto">
        {/* ═══════════════════════════════════════════════════════════════════
            STEP 1 — เลือกสนาม
           ═══════════════════════════════════════════════════════════════════ */}
        {step === 1 && (
          <div className="animate-[slideUp_0.3s_ease-out] py-2">
            <div className="border-l-4 border-green-500 pl-4 mb-6 mt-1">
              <h2 className="text-2xl font-extrabold tracking-tight">
                เลือกสนาม
              </h2>
              <p className="text-white/40 text-sm mt-1.5 leading-relaxed">
                สวัสดีคุณ{user.displayName} · มี {loadingCourts ? "..." : courts.length} สนามให้เลือก
              </p>
            </div>

            {loadingCourts ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-[140px] rounded-2xl bg-white/[0.03] animate-pulse" />
                ))}
              </div>
            ) : courtsError ? (
              <div className="bg-red-500/10 rounded-2xl text-red-400 text-center py-10 px-6 text-sm">
                {courtsError}
              </div>
            ) : courts.length === 0 ? (
              <div className="bg-white/[0.02] rounded-2xl text-center py-14 px-6">
                <div className="text-4xl mb-3">🏟️</div>
                <p className="text-white/40 text-sm">ยังไม่มีสนามที่เปิดให้บริการ</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courts.map((court, idx) => (
                  <button
                    key={court.id}
                    onClick={() => selectCourt(court)}
                    className="group w-full text-left bg-white/[0.02] hover:bg-white/[0.04] rounded-2xl overflow-hidden border border-white/[0.06] hover:border-green-500/30 transition-all duration-200 active:scale-[0.99]"
                  >
                    <div className="flex min-h-[5.5rem]">
                      {/* Thumbnail */}
                      <div className="w-[130px] shrink-0 relative bg-gradient-to-br from-green-900/40 to-black/70">
                        {court.images?.[0]?.url ? (
                          <Image
                            src={court.images[0].url}
                            alt={court.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-3xl">⚽</span>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0 px-5 py-4 flex flex-col justify-center">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="font-bold text-lg tracking-tight">
                            {court.name}
                          </h3>
                          <div className="shrink-0 bg-green-500/15 text-green-400 text-sm font-bold px-3 py-1 rounded-full whitespace-nowrap">
                            ฿{formatPrice(court.pricePerHour)}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 mt-2.5 text-sm text-white/40">
                          {court.surface && (
                            <span className="flex items-center gap-1.5">
                              🌿 {court.surface}
                            </span>
                          )}
                          {court.maxPlayers && (
                            <span className="flex items-center gap-1.5">
                              👥 {court.maxPlayers} คน
                            </span>
                          )}
                          <span className="flex items-center gap-1.5">
                            ⏱️ 1 ชม.
                          </span>
                        </div>
                      </div>

                      {/* Arrow */}
                      <div className="flex items-center pr-5 text-white/20 group-hover:text-green-400 transition-colors">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 18l6-6-6-6" />
                        </svg>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            STEP 2 — เลือกวันและเวลา
           ═══════════════════════════════════════════════════════════════════ */}
        {step === 2 && selectedCourt && (
          <div className="animate-[slideUp_0.3s_ease-out] mt-1">
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={goBackToCourts}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <div className="border-l-4 border-green-500 pl-4">
                <h2 className="text-xl font-bold tracking-tight">เลือกวันและเวลา</h2>
                <p className="text-white/40 text-xs mt-1">
                  {selectedCourt.name} · ฿{formatPrice(selectedCourt.pricePerHour)}/ชม.
                </p>
              </div>
            </div>

            {/* ── Date picker ──────────────────────────────────────────────── */}
            <div className="mb-8">
              <p className="text-sm font-medium text-white/70 mb-4">วันที่</p>
              <div
                ref={dateListRef}
                className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-6 px-6 snap-x snap-mandatory"
              >
                {dates.map((d, i) => {
                  const isToday = i === 0;
                  const isSelected = d.toDateString() === selectedDate.toDateString();

                  return (
                    <button
                      key={i}
                      data-selected={isSelected}
                      onClick={() => { setSelectedDate(d); setSelectedSlots([]); }}
                      className={`snap-start flex flex-col items-center justify-center min-w-[4.5rem] h-[5.5rem] rounded-2xl border-2 transition-all duration-150 shrink-0 ${isSelected
                          ? "bg-green-500 border-green-500 text-white scale-105 shadow-[0_0_16px_rgba(34,197,94,0.3)]"
                          : "bg-white/[0.02] border-white/10 text-white/50 hover:bg-white/[0.06] hover:border-white/20"
                        }`}
                    >
                      <span className={`text-sm font-medium ${isSelected ? "text-green-100" : "text-white/40"}`}>
                        {isToday ? "วันนี้" : THAI_DAY_SHORT[d.getDay()]}
                      </span>
                      <span className={`text-2xl font-black leading-tight ${isToday && !isSelected ? "text-white/80" : ""}`}>
                        {d.getDate()}
                      </span>
                      <span className={`text-[11px] mt-0.5 ${isSelected ? "text-green-100" : "opacity-50"}`}>
                        {THAI_MONTH[d.getMonth()]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="h-px bg-white/[0.06] mb-6" />

            {/* ── Time slots ───────────────────────────────────────────────── */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-white/70">เวลา</p>
                {selectedSlots.length > 0 && (
                  <span className="text-xs text-green-400 font-medium bg-green-500/10 px-3 py-1 rounded-full">
                    {selectedSlots.length} ช่วง
                  </span>
                )}
              </div>

              {loadingSlots ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="h-[4.5rem] rounded-2xl bg-white/[0.03] animate-pulse" />
                  ))}
                </div>
              ) : slotsError ? (
                <div className="bg-red-500/10 rounded-2xl text-red-400 text-center py-10 text-sm">
                  {slotsError}
                </div>
              ) : slots.length === 0 ? (
                <div className="bg-white/[0.02] rounded-2xl text-center py-12">
                  <div className="text-4xl mb-3">🚫</div>
                  <p className="text-white/40 text-sm">สนามปิดให้บริการในวันนี้</p>
                  <p className="text-white/30 text-xs mt-1.5">กรุณาเลือกวันอื่น</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {slots.map((slot) => {
                      const isSelected = selectedSlots.some((s) => s.startTime === slot.startTime);
                      const isPast = isPastSlot(slot);
                      const disabled = !slot.isAvailable || isPast;
                      return (
                        <button
                          key={slot.startTime}
                          disabled={disabled}
                          onClick={() => toggleSlot(slot)}
                          className={`relative h-[4.5rem] rounded-2xl text-base font-bold transition-all duration-100 flex flex-col items-center justify-center ${disabled
                              ? "bg-white/[0.01] text-white/15 cursor-not-allowed"
                              : isSelected
                                ? "bg-green-500 text-white shadow-[0_0_16px_rgba(34,197,94,0.3)] scale-[1.02]"
                                : "bg-white/[0.04] text-white/70 hover:bg-white/[0.08] hover:text-white hover:scale-[1.02] active:scale-95"
                            }`}
                        >
                          {isPast ? (
                            <>
                              <span className="relative z-10 text-base font-bold opacity-30">
                                {slot.startTime.slice(0, 5)}
                              </span>
                              <span className="text-[10px] opacity-20 mt-0.5">เลยเวลา</span>
                              <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-2xl">
                                <div className="w-[200%] h-px bg-white/10 -rotate-12" />
                              </div>
                            </>
                          ) : !slot.isAvailable ? (
                            <>
                              <span className="relative z-10 text-base font-bold opacity-30">
                                {slot.startTime.slice(0, 5)}
                              </span>
                              <span className="text-[10px] opacity-20 mt-0.5">ไม่ว่าง</span>
                              <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-2xl">
                                <div className="w-[200%] h-px bg-white/10 -rotate-12" />
                              </div>
                            </>
                          ) : isSelected ? (
                            <>
                              <span className="relative z-10 text-lg font-black">
                                {slot.startTime.slice(0, 5)}
                              </span>
                              <span className="text-[10px] text-green-200 font-medium mt-0.5">✓ เลือกแล้ว</span>
                            </>
                          ) : (
                            <>
                              <span className="relative z-10 text-lg font-bold">
                                {slot.startTime.slice(0, 5)}
                              </span>
                              <span className="text-[10px] opacity-30 mt-0.5">ว่าง</span>
                            </>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Legend */}
                  <div className="flex items-center gap-6 mt-5 text-xs text-white/30">
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded bg-white/[0.06]" /> ว่าง
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded bg-green-500" /> เลือกแล้ว
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded bg-white/[0.01]" /> ไม่ว่าง
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            STEP 3 — สรุป & ยืนยัน
           ═══════════════════════════════════════════════════════════════════ */}
        {step === 3 && selectedCourt && (
          <div className="animate-[slideUp_0.3s_ease-out] mt-1">
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => setStep(2)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <div className="border-l-4 border-green-500 pl-4">
                <h2 className="text-xl font-bold tracking-tight">สรุปการจอง</h2>
                <p className="text-white/40 text-xs mt-1">ตรวจสอบข้อมูลก่อนยืนยัน</p>
              </div>
            </div>

            {/* ── Court info card ────────────────────────────────────────── */}
            <div className="bg-white/[0.02] rounded-2xl border border-white/[0.06] overflow-hidden mb-4">
              <div className="px-5 py-5 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-green-500/15 flex items-center justify-center text-xl shrink-0">
                  🏟️
                </div>
                <div>
                  <p className="font-bold text-base">{selectedCourt.name}</p>
                  <p className="text-xs text-white/40 mt-1 leading-relaxed">
                    {selectedCourt.surface && `${selectedCourt.surface} · `}
                    ฿{formatPrice(selectedCourt.pricePerHour)}/ชม.
                    {selectedCourt.maxPlayers && ` · สูงสุด ${selectedCourt.maxPlayers} คน`}
                  </p>
                </div>
              </div>
            </div>

            {/* ── Detail rows ────────────────────────────────────────────── */}
            <div className="bg-white/[0.02] rounded-2xl border border-white/[0.06] overflow-hidden mb-4">
              <div className="divide-y divide-white/[0.04]">
                {/* Date */}
                <div className="px-5 py-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center shrink-0 text-base">
                    📅
                  </div>
                  <div>
                    <p className="text-xs text-white/40">วันที่</p>
                    <p className="text-sm font-medium mt-0.5">
                      {selectedDate.toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" })}
                    </p>
                  </div>
                </div>

                {/* Time */}
                <div className="px-5 py-4 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center shrink-0 text-base">
                    ⏰
                  </div>
                  <div>
                    <p className="text-xs text-white/40">เวลา</p>
                    <div className="flex flex-wrap gap-2 mt-1.5">
                      {selectedSlots.map((s) => (
                        <span
                          key={s.startTime}
                          className="inline-block bg-green-500/10 text-green-400 text-sm font-medium px-3 py-1.5 rounded-xl"
                        >
                          {s.startTime.slice(0, 5)}–{s.endTime.slice(0, 5)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Price */}
                <div className="px-5 py-5">
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between text-white/50">
                      <span>ราคาต่อชั่วโมง</span>
                      <span>฿{formatPrice(selectedCourt.pricePerHour)}</span>
                    </div>
                    <div className="flex justify-between text-white/50">
                      <span>จำนวนชั่วโมง</span>
                      <span>{selectedSlots.length} ชม.</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/[0.06]">
                    <span className="text-base font-bold">รวมทั้งหมด</span>
                    <span className="text-xl font-extrabold text-green-400">฿{formatPrice(totalPrice)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Phone number ─────────────────────────────────────────── */}
            <div className={`bg-white/[0.02] rounded-2xl border overflow-hidden mb-4 transition-colors ${phoneError ? "border-red-500/40" : "border-white/[0.06]"}`}>
              <div className="px-5 py-4 flex items-start gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-base transition-colors ${phoneError ? "bg-red-500/10" : "bg-white/5"}`}>
                  📞
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-white/40">เบอร์โทรศัพท์ <span className="text-red-400">*</span></p>
                    {phone.replace(/\D/g, "").length > 0 && (
                      <span className={`text-[10px] font-medium ${phone.replace(/\D/g, "").length === 10 ? "text-green-400" : "text-white/30"}`}>
                        {phone.replace(/\D/g, "").length}/10
                      </span>
                    )}
                  </div>
                  <input
                    type="tel"
                    inputMode="tel"
                    placeholder="เบอร์โทร"
                    value={phone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9-]/g, "");
                      setPhone(val);
                      if (phoneError) setPhoneError("");
                    }}
                    maxLength={13}
                    className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 outline-none focus:ring-2 transition-all ${phoneError
                        ? "border-red-500/50 focus:border-red-500/60 focus:ring-red-500/10"
                        : "border-white/10 focus:border-green-500/50 focus:ring-green-500/10"
                      }`}
                  />
                  {phoneError ? (
                    <p className="text-[11px] text-red-400 mt-1.5 flex items-center gap-1">
                      <span>⚠️</span> {phoneError}
                    </p>
                  ) : (
                    <p className="text-[11px] text-white/30 mt-1.5">กรอกเบอร์โทรเพื่อให้สนามติดต่อกลับได้</p>
                  )}
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-500/10 rounded-2xl text-red-400 text-sm px-5 py-4 flex items-start gap-3 mb-4 leading-relaxed">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Buttons */}
            <div className="space-y-3 mt-8">
              <button
                onClick={handleConfirm}
                disabled={isSubmitting}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-5 rounded-2xl text-base tracking-wide transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    กำลังยืนยัน...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    ยืนยันการจอง
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                )}
              </button>

              <button
                onClick={() => setStep(2)}
                disabled={isSubmitting}
                className="w-full bg-transparent border border-white/10 text-white/50 hover:text-white hover:bg-white/5 font-medium py-4 rounded-2xl text-sm tracking-wide transition-all duration-150 active:scale-[0.98]"
              >
                ← แก้ไขวันเวลา
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ═════════════════════════════════════════════════════════════════════
          FLOATING NEXT BUTTON (Step 2 only)
         ═════════════════════════════════════════════════════════════════════ */}
      {step === 2 && selectedSlots.length > 0 && (
        <div className="sticky bottom-0 left-0 right-0 px-6 pb-6 pt-5 bg-gradient-to-t from-[#0b0f19] via-[#0b0f19]/90 to-transparent z-10">
          <button
            onClick={() => setStep(3)}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-5 rounded-2xl shadow-[0_4px_20px_rgba(34,197,94,0.35)] transition-all duration-150 active:scale-[0.98] flex justify-between items-center px-6"
          >
            <span className="flex items-center gap-3">
              <span className="text-base">ดำเนินการต่อ</span>
              <span className="text-green-200 text-xs font-medium bg-white/15 px-3 py-0.5 rounded-full">
                {selectedSlots.length} ชม.
              </span>
            </span>
            <span className="flex items-center gap-2">
              <span className="text-lg font-extrabold">฿{formatPrice(totalPrice)}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
