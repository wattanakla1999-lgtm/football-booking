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
        oauthFallbackPath="/api/auth/line"
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

        {error ? (
          <a
            id="line-login-btn"
            href="/api/auth/line"
            className="line-btn"
            role="button"
            aria-label="เข้าสู่ระบบด้วย LINE"
          >
            <svg
              className="line-logo"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M19.952 10.849c0-5.141-5.154-9.325-11.487-9.325C2.132 1.524 0 5.708 0 10.849c0 4.607 4.087 8.464 9.608 9.194.374.081.883.247 1.012.567.116.291.076.745.037 1.041l-.163 1.003c-.05.291-.231 1.138.997.62 1.227-.517 6.624-3.9 9.041-6.676 1.67-1.833 2.42-3.692 2.42-5.749"
                fill="white"
              />
              <path
                d="M9.824 8.432H8.791a.27.27 0 0 0-.27.27v3.3a.27.27 0 0 0 .27.27h1.033a.27.27 0 0 0 .27-.27v-3.3a.27.27 0 0 0-.27-.27M15.275 8.432h-1.033a.27.27 0 0 0-.27.27v1.961l-1.512-2.07a.267.267 0 0 0-.022-.027l-.001-.002-.017-.015-.006-.005-.015-.01-.008-.005-.015-.008-.009-.003-.016-.006-.01-.002-.016-.002h-1.056a.27.27 0 0 0-.27.27v3.3a.27.27 0 0 0 .27.27h1.033a.27.27 0 0 0 .27-.27v-1.96l1.514 2.073a.27.27 0 0 0 .069.066l.002.001.014.009.01.005.013.005.012.004.01.002.018.003h1.027a.27.27 0 0 0 .27-.27v-3.3a.27.27 0 0 0-.27-.27M7.748 11.14H6.42v-2.44a.27.27 0 0 0-.27-.27H5.117a.27.27 0 0 0-.27.27v3.3c0 .074.03.141.078.19l.003.004.004.003c.049.047.116.076.19.076H7.75a.27.27 0 0 0 .27-.27v-1.033a.27.27 0 0 0-.27-.27M18.957 9.735a.27.27 0 0 0 .27-.27V8.432a.27.27 0 0 0-.27-.27h-2.906a.27.27 0 0 0-.19.078l-.004.004-.004.004a.268.268 0 0 0-.076.188v3.3c0 .074.03.141.078.19l.003.004.004.004c.049.047.116.076.19.076h2.906a.27.27 0 0 0 .27-.27v-1.033a.27.27 0 0 0-.27-.27h-1.873V10.5h1.873a.27.27 0 0 0 .27-.27v-1.033a.27.27 0 0 0-.27-.27h-1.873v-.46h1.873z"
                fill="#06C755"
              />
            </svg>
            <span>เข้าสู่ระบบด้วย LINE</span>
          </a>
        ) : null}

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
