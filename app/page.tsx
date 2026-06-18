import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { LineAutoLogin } from "@/src/components/auth/LineAutoLogin";

export const metadata: Metadata = {
  title: "เข้าสู่ระบบ — Football Booking",
  description:
    "จองสนามฟุตบอลออนไลน์ง่ายๆ เพียงเข้าสู่ระบบด้วย LINE ของคุณ",
};

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function LoginPage({
  searchParams,
}: LoginPageProps) {
  const cookieStore = await cookies();
  const sessionUserId = cookieStore.get("session_user_id")?.value;

  if (sessionUserId) {
    redirect("/dashboard");
  }

  const { error } = await searchParams;

  return (
    <main className="login-root">
      <LineAutoLogin
        hasError={Boolean(error)}
        liffId={process.env.NEXT_PUBLIC_LIFF_ID}
      />

      {/* ── Animated background ── */}
      <div className="bg-gradient" aria-hidden="true" />
      <div className="bg-pattern" aria-hidden="true" />

      {/* ── Floating pitch lines decoration ── */}
      <div className="pitch-decoration" aria-hidden="true">
        <div className="pitch-circle" />
        <div className="pitch-line pitch-line--center" />
        <div className="pitch-line pitch-line--left" />
        <div className="pitch-line pitch-line--right" />
      </div>

      {/* ── Card ── */}
      <div className="login-card">
        {/* Logo + branding */}
        <div className="brand">
          <div className="brand-icon" aria-label="Football icon">
            <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              {/* Hexagon patches */}
              <circle cx="32" cy="32" r="28" fill="white" />
              <circle cx="32" cy="32" r="28" fill="none" stroke="#22c55e" strokeWidth="2" />
              {/* Center patch */}
              <polygon points="32,18 40,24 37,34 27,34 24,24" fill="#111827" />
              {/* Surrounding patches */}
              <polygon points="32,18 38,10 46,14 44,24 40,24" fill="#111827" />
              <polygon points="40,24 44,24 50,30 46,38 37,34" fill="#111827" />
              <polygon points="37,34 46,38 42,46 32,46 28,38" fill="#111827" />
              <polygon points="27,34 28,38 18,42 14,34 24,28" fill="#111827" />
              <polygon points="24,24 14,24 18,14 26,10 32,18" fill="#111827" />
            </svg>
          </div>
          <h1 className="brand-name">Football Booking</h1>
          <p className="brand-tagline">จองสนามฟุตบอล ง่าย เร็ว ทุกที่</p>
        </div>

        {/* Feature bullets */}
        <ul className="features" role="list">
          <li className="feature-item">
            <span className="feature-icon" aria-hidden="true">🏟️</span>
            <span>เลือกสนาม &amp; เวลาได้ตามใจ</span>
          </li>
          <li className="feature-item">
            <span className="feature-icon" aria-hidden="true">💳</span>
            <span>ชำระเงินออนไลน์ สะดวก รวดเร็ว</span>
          </li>
          <li className="feature-item">
            <span className="feature-icon" aria-hidden="true">🔔</span>
            <span>รับการแจ้งเตือนผ่าน LINE ทันที</span>
          </li>
        </ul>

        <p className="terms">
          การเข้าสู่ระบบถือว่าคุณยอมรับ{" "}
          <a href="/terms" className="terms-link">นโยบายความเป็นส่วนตัว</a>
        </p>
      </div>

      {/* ── Bottom wave ── */}
      <div className="wave-wrapper" aria-hidden="true">
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M0,64 C360,120 1080,0 1440,64 L1440,120 L0,120 Z"
            fill="rgba(255,255,255,0.06)"
          />
        </svg>
      </div>
    </main>
  );
}
