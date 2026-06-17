"use client";

import { useState, useEffect } from "react";

/* ── Types ── */
type BookingItem = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  price: string;
  court: { name: string };
};

type User = {
  displayName: string;
  pictureUrl: string | null;
  lineUserId: string | null;
  phone: string | null;
};

type Payment = {
  id: string;
  amount: string;
  slipUrl: string | null;
  status: string;
} | null;

type Booking = {
  id: string;
  totalPrice: string;
  status: string;
  notes: string | null;
  createdAt: string;
  user: User;
  items: BookingItem[];
  payment: Payment;
};

type StatusFilter = "all" | "pending" | "paid" | "confirmed" | "cancelled" | "completed";

/* ── Status helpers ── */
const STATUS_CONFIG: Record<string, { label: string; dotColor: string; bgColor: string; textColor: string }> = {
  pending:   { label: "รอชำระ",     dotColor: "#f59e0b", bgColor: "rgba(245,158,11,0.08)",  textColor: "#f59e0b" },
  paid:      { label: "รอตรวจสอบ",  dotColor: "#3b82f6", bgColor: "rgba(59,130,246,0.08)",  textColor: "#60a5fa" },
  confirmed: { label: "ยืนยันแล้ว", dotColor: "#10b981", bgColor: "rgba(16,185,129,0.08)",  textColor: "#34d399" },
  cancelled: { label: "ยกเลิก",     dotColor: "#ef4444", bgColor: "rgba(239,68,68,0.08)",   textColor: "#f87171" },
  completed: { label: "เสร็จสิ้น",  dotColor: "#6b7280", bgColor: "rgba(107,114,128,0.08)", textColor: "#9ca3af" },
};

const THAI_SHORT_MONTHS = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
];

function formatThaiDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getDate()} ${THAI_SHORT_MONTHS[d.getMonth()]} ${d.getFullYear() + 543}`;
}

function formatPrice(price: string | number) {
  return Number(price).toLocaleString("th-TH");
}

/* ── Component ── */
export default function AdminBookingsTable() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/bookings");
      const data = await res.json();
      if (data.bookings) setBookings(data.bookings);
    } catch {
      console.error("Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (bookingId: string, status: string) => {
    setUpdating(true);
    try {
      const res = await fetch("/api/admin/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, status }),
      });
      if (res.ok) {
        fetchBookings();
      }
    } catch {
      console.error("Failed to update status");
    } finally {
      setUpdating(false);
      setActionMenuId(null);
    }
  };

  /* ── Filtered bookings ── */
  const filtered = bookings.filter((b) => {
    if (statusFilter !== "all" && b.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = b.user.displayName.toLowerCase().includes(q);
      const matchCourt = b.items.some((item) => item.court.name.toLowerCase().includes(q));
      const matchId = b.id.toLowerCase().includes(q);
      const matchPhone = b.user.phone?.toLowerCase().includes(q);
      if (!matchName && !matchCourt && !matchId && !matchPhone) return false;
    }
    return true;
  });

  /* ── Status counts ── */
  const counts = {
    all: bookings.length,
    pending: bookings.filter((b) => b.status === "pending").length,
    paid: bookings.filter((b) => b.status === "paid").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
    completed: bookings.filter((b) => b.status === "completed").length,
  };

  const filterTabs: { key: StatusFilter; label: string }[] = [
    { key: "all", label: "ทั้งหมด" },
    { key: "pending", label: "รอชำระ" },
    { key: "paid", label: "รอตรวจสอบ" },
    { key: "confirmed", label: "ยืนยันแล้ว" },
    { key: "completed", label: "เสร็จสิ้น" },
    { key: "cancelled", label: "ยกเลิก" },
  ];

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#ffffff", marginBottom: "0.25rem" }}>
          📋 รายการจองทั้งหมด
        </h2>
        <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)" }}>
          ดูและจัดการรายการจองสนามฟุตบอลทั้งหมดของระบบ
        </p>
      </div>

      {/* Search + Filters */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.5rem" }}>
        {/* Search bar */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "12px",
          padding: "0.6rem 1rem",
        }}>
          <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "1.1rem" }}>🔍</span>
          <input
            type="text"
            placeholder="ค้นหาชื่อลูกค้า, สนาม, เบอร์โทร..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: "transparent",
              border: "none",
              outline: "none",
              color: "#fff",
              fontSize: "0.85rem",
              width: "100%",
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: "0.85rem" }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Status filter tabs */}
        <div className="admin-scroll" style={{ display: "flex", gap: "0.4rem", overflowX: "auto", paddingBottom: "0.25rem" }}>
          {filterTabs.map((tab) => {
            const isActive = statusFilter === tab.key;
            const count = counts[tab.key];
            return (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  padding: "0.45rem 0.85rem",
                  borderRadius: "8px",
                  border: isActive ? "1px solid rgba(99,102,241,0.4)" : "1px solid rgba(255,255,255,0.05)",
                  background: isActive ? "rgba(99,102,241,0.1)" : "rgba(255,255,255,0.01)",
                  color: isActive ? "#a5b4fc" : "rgba(255,255,255,0.5)",
                  fontSize: "0.75rem",
                  fontWeight: isActive ? 700 : 500,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  transition: "all 0.2s",
                }}
              >
                {tab.label}
                <span style={{
                  background: isActive ? "rgba(99,102,241,0.25)" : "rgba(255,255,255,0.05)",
                  padding: "0.1rem 0.4rem",
                  borderRadius: "6px",
                  fontSize: "0.65rem",
                  fontWeight: 700,
                }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
          <div style={{ width: "32px", height: "32px", border: "4px solid #6366f1", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
        </div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <div style={{
          background: "rgba(255,255,255,0.01)",
          border: "1px solid rgba(255,255,255,0.04)",
          borderRadius: "20px",
          padding: "3rem",
          textAlign: "center",
          color: "rgba(255,255,255,0.35)",
          fontSize: "0.85rem",
        }}>
          {searchQuery || statusFilter !== "all"
            ? "ไม่พบรายการจองที่ตรงกับเงื่อนไข"
            : "ยังไม่มีรายการจองในระบบ"}
        </div>
      )}

      {/* Table — Desktop */}
      {!loading && filtered.length > 0 && (
        <>
          {/* Desktop table view */}
          <div className="hidden md:block" style={{
            background: "rgba(255,255,255,0.01)",
            border: "1px solid rgba(255,255,255,0.04)",
            borderRadius: "20px",
            overflow: "hidden",
          }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  {["ลูกค้า", "สนาม / วันที่", "เวลา", "ราคารวม", "สถานะ", "จัดการ"].map((h) => (
                    <th key={h} style={{
                      padding: "0.85rem 1rem",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      color: "rgba(255,255,255,0.35)",
                      textAlign: "left",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((booking) => {
                  const sc = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;
                  const firstItem = booking.items[0];
                  const isOffline = booking.user.lineUserId?.startsWith("offline_");

                  return (
                    <tr
                      key={booking.id}
                      style={{
                        borderBottom: "1px solid rgba(255,255,255,0.03)",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      {/* Customer */}
                      <td style={{ padding: "0.85rem 1rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                          <div style={{
                            width: "34px",
                            height: "34px",
                            borderRadius: "10px",
                            background: isOffline ? "rgba(245,158,11,0.1)" : "rgba(99,102,241,0.1)",
                            border: `1px solid ${isOffline ? "rgba(245,158,11,0.2)" : "rgba(99,102,241,0.2)"}`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.8rem",
                            flexShrink: 0,
                            overflow: "hidden",
                          }}>
                            {booking.user.pictureUrl ? (
                              <img src={booking.user.pictureUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            ) : (
                              isOffline ? "📞" : "👤"
                            )}
                          </div>
                          <div>
                            <p style={{ fontSize: "0.85rem", fontWeight: 700, color: "#fff" }}>{booking.user.displayName}</p>
                            {booking.user.phone && (
                              <p style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.35)" }}>{booking.user.phone}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Court / Date */}
                      <td style={{ padding: "0.85rem 1rem" }}>
                        {firstItem && (
                          <>
                            <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "#fff" }}>{firstItem.court.name}</p>
                            <p style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)" }}>{formatThaiDate(firstItem.date)}</p>
                          </>
                        )}
                      </td>

                      {/* Time */}
                      <td style={{ padding: "0.85rem 1rem" }}>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
                          {booking.items.map((item) => (
                            <span key={item.id} style={{
                              fontSize: "0.7rem",
                              fontWeight: 600,
                              padding: "0.15rem 0.45rem",
                              borderRadius: "5px",
                              background: "rgba(255,255,255,0.03)",
                              border: "1px solid rgba(255,255,255,0.06)",
                              color: "rgba(255,255,255,0.7)",
                            }}>
                              {item.startTime}–{item.endTime}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Total Price */}
                      <td style={{ padding: "0.85rem 1rem" }}>
                        <span style={{ fontSize: "0.9rem", fontWeight: 800, color: "#a5b4fc" }}>
                          ฿{formatPrice(booking.totalPrice)}
                        </span>
                      </td>

                      {/* Status */}
                      <td style={{ padding: "0.85rem 1rem" }}>
                        <span style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.3rem",
                          padding: "0.25rem 0.65rem",
                          borderRadius: "6px",
                          fontSize: "0.7rem",
                          fontWeight: 700,
                          background: sc.bgColor,
                          color: sc.textColor,
                        }}>
                          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: sc.dotColor }} />
                          {sc.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: "0.85rem 1rem", position: "relative" }}>
                        <button
                          onClick={() => setActionMenuId(actionMenuId === booking.id ? null : booking.id)}
                          style={{
                            background: "rgba(255,255,255,0.03)",
                            border: "1px solid rgba(255,255,255,0.06)",
                            borderRadius: "8px",
                            padding: "0.35rem 0.6rem",
                            cursor: "pointer",
                            color: "rgba(255,255,255,0.5)",
                            fontSize: "0.85rem",
                          }}
                        >
                          ⋮
                        </button>

                        {/* Action menu dropdown */}
                        {actionMenuId === booking.id && (
                          <div style={{
                            position: "absolute",
                            right: "1rem",
                            top: "100%",
                            zIndex: 60,
                            background: "#0d1117",
                            border: "1px solid rgba(255,255,255,0.08)",
                            borderRadius: "12px",
                            padding: "0.35rem",
                            minWidth: "160px",
                            boxShadow: "0 12px 32px rgba(0,0,0,0.5)",
                          }}>
                            {booking.status !== "confirmed" && (
                              <button onClick={() => updateStatus(booking.id, "confirmed")} disabled={updating} style={menuBtnStyle("#10b981")}>
                                ✅ ยืนยัน
                              </button>
                            )}
                            {booking.status !== "completed" && booking.status !== "cancelled" && (
                              <button onClick={() => updateStatus(booking.id, "completed")} disabled={updating} style={menuBtnStyle("#6b7280")}>
                                ✔️ เสร็จสิ้น
                              </button>
                            )}
                            {booking.status !== "cancelled" && (
                              <button onClick={() => updateStatus(booking.id, "cancelled")} disabled={updating} style={menuBtnStyle("#ef4444")}>
                                ❌ ยกเลิก
                              </button>
                            )}
                            <button
                              onClick={() => setActionMenuId(null)}
                              style={{ ...menuBtnStyle("rgba(255,255,255,0.4)"), borderTop: "1px solid rgba(255,255,255,0.05)", marginTop: "0.2rem", paddingTop: "0.5rem" }}
                            >
                              ปิดเมนู
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile card view */}
          <div className="md:hidden" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {filtered.map((booking) => {
              const sc = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;
              const firstItem = booking.items[0];
              const isOffline = booking.user.lineUserId?.startsWith("offline_");
              const isExpanded = expandedId === booking.id;

              return (
                <div
                  key={booking.id}
                  style={{
                    background: "rgba(255,255,255,0.01)",
                    border: "1px solid rgba(255,255,255,0.04)",
                    borderRadius: "16px",
                    overflow: "hidden",
                  }}
                >
                  {/* Card header — always visible */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : booking.id)}
                    style={{
                      width: "100%",
                      padding: "1rem",
                      background: "none",
                      border: "none",
                      color: "inherit",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <div style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "8px",
                          background: isOffline ? "rgba(245,158,11,0.1)" : "rgba(99,102,241,0.1)",
                          border: `1px solid ${isOffline ? "rgba(245,158,11,0.2)" : "rgba(99,102,241,0.2)"}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.75rem",
                          flexShrink: 0,
                          overflow: "hidden",
                        }}>
                          {booking.user.pictureUrl ? (
                            <img src={booking.user.pictureUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : (
                            isOffline ? "📞" : "👤"
                          )}
                        </div>
                        <div>
                          <p style={{ fontSize: "0.85rem", fontWeight: 700, color: "#fff" }}>{booking.user.displayName}</p>
                          {firstItem && (
                            <p style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)" }}>
                              {firstItem.court.name} · {formatThaiDate(firstItem.date)}
                            </p>
                          )}
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.25rem" }}>
                        <span style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.25rem",
                          padding: "0.2rem 0.5rem",
                          borderRadius: "6px",
                          fontSize: "0.65rem",
                          fontWeight: 700,
                          background: sc.bgColor,
                          color: sc.textColor,
                        }}>
                          <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: sc.dotColor }} />
                          {sc.label}
                        </span>
                        <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "#a5b4fc" }}>฿{formatPrice(booking.totalPrice)}</span>
                      </div>
                    </div>

                    {/* Time slots */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem" }}>
                      {booking.items.map((item) => (
                        <span key={item.id} style={{
                          fontSize: "0.65rem",
                          fontWeight: 600,
                          padding: "0.15rem 0.4rem",
                          borderRadius: "5px",
                          background: "rgba(255,255,255,0.03)",
                          border: "1px solid rgba(255,255,255,0.06)",
                          color: "rgba(255,255,255,0.6)",
                        }}>
                          {item.startTime}–{item.endTime}
                        </span>
                      ))}
                    </div>
                  </button>

                  {/* Expanded actions */}
                  {isExpanded && (
                    <div style={{
                      borderTop: "1px solid rgba(255,255,255,0.04)",
                      padding: "0.75rem 1rem",
                      display: "flex",
                      gap: "0.4rem",
                      flexWrap: "wrap",
                    }}>
                      {booking.user.phone && (
                        <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.45)", padding: "0.3rem 0.6rem", background: "rgba(255,255,255,0.02)", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.04)" }}>
                          📞 {booking.user.phone}
                        </span>
                      )}
                      {booking.notes && (
                        <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.45)", padding: "0.3rem 0.6rem", background: "rgba(255,255,255,0.02)", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.04)", width: "100%" }}>
                          📝 {booking.notes}
                        </span>
                      )}
                      <div style={{ display: "flex", gap: "0.4rem", width: "100%", marginTop: "0.35rem" }}>
                        {booking.status !== "confirmed" && (
                          <button
                            onClick={() => updateStatus(booking.id, "confirmed")}
                            disabled={updating}
                            style={{
                              flex: 1,
                              padding: "0.5rem",
                              borderRadius: "8px",
                              border: "none",
                              background: "rgba(16,185,129,0.1)",
                              color: "#34d399",
                              fontSize: "0.75rem",
                              fontWeight: 700,
                              cursor: "pointer",
                            }}
                          >
                            ✅ ยืนยัน
                          </button>
                        )}
                        {booking.status !== "completed" && booking.status !== "cancelled" && (
                          <button
                            onClick={() => updateStatus(booking.id, "completed")}
                            disabled={updating}
                            style={{
                              flex: 1,
                              padding: "0.5rem",
                              borderRadius: "8px",
                              border: "none",
                              background: "rgba(107,114,128,0.1)",
                              color: "#9ca3af",
                              fontSize: "0.75rem",
                              fontWeight: 700,
                              cursor: "pointer",
                            }}
                          >
                            ✔️ เสร็จสิ้น
                          </button>
                        )}
                        {booking.status !== "cancelled" && (
                          <button
                            onClick={() => updateStatus(booking.id, "cancelled")}
                            disabled={updating}
                            style={{
                              flex: 1,
                              padding: "0.5rem",
                              borderRadius: "8px",
                              border: "none",
                              background: "rgba(239,68,68,0.08)",
                              color: "#f87171",
                              fontSize: "0.75rem",
                              fontWeight: 700,
                              cursor: "pointer",
                            }}
                          >
                            ❌ ยกเลิก
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Results summary */}
          <div style={{
            marginTop: "1rem",
            fontSize: "0.7rem",
            color: "rgba(255,255,255,0.3)",
            textAlign: "center",
          }}>
            แสดง {filtered.length} จาก {bookings.length} รายการ
          </div>
        </>
      )}
    </div>
  );
}

/* ── Dropdown menu button style helper ── */
function menuBtnStyle(color: string): React.CSSProperties {
  return {
    display: "flex",
    alignItems: "center",
    gap: "0.4rem",
    width: "100%",
    padding: "0.45rem 0.7rem",
    background: "transparent",
    border: "none",
    borderRadius: "8px",
    color,
    fontSize: "0.8rem",
    fontWeight: 600,
    cursor: "pointer",
    textAlign: "left" as const,
    transition: "background 0.15s",
  };
}
