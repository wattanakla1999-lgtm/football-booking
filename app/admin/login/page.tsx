import type { Metadata } from "next";
import AdminLoginForm from "./AdminLoginForm";

export const metadata: Metadata = {
  title: "Admin Login — Football Booking",
  description: "เข้าสู่ระบบหลังบ้าน",
};

export default function AdminLoginPage() {
  return (
    <main className="min-h-screen bg-[#0a0e1a] flex items-center justify-center p-5">
      {/* Subtle Background */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.08), transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "24px",
          padding: "2.5rem 2rem",
          backdropFilter: "blur(20px)",
          position: "relative",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "16px",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1rem",
              fontSize: "1.5rem",
            }}
          >
            🛡️
          </div>
          <h1 style={{ color: "#fff", fontSize: "1.5rem", fontWeight: 700 }}>
            Admin Panel
          </h1>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem", marginTop: "0.5rem" }}>
            เข้าสู่ระบบหลังบ้าน Football Booking
          </p>
        </div>

        <AdminLoginForm />
      </div>
    </main>
  );
}
