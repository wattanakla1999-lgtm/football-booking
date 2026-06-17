"use client";

import { useState, useEffect } from "react";

type Slot = {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  bookedBy: string | null;
  customerPhone: string | null;
  bookingStatus: string | null;
  bookingId: string | null;
  notes: string | null;
};

type CourtAvailability = {
  id: string;
  name: string;
  slots: Slot[];
};

const THAI_SHORT_DAYS = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];
const THAI_SHORT_MONTHS = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
];

export default function AdminAvailabilityView() {
  const [mounted, setMounted] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [courts, setCourts] = useState<CourtAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // Booking states
  const [selectedCourtId, setSelectedCourtId] = useState<string | null>(null);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [selectedBookedSlot, setSelectedBookedSlot] = useState<(Slot & { courtName: string }) | null>(null);

  // Set mounted + initial date on client only
  useEffect(() => {
    setSelectedDate(new Date());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!selectedDate) return;
    fetchAvailability();
    // Reset selection when date changes
    setSelectedCourtId(null);
    setSelectedSlots([]);
  }, [selectedDate]);

  const fetchAvailability = async () => {
    if (!selectedDate) return;
    setLoading(true);
    setMessage("");
    try {
      const dateStr = selectedDate.toISOString().split("T")[0];
      const res = await fetch(`/api/admin/availability?date=${dateStr}`);
      const data = await res.json();
      if (data.courts) {
        setCourts(data.courts);
      } else {
        setCourts([]);
      }
      if (data.message) setMessage(data.message);
    } catch {
      setMessage("เกิดข้อผิดพลาดในการดึงข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  // Generate next 14 days (only used after mount)
  const dates: Date[] = [];
  if (mounted) {
    for (let i = 0; i < 14; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      dates.push(d);
    }
  }

  // Color config representing states: Green = Free, Yellow = Pending, Blue = Paid, Red = Confirmed/Locked
  const statusColor = (status: string | null) => {
    switch (status) {
      case "pending":
        return { bg: "rgba(245, 158, 11, 0.08)", border: "rgba(245, 158, 11, 0.25)", text: "#f59e0b" };
      case "paid":
        return { bg: "rgba(59, 130, 246, 0.08)", border: "rgba(59, 130, 246, 0.25)", text: "#60a5fa" };
      case "confirmed":
        return { bg: "rgba(239, 68, 68, 0.08)", border: "rgba(239, 68, 68, 0.25)", text: "#f87171" };
      case "completed":
        return { bg: "rgba(255, 255, 255, 0.03)", border: "rgba(255, 255, 255, 0.1)", text: "rgba(255, 255, 255, 0.4)" };
      default:
        return { bg: "rgba(255, 255, 255, 0.02)", border: "rgba(255, 255, 255, 0.05)", text: "rgba(255, 255, 255, 0.4)" };
    }
  };

  const handleSlotClick = (courtId: string, courtName: string, slot: Slot) => {
    if (!slot.isAvailable) {
      setSelectedBookedSlot({ ...slot, courtName });
      return;
    }

    if (selectedCourtId !== courtId) {
      // Switch court selection
      setSelectedCourtId(courtId);
      setSelectedSlots([slot.startTime]);
    } else {
      // Toggle slot in the same court
      if (selectedSlots.includes(slot.startTime)) {
        const nextSlots = selectedSlots.filter((t) => t !== slot.startTime);
        setSelectedSlots(nextSlots);
        if (nextSlots.length === 0) {
          setSelectedCourtId(null);
        }
      } else {
        setSelectedSlots([...selectedSlots, slot.startTime]);
      }
    }
  };

  const selectedCourt = courts.find((c) => c.id === selectedCourtId);

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourtId || selectedSlots.length === 0 || !customerName) {
      setSubmitError("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const courtSlots = selectedCourt?.slots.filter((s) => selectedSlots.includes(s.startTime)) || [];
      const res = await fetch("/api/admin/bookings/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courtId: selectedCourtId,
          date: selectedDate!.toISOString().split("T")[0],
          slots: courtSlots,
          customerName,
          customerPhone,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "ไม่สามารถทำรายการจองได้");
      }

      // Success
      alert("บันทึกการจองสำเร็จ!");
      setShowModal(false);
      setCustomerName("");
      setCustomerPhone("");
      setSelectedSlots([]);
      setSelectedCourtId(null);
      fetchAvailability();
    } catch (err: any) {
      setSubmitError(err.message || "เกิดข้อผิดพลาด");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading placeholder during SSR / before mount
  if (!mounted || !selectedDate) {
    return (
      <div style={{ position: "relative", minHeight: "60vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div style={{ width: "32px", height: "32px", border: "4px solid #6366f1", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
      </div>
    );
  }

  return (
    <div style={{ position: "relative", minHeight: "60vh" }}>
      {/* Date Selector */}
      <div
        className="admin-scroll"
        style={{
          display: "flex",
          gap: "0.5rem",
          overflowX: "auto",
          paddingBottom: "0.75rem",
          marginBottom: "2rem",
          borderBottom: "1px solid rgba(255,255,255,0.03)"
        }}
      >
        {dates.map((d, i) => {
          const isSelected = d.toDateString() === selectedDate.toDateString();
          const dayName = THAI_SHORT_DAYS[d.getDay()];
          const dateNum = d.getDate();
          const monthName = THAI_SHORT_MONTHS[d.getMonth()];

          return (
            <button
              key={i}
              onClick={() => setSelectedDate(d)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minWidth: "4.5rem",
                height: "5rem",
                borderRadius: "16px",
                border: isSelected ? "1px solid #6366f1" : "1px solid rgba(255,255,255,0.05)",
                background: isSelected ? "rgba(99,102,241,0.08)" : "rgba(255,255,255,0.01)",
                color: isSelected ? "#a5b4fc" : "rgba(255,255,255,0.45)",
                cursor: "pointer",
                transition: "all 0.2s ease",
                gap: "0.15rem",
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: "0.65rem", fontWeight: 500 }}>{dayName}</span>
              <span style={{ fontSize: "1.3rem", fontWeight: 800 }}>{dateNum}</span>
              <span style={{ fontSize: "0.6rem" }}>{monthName}</span>
            </button>
          );
        })}
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
          <div style={{ width: "32px", height: "32px", border: "4px solid #6366f1", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
        </div>
      )}

      {/* Closed Message */}
      {!loading && message && courts.length === 0 && (
        <div
          style={{
            background: "rgba(255,255,255,0.01)",
            border: "1px solid rgba(255,255,255,0.04)",
            borderRadius: "24px",
            padding: "3rem",
            textAlign: "center",
            color: "rgba(255,255,255,0.35)",
            fontSize: "0.85rem",
          }}
        >
          {message}
        </div>
      )}

      {/* Availability Grid */}
      {!loading && courts.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", paddingBottom: selectedSlots.length > 0 ? "90px" : "0" }}>
          {courts.map((court) => {
            const availableCount = court.slots.filter((s) => s.isAvailable).length;
            const totalCount = court.slots.length;

            return (
              <div
                key={court.id}
                style={{
                  background: "rgba(255,255,255,0.01)",
                  border: "1px solid rgba(255,255,255,0.04)",
                  borderRadius: "24px",
                  padding: "1.5rem",
                }}
              >
                {/* Court Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                  <h3 style={{ fontWeight: 800, fontSize: "1.05rem", color: "#ffffff" }}>{court.name}</h3>
                  <span style={{ fontSize: "0.75rem", color: availableCount > 0 ? "#10b981" : "#ef4444", fontWeight: 700 }}>
                    ว่าง {availableCount}/{totalCount} ช่วง
                  </span>
                </div>

                {/* Time Slots Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: "0.6rem" }}>
                  {court.slots.map((slot) => {
                    const sc = statusColor(slot.bookingStatus);
                    const isSelected = selectedCourtId === court.id && selectedSlots.includes(slot.startTime);

                    return (
                      <button
                        key={slot.startTime}
                        onClick={() => handleSlotClick(court.id, court.name, slot)}
                        className="admin-slot-btn"
                        style={{
                          textAlign: "left",
                          border: isSelected
                            ? "1px solid #6366f1"
                            : slot.isAvailable
                            ? "1px solid rgba(16,185,129,0.2)"
                            : `1px solid ${sc.border}`,
                          background: isSelected
                            ? "rgba(99,102,241,0.12)"
                            : slot.isAvailable
                            ? "rgba(16,185,129,0.03)"
                            : sc.bg,
                          cursor: slot.isAvailable ? "pointer" : "default",
                          width: "100%",
                          color: "inherit",
                        }}
                      >
                        <div style={{
                          fontWeight: 700,
                          marginBottom: slot.bookedBy ? "0.25rem" : 0,
                          color: isSelected ? "#c7d2fe" : slot.isAvailable ? "#10b981" : sc.text
                        }}>
                          {slot.startTime} - {slot.endTime}
                        </div>
                        {slot.isAvailable ? (
                          <span style={{ fontSize: "0.7rem", color: isSelected ? "#a5b4fc" : "rgba(16,185,129,0.65)" }}>
                            {isSelected ? "● เลือกแล้ว" : "✓ ว่าง"}
                          </span>
                        ) : (
                          <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            👤 {slot.bookedBy}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Action Bar */}
      {selectedSlots.length > 0 && selectedCourt && (
        <div className="admin-floating-bar">
          <div>
            <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>{selectedCourt.name}</p>
            <p style={{ fontSize: "0.95rem", fontWeight: 800, color: "#ffffff" }}>เลือก {selectedSlots.length} ช่วงเวลา</p>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              onClick={() => {
                setSelectedSlots([]);
                setSelectedCourtId(null);
              }}
              style={{
                background: "transparent",
                border: "none",
                color: "rgba(255,255,255,0.5)",
                fontSize: "0.85rem",
                padding: "0.5rem 1rem",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              ยกเลิก
            </button>
            <button
              onClick={() => setShowModal(true)}
              style={{
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                border: "none",
                borderRadius: "10px",
                color: "#fff",
                fontWeight: 700,
                fontSize: "0.85rem",
                padding: "0.5rem 1.25rem",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(99, 102, 241, 0.25)",
              }}
            >
              จองสนาม (Admin)
            </button>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {showModal && selectedCourt && (
        <div className="admin-modal-backdrop"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: "1rem",
          }}
        >
          <div className="admin-modal-content" style={{ padding: "1.75rem", width: "100%", maxWidth: "440px" }}>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 800, marginBottom: "0.4rem", color: "#ffffff" }}>📝 จองสนาม (เคสโทรเข้า / Walk-in)</h3>
            <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.45)", marginBottom: "1.25rem" }}>
              บันทึกการจองโดยผู้ดูแลระบบ คิวจะได้รับการยืนยันทันที
            </p>

            {/* Selection Summary */}
            <div style={{ background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: "14px", padding: "0.85rem 1rem", marginBottom: "1.25rem", fontSize: "0.8rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                <span style={{ color: "rgba(255,255,255,0.4)" }}>สนาม:</span>
                <span style={{ fontWeight: 700, color: "#fff" }}>{selectedCourt.name}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                <span style={{ color: "rgba(255,255,255,0.4)" }}>วันที่:</span>
                <span style={{ fontWeight: 700, color: "#fff" }}>{selectedDate.toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" })}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "rgba(255,255,255,0.4)" }}>ช่วงเวลา:</span>
                <span style={{ fontWeight: 700, color: "#a5b4fc" }}>
                  {selectedSlots.sort().join(", ")}
                </span>
              </div>
            </div>

            <form onSubmit={handleCreateBooking} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", marginBottom: "0.4rem", fontWeight: 600 }}>
                  ชื่อลูกค้า *
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น สมชาย โทรจอง"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="admin-input"
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", marginBottom: "0.4rem", fontWeight: 600 }}>
                  เบอร์โทรศัพท์ (ไม่บังคับ)
                </label>
                <input
                  type="tel"
                  placeholder="เช่น 0812345678"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="admin-input"
                />
              </div>

              {submitError && (
                <div style={{ color: "#ef4444", fontSize: "0.75rem", background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.15)", padding: "0.6rem", borderRadius: "8px" }}>
                  ⚠️ {submitError}
                </div>
              )}

              <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setSubmitError("");
                  }}
                  disabled={isSubmitting}
                  className="admin-btn admin-btn-secondary"
                  style={{ flex: 1, padding: "0.7rem" }}
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="admin-btn admin-btn-primary"
                  style={{ flex: 1, padding: "0.7rem", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", boxShadow: "0 4px 12px rgba(99, 102, 241, 0.2)" }}
                >
                  {isSubmitting ? "กำลังบันทึก..." : "ยืนยันการจอง"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Booked Slot Details Modal */}
      {selectedBookedSlot && (
        <div className="admin-modal-backdrop"
          style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 100, padding: "1rem",
            backgroundColor: "rgba(0, 0, 0, 0.6)"
          }}
          onClick={() => setSelectedBookedSlot(null)}
        >
          <div className="admin-modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: "1.75rem", width: "100%", maxWidth: "400px", borderRadius: "20px", background: "#111827", border: "1px solid rgba(255,255,255,0.1)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem" }}>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#ffffff" }}>รายละเอียดการจอง</h3>
              <button onClick={() => setSelectedBookedSlot(null)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: "1.25rem", padding: "0" }}>&times;</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem", fontSize: "0.85rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "0.8rem", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <span style={{ color: "rgba(255,255,255,0.4)" }}>ชื่อผู้จอง</span>
                <span style={{ fontWeight: 700, color: "#fff" }}>{selectedBookedSlot.bookedBy || "ไม่ระบุ"}</span>
              </div>
              
              <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "0.8rem", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <span style={{ color: "rgba(255,255,255,0.4)" }}>เบอร์โทรศัพท์</span>
                <span style={{ fontWeight: 700, color: "#fff" }}>{selectedBookedSlot.customerPhone || "ไม่ระบุ"}</span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "0.8rem", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <span style={{ color: "rgba(255,255,255,0.4)" }}>สนาม</span>
                <span style={{ fontWeight: 700, color: "#fff" }}>{selectedBookedSlot.courtName}</span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "0.8rem", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <span style={{ color: "rgba(255,255,255,0.4)" }}>เวลา</span>
                <span style={{ fontWeight: 700, color: "#a5b4fc" }}>{selectedBookedSlot.startTime} - {selectedBookedSlot.endTime}</span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "0.8rem", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <span style={{ color: "rgba(255,255,255,0.4)" }}>สถานะ</span>
                <span style={{ fontWeight: 700, color: statusColor(selectedBookedSlot.bookingStatus).text }}>
                  {selectedBookedSlot.bookingStatus === "pending" ? "รอดำเนินการ" :
                   selectedBookedSlot.bookingStatus === "paid" ? "รอตรวจสอบสลิป" :
                   selectedBookedSlot.bookingStatus === "confirmed" ? "ยืนยันแล้ว" :
                   selectedBookedSlot.bookingStatus === "completed" ? "เสร็จสิ้น" :
                   selectedBookedSlot.bookingStatus}
                </span>
              </div>

              {selectedBookedSlot.notes && (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", paddingTop: "0.4rem" }}>
                  <span style={{ color: "rgba(255,255,255,0.4)" }}>หมายเหตุ</span>
                  <div style={{ background: "rgba(255,255,255,0.03)", padding: "0.75rem", borderRadius: "8px", color: "rgba(255,255,255,0.8)", lineHeight: "1.5" }}>
                    {selectedBookedSlot.notes}
                  </div>
                </div>
              )}
            </div>

            <div style={{ marginTop: "1.5rem" }}>
               <a 
                 href="/admin/all-bookings"
                 style={{ 
                   display: "block", textAlign: "center", width: "100%", padding: "0.75rem",
                   background: "rgba(255,255,255,0.05)", borderRadius: "10px", color: "#fff",
                   textDecoration: "none", fontSize: "0.85rem", fontWeight: 600, transition: "all 0.2s"
                 }}
               >
                 ดูการจองทั้งหมด
               </a>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      {!loading && courts.length > 0 && (
        <div style={{ display: "flex", gap: "1rem", marginTop: "2rem", flexWrap: "wrap", borderTop: "1px solid rgba(255,255,255,0.03)", paddingTop: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", fontSize: "0.7rem", color: "rgba(255,255,255,0.4)" }}>
            <div style={{ width: "12px", height: "12px", borderRadius: "4px", background: "rgba(16,185,129,0.03)", border: "1px solid rgba(16,185,129,0.3)" }} /> ว่าง
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", fontSize: "0.7rem", color: "rgba(255,255,255,0.4)" }}>
            <div style={{ width: "12px", height: "12px", borderRadius: "4px", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.3)" }} /> รอดำเนินการ (รอจ่ายเงิน)
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", fontSize: "0.7rem", color: "rgba(255,255,255,0.4)" }}>
            <div style={{ width: "12px", height: "12px", borderRadius: "4px", background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.3)" }} /> รอตรวจสอบ (โอนแล้ว)
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", fontSize: "0.7rem", color: "rgba(255,255,255,0.4)" }}>
            <div style={{ width: "12px", height: "12px", borderRadius: "4px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)" }} /> ยืนยันแล้ว / จองแล้ว
          </div>
        </div>
      )}
    </div>
  );
}
