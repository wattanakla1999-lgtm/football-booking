"use client";

import { useState, useEffect } from "react";

type OperatingHourRow = {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
};

const DAY_NAMES = [
  { name: "วันอาทิตย์", color: "#ef4444" },   // Red
  { name: "วันจันทร์", color: "#eab308" },   // Yellow
  { name: "วันอังคาร", color: "#ec4899" },   // Pink
  { name: "วันพุธ", color: "#22c55e" },      // Green
  { name: "วันพฤหัสบดี", color: "#f97316" },  // Orange
  { name: "วันศุกร์", color: "#3b82f6" },     // Blue
  { name: "วันเสาร์", color: "#a855f7" },    // Purple
];

export default function OperatingHoursView() {
  const [hours, setHours] = useState<OperatingHourRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOperatingHours();
  }, []);

  const fetchOperatingHours = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/operating-hours");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      if (data.operatingHours) {
        const items = [...data.operatingHours];
        const completeHours: OperatingHourRow[] = [];
        for (let i = 0; i < 7; i++) {
          const matched = items.find((item) => item.dayOfWeek === i);
          if (matched) {
            completeHours.push({
              dayOfWeek: matched.dayOfWeek,
              openTime: matched.openTime,
              closeTime: matched.closeTime,
              isClosed: matched.isClosed,
            });
          } else {
            completeHours.push({
              dayOfWeek: i,
              openTime: "08:00",
              closeTime: "22:00",
              isClosed: false,
            });
          }
        }
        setHours(completeHours);
      }
    } catch (err) {
      console.error(err);
      setError("ไม่สามารถดึงข้อมูลเวลาทำการได้");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleClosed = (index: number) => {
    setHours((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, isClosed: !item.isClosed } : item))
    );
  };

  const handleTimeChange = (index: number, field: "openTime" | "closeTime", value: string) => {
    setHours((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item))
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const res = await fetch("/api/admin/operating-hours", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hours }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }

      setMessage("บันทึกเวลาเปิด-ปิดทำการสำเร็จ! 🎉");
      setTimeout(() => setMessage(""), 3000);
      fetchOperatingHours();
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาด");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: "24px", padding: "1.5rem" }}>
      <h2 style={{ fontSize: "1.05rem", fontWeight: 800, marginBottom: "0.4rem", color: "#ffffff" }}>⚙️ ตั้งค่าเวลาทำการทั่วไป</h2>
      <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.45)", marginBottom: "1.5rem" }}>
        แก้ไขเวลาเปิดและปิดให้บริการในแต่ละวันของสัปดาห์ หากเลือกปิดให้บริการ ระบบจะปิดรับจองในวันดังกล่าวทันที
      </p>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
          <div style={{ width: "32px", height: "32px", border: "4px solid #6366f1", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
        </div>
      ) : (
        <form onSubmit={handleSave}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.5rem" }}>
            {hours.map((row, index) => {
              const day = DAY_NAMES[row.dayOfWeek];
              return (
                <div
                  key={row.dayOfWeek}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "1rem",
                    borderRadius: "16px",
                    background: row.isClosed ? "rgba(239, 68, 68, 0.02)" : "rgba(255,255,255,0.01)",
                    border: row.isClosed ? "1px solid rgba(239, 68, 68, 0.08)" : "1px solid rgba(255,255,255,0.03)",
                    flexWrap: "wrap",
                    gap: "1rem",
                    transition: "all 0.2s",
                  }}
                >
                  {/* Day Info */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", minWidth: "140px" }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: day.color }} />
                    <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "#fff" }}>{day.name}</span>
                  </div>

                  {/* Switch Toggle */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <input
                      type="checkbox"
                      id={`day-toggle-${row.dayOfWeek}`}
                      checked={!row.isClosed}
                      onChange={() => handleToggleClosed(index)}
                      style={{
                        width: "18px",
                        height: "18px",
                        accentColor: "#10b981",
                        cursor: "pointer",
                      }}
                    />
                    <label
                      htmlFor={`day-toggle-${row.dayOfWeek}`}
                      style={{
                        fontSize: "0.8rem",
                        color: row.isClosed ? "#ef4444" : "#10b981",
                        fontWeight: 700,
                        cursor: "pointer",
                        minWidth: "80px",
                      }}
                    >
                      {row.isClosed ? "ปิดบริการ ✕" : "เปิดบริการ ✓"}
                    </label>
                  </div>

                  {/* Hours Selection */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)" }}>ตั้งแต่:</span>
                    <input
                      type="time"
                      disabled={row.isClosed}
                      value={row.openTime}
                      onChange={(e) => handleTimeChange(index, "openTime", e.target.value)}
                      className="admin-input"
                      style={{
                        padding: "0.4rem 0.6rem",
                        width: "auto",
                        color: row.isClosed ? "rgba(255,255,255,0.2)" : "#fff",
                      }}
                    />
                    <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)" }}>ถึง:</span>
                    <input
                      type="time"
                      disabled={row.isClosed}
                      value={row.closeTime}
                      onChange={(e) => handleTimeChange(index, "closeTime", e.target.value)}
                      className="admin-input"
                      style={{
                        padding: "0.4rem 0.6rem",
                        width: "auto",
                        color: row.isClosed ? "rgba(255,255,255,0.2)" : "#fff",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Feedback message */}
          {message && (
            <div style={{ color: "#10b981", fontSize: "0.8rem", background: "rgba(16, 185, 129, 0.08)", padding: "0.75rem", borderRadius: "10px", marginBottom: "1rem", border: "1px solid rgba(16, 185, 129, 0.15)" }}>
              {message}
            </div>
          )}

          {error && (
            <div style={{ color: "#ef4444", fontSize: "0.8rem", background: "rgba(239, 68, 68, 0.08)", padding: "0.75rem", borderRadius: "10px", marginBottom: "1rem", border: "1px solid rgba(239, 68, 68, 0.15)" }}>
              ⚠️ {error}
            </div>
          )}

          {/* Save Button */}
          <button
            type="submit"
            disabled={saving}
            className="admin-btn admin-btn-primary"
            style={{
              width: "100%",
              padding: "0.85rem",
              borderRadius: "12px",
              fontSize: "0.85rem",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              boxShadow: "0 4px 16px rgba(99, 102, 241, 0.2)"
            }}
          >
            {saving ? "กำลังบันทึก..." : "💾 บันทึกเวลาเปิด-ปิดทั้งหมด"}
          </button>
        </form>
      )}
    </div>
  );
}
