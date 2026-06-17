"use client";

import { useState, useEffect } from "react";

type CourtImage = {
  id: string;
  url: string;
};

type Court = {
  id: string;
  name: string;
  description: string | null;
  surface: string | null;
  maxPlayers: number | null;
  pricePerHour: string;
  isActive: boolean;
  images: CourtImage[];
};

export default function CourtsListView() {
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingCourt, setEditingCourt] = useState<Court | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [pricePerHour, setPricePerHour] = useState("");
  const [maxPlayers, setMaxPlayers] = useState("");
  const [surface, setSurface] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCourts();
  }, []);

  const fetchCourts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/courts");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      if (data.courts) setCourts(data.courts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingCourt(null);
    setName("");
    setPricePerHour("");
    setMaxPlayers("");
    setSurface("Artificial Grass");
    setImageUrl("https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=600&auto=format&fit=crop");
    setDescription("");
    setIsActive(true);
    setError("");
    setShowModal(true);
  };

  const openEditModal = (court: Court) => {
    setEditingCourt(court);
    setName(court.name);
    setPricePerHour(court.pricePerHour);
    setMaxPlayers(court.maxPlayers ? court.maxPlayers.toString() : "");
    setSurface(court.surface || "");
    setImageUrl(court.images[0]?.url || "");
    setDescription(court.description || "");
    setIsActive(court.isActive);
    setError("");
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !pricePerHour) {
      setError("กรุณากรอกชื่อสนามและราคา");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const url = "/api/admin/courts";
      const method = editingCourt ? "PATCH" : "POST";
      const payload = {
        courtId: editingCourt?.id,
        name,
        pricePerHour,
        maxPlayers: maxPlayers ? parseInt(maxPlayers) : null,
        surface,
        imageUrl,
        description,
        isActive,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }

      alert("บันทึกข้อมูลสนามบอลสำเร็จ!");
      setShowModal(false);
      fetchCourts();
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาด");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (courtId: string, courtName: string) => {
    if (!confirm(`คุณแน่ใจหรือไม่ที่จะลบสนาม "${courtName}"?`)) return;

    try {
      const res = await fetch(`/api/admin/courts?courtId=${courtId}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "ไม่สามารถลบสนามได้");
      }

      alert("ลบสนามบอลสำเร็จ!");
      fetchCourts();
    } catch (err: any) {
      alert(err.message || "เกิดข้อผิดพลาดในการลบสนาม");
    }
  };

  const formatPrice = (price: string) => Number(price).toLocaleString("th-TH");

  return (
    <div>
      {/* Header and Add Button */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#ffffff" }}>สนามบอลทั้งหมด</h2>
        <button
          onClick={openAddModal}
          style={{
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            border: "none",
            borderRadius: "10px",
            color: "#fff",
            fontWeight: 700,
            fontSize: "0.85rem",
            padding: "0.55rem 1.25rem",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(99, 102, 241, 0.25)",
            transition: "all 0.2s",
          }}
        >
          ➕ เพิ่มสนามใหม่
        </button>
      </div>

      {/* Loading state */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
          <div style={{ width: "32px", height: "32px", border: "4px solid #6366f1", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
        </div>
      ) : courts.length === 0 ? (
        <div style={{ background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: "24px", padding: "3rem", textAlign: "center", color: "rgba(255,255,255,0.35)", fontSize: "0.85rem" }}>
          ยังไม่มีข้อมูลสนามฟุตบอลในระบบ
        </div>
      ) : (
        /* Grid list */
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.25rem" }}>
          {courts.map((court) => {
            const imgUrl = court.images[0]?.url || "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=600&auto=format&fit=crop";

            return (
              <div key={court.id} className="admin-court-card">
                {/* Court Image */}
                <div
                  style={{
                    height: "160px",
                    background: `url(${imgUrl}) center/cover no-repeat`,
                    position: "relative",
                  }}
                >
                  {/* Status Badge */}
                  <span
                    style={{
                      position: "absolute",
                      top: "0.75rem",
                      right: "0.75rem",
                      background: court.isActive ? "rgba(16,185,129,0.95)" : "rgba(239,68,68,0.95)",
                      color: "#fff",
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      padding: "0.25rem 0.6rem",
                      borderRadius: "6px",
                      backdropFilter: "blur(4px)",
                    }}
                  >
                    {court.isActive ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                  </span>
                </div>

                {/* Court Info */}
                <div style={{ padding: "1.25rem", flex: 1, display: "flex", flexDirection: "column" }}>
                  <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.5rem", color: "#fff" }}>{court.name}</h3>
                  {court.description && (
                    <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.45)", marginBottom: "1rem", flex: 1 }}>
                      {court.description}
                    </p>
                  )}

                  {/* Attributes */}
                  <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "1.25rem" }}>
                    {court.surface && (
                      <span style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "6px", padding: "0.2rem 0.5rem", fontSize: "0.65rem", color: "rgba(255,255,255,0.6)" }}>
                        🌱 {court.surface}
                      </span>
                    )}
                    {court.maxPlayers && (
                      <span style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "6px", padding: "0.2rem 0.5rem", fontSize: "0.65rem", color: "rgba(255,255,255,0.6)" }}>
                        👥 max {court.maxPlayers} คน
                      </span>
                    )}
                  </div>

                  {/* Price and Actions */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.04)", paddingTop: "0.75rem", marginTop: "auto" }}>
                    <div>
                      <span style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.4)", display: "block" }}>ราคาต่อชั่วโมง</span>
                      <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "#a5b4fc" }}>฿{formatPrice(court.pricePerHour)}</span>
                    </div>

                    <div style={{ display: "flex", gap: "0.4rem" }}>
                      <button
                        onClick={() => openEditModal(court)}
                        className="admin-btn admin-btn-secondary"
                        style={{ padding: "0.4rem 0.8rem", borderRadius: "8px" }}
                      >
                        แก้ไข
                      </button>
                      <button
                        onClick={() => handleDelete(court.id, court.name)}
                        className="admin-btn admin-btn-danger"
                        style={{ padding: "0.4rem 0.8rem", borderRadius: "8px" }}
                      >
                        ลบ
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
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
          <div className="admin-modal-content"
            style={{
              padding: "1.75rem",
              width: "100%",
              maxWidth: "480px",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <h3 style={{ fontSize: "1.15rem", fontWeight: 800, marginBottom: "0.4rem", color: "#ffffff" }}>
              {editingCourt ? "📝 แก้ไขข้อมูลสนามฟุตบอล" : "⚽ เพิ่มสนามฟุตบอลใหม่"}
            </h3>
            <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.45)", marginBottom: "1.25rem" }}>
              กรอกข้อมูลสนามเพื่อนำเสนอในระบบและเปิดรับจอง
            </p>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", marginBottom: "0.4rem", fontWeight: 600 }}>
                  ชื่อสนามบอล *
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น Pitch 1 (Standard)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="admin-input"
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", marginBottom: "0.4rem", fontWeight: 600 }}>
                    ราคาต่อชั่วโมง (บาท) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="เช่น 1000"
                    value={pricePerHour}
                    onChange={(e) => setPricePerHour(e.target.value)}
                    className="admin-input"
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", marginBottom: "0.4rem", fontWeight: 600 }}>
                    จำนวนผู้เล่นสูงสุด (คน)
                  </label>
                  <input
                    type="number"
                    placeholder="เช่น 14"
                    value={maxPlayers}
                    onChange={(e) => setMaxPlayers(e.target.value)}
                    className="admin-input"
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", marginBottom: "0.4rem", fontWeight: 600 }}>
                  ประเภทพื้นสนาม
                </label>
                <input
                  type="text"
                  placeholder="เช่น หญ้าเทียม (Artificial Grass)"
                  value={surface}
                  onChange={(e) => setSurface(e.target.value)}
                  className="admin-input"
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", marginBottom: "0.4rem", fontWeight: 600 }}>
                  ลิงก์รูปภาพสนาม (URL)
                </label>
                <input
                  type="text"
                  placeholder="ลิงก์ URL รูปภาพ เช่น Unsplash"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="admin-input"
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", marginBottom: "0.4rem", fontWeight: 600 }}>
                  รายละเอียดเพิ่มเติม
                </label>
                <textarea
                  placeholder="เช่น สนามพร้อมหลังคากันฝน ไฟสปอร์ตไลท์อย่างดี..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="admin-textarea"
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  style={{
                    width: "18px",
                    height: "18px",
                    accentColor: "#6366f1",
                    cursor: "pointer",
                  }}
                />
                <label htmlFor="isActiveToggle" style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.8)", cursor: "pointer" }}>
                  เปิดให้บริการสนามนี้ในระบบทันที
                </label>
              </div>

              {error && (
                <div style={{ color: "#ef4444", fontSize: "0.75rem", background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.15)", padding: "0.6rem", borderRadius: "8px" }}>
                  ⚠️ {error}
                </div>
              )}

              <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                  className="admin-btn admin-btn-secondary"
                  style={{ flex: 1, padding: "0.7rem" }}
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="admin-btn admin-btn-primary"
                  style={{ flex: 1, padding: "0.7rem", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", border: "none", boxShadow: "0 4px 12px rgba(99, 102, 241, 0.2)" }}
                >
                  {submitting ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
