import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import { prisma } from "@/src/lib/prisma";
import DashboardQuickActions from "./DashboardQuickActions";

export const metadata: Metadata = {
  title: "Dashboard — Football Booking",
  description: "จัดการการจองสนามฟุตบอลของคุณ",
};

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const sessionUserId = cookieStore.get("session_user_id")?.value;

  if (!sessionUserId) {
    redirect("/");
  }

  // ดึงข้อมูลผู้ใช้จากฐานข้อมูล
  const user = await prisma.user.findUnique({
    where: { id: sessionUserId },
  });

  if (!user) {
    // ถ้ารหัสผู้ใช้ไม่มีในระบบ ให้เด้งกลับไปหน้าแรก
    redirect("/");
  }

  return (
    <main className="login-root">
      <div className="bg-gradient" aria-hidden="true" />
      <div className="bg-pattern" aria-hidden="true" />

      <div className="login-card" style={{ gap: "1.5rem" }}>
        
        {/* User Profile Section */}
        <div className="brand" style={{ gap: "1rem" }}>
          {user.pictureUrl ? (
            <div
              style={{
                width: "90px",
                height: "90px",
                borderRadius: "50%",
                overflow: "hidden",
                border: "4px solid #06c755",
                boxShadow: "0 8px 32px rgba(6, 199, 85, 0.25)",
              }}
            >
              <Image
                src={user.pictureUrl}
                alt={user.displayName}
                width={90}
                height={90}
                style={{ objectFit: "cover" }}
              />
            </div>
          ) : (
            <div className="brand-icon" aria-label="Football icon">
              {/* Default Football Icon if no profile picture */}
              <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <circle cx="32" cy="32" r="28" fill="white" />
                <circle cx="32" cy="32" r="28" fill="none" stroke="#22c55e" strokeWidth="2" />
                <polygon points="32,18 40,24 37,34 27,34 24,24" fill="#111827" />
                <polygon points="32,18 38,10 46,14 44,24 40,24" fill="#111827" />
                <polygon points="40,24 44,24 50,30 46,38 37,34" fill="#111827" />
                <polygon points="37,34 46,38 42,46 32,46 28,38" fill="#111827" />
                <polygon points="27,34 28,38 18,42 14,34 24,28" fill="#111827" />
                <polygon points="24,24 14,24 18,14 26,10 32,18" fill="#111827" />
              </svg>
            </div>
          )}
          
          <div>
            <h1 className="brand-name" style={{ fontSize: "1.4rem" }}>
              ยินดีต้อนรับ, {user.displayName}! 🎉
            </h1>
            <p className="brand-tagline" style={{ marginTop: "0.25rem" }}>
              Football Booking
            </p>
          </div>
        </div>

        <div style={{
          width: "100%",
          padding: "1rem",
          borderRadius: "12px",
          background: "rgba(6, 199, 85, 0.08)",
          border: "1px solid rgba(6, 199, 85, 0.2)",
          textAlign: "center",
          color: "rgba(255,255,255,0.85)",
          fontSize: "0.9rem",
        }}>
          <p>เข้าสู่ระบบสำเร็จ ✅</p>
          <p style={{ marginTop: "0.5rem", color: "rgba(255,255,255,0.5)", fontSize: "0.8rem" }}>
            ระบบจองสนามกำลังพัฒนา — เร็วๆ นี้!
          </p>
        </div>

        <DashboardQuickActions />
      </div>
    </main>
  );
}
