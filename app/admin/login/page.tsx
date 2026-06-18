import type { Metadata } from "next";
import AdminLoginForm from "./AdminLoginForm";
import { Card } from "@/src/components/common";

export const metadata: Metadata = {
  title: "Admin Login — Football Booking",
  description: "เข้าสู่ระบบหลังบ้าน",
};

export default function AdminLoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-5 text-on-surface">
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          background:
            "radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--color-primary) 16%, transparent), transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <Card className="relative w-full max-w-[400px] rounded-3xl border border-outline-variant/20 bg-surface-container/80 px-8 py-10 backdrop-blur-xl">
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "16px",
              background:
                "linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1rem",
              color: "var(--color-on-primary)",
            }}
          >
            <span className="material-symbols-outlined text-[30px]">
              admin_panel_settings
            </span>
          </div>
          <h1 style={{ color: "var(--color-on-surface)", fontSize: "1.5rem", fontWeight: 700 }}>
            Admin Panel
          </h1>
          <p style={{ color: "var(--color-on-surface-variant)", fontSize: "0.85rem", marginTop: "0.5rem" }}>
            เข้าสู่ระบบหลังบ้าน Football Booking
          </p>
        </div>

        <AdminLoginForm />
      </Card>
    </main>
  );
}
