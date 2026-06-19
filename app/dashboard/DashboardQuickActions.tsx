"use client";

import type { MouseEvent } from "react";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AdminRouteLoadingOverlay } from "@/src/components/common/AdminRouteLoadingOverlay";

type DashboardQuickActionsProps = {
  user: {
    displayName: string;
    pictureUrl: string | null;
  };
  bookingsCount: number;
};

export default function DashboardQuickActions({
  user,
  bookingsCount,
}: DashboardQuickActionsProps) {
  const pathname = usePathname();
  const [pendingPath, setPendingPath] =
    useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] =
    useState(false);
  const [showSuccess, setShowSuccess] =
    useState(true);
  const isRouteLoading =
    pendingPath !== null && pendingPath !== pathname;

  const handleNavClick =
    (targetPath: string) =>
    (event: MouseEvent<HTMLAnchorElement>) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      if (targetPath === pathname) {
        return;
      }

      setPendingPath(targetPath);
      setIsMenuOpen(false);
    };

  const logout = () => {
    setPendingPath("/api/auth/logout");
    window.location.assign("/api/auth/logout");
  };

  return (
    <main className="min-h-dvh overflow-hidden bg-[#061222] text-white">
      <div className="relative mx-auto min-h-dvh w-full max-w-[430px] overflow-hidden border-x border-green-500/10 bg-[#071424]">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.08)_1px,transparent_1px)] bg-[size:42px_42px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(34,197,94,0.16),transparent_34%),linear-gradient(180deg,rgba(3,10,18,0.15),rgba(3,10,18,0.9))]" />

        <div className="relative z-10 flex min-h-dvh flex-col px-6 pb-8 pt-6">
          <header className="flex items-center justify-between pb-6">
            <button
              type="button"
              onClick={() => setIsMenuOpen(true)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-green-400 transition-colors hover:bg-white/5"
              aria-label="เปิดเมนู"
            >
              <span className="material-symbols-outlined text-[32px]">
                menu
              </span>
            </button>

            <div className="text-center">
              <p className="text-xl font-black tracking-wide text-green-400">
                ELITE ARENA
              </p>
            </div>

            <button
              type="button"
              className="relative inline-flex h-11 w-11 items-center justify-center rounded-xl text-green-400 transition-colors hover:bg-white/5"
              aria-label="แจ้งเตือน"
            >
              <span className="material-symbols-outlined text-[30px]">
                notifications
              </span>
              <span className="absolute right-2 top-2 h-3 w-3 rounded-full bg-green-400" />
            </button>
          </header>

          {showSuccess && (
            <div className="mb-4 flex items-center gap-3 rounded-2xl border border-green-400/30 bg-green-500/15 px-4 py-3 text-green-100">
              <span className="material-symbols-outlined text-green-400">
                check_circle
              </span>
              <p className="min-w-0 flex-1 text-sm font-bold">
                เข้าสู่ระบบสำเร็จ
              </p>
              <button
                type="button"
                onClick={() => setShowSuccess(false)}
                className="text-white/45 transition-colors hover:text-white"
                aria-label="ปิดข้อความ"
              >
                <span className="material-symbols-outlined text-[20px]">
                  close
                </span>
              </button>
            </div>
          )}

          <section className="rounded-[28px] border border-white/10 bg-[#09182a]/95 px-6 py-8 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                <div className="h-28 w-28 overflow-hidden rounded-full border border-green-400/40 bg-green-500/10 shadow-[0_0_36px_rgba(34,197,94,0.55)]">
                  {user.pictureUrl ? (
                    <Image
                      src={user.pictureUrl}
                      alt={user.displayName}
                      width={112}
                      height={112}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <span className="material-symbols-outlined text-[48px] text-green-300">
                        sports_soccer
                      </span>
                    </div>
                  )}
                </div>
                <span className="absolute -bottom-1 -right-2 rounded-full bg-green-400 px-3 py-1 text-xs font-black text-[#062015] shadow-lg">
                  PRO
                </span>
              </div>

              <h1 className="mt-7 w-full text-3xl font-black leading-tight text-slate-100">
                ยินดีต้อนรับ, {user.displayName}
              </h1>
              <p className="mt-3 flex items-center justify-center gap-2 text-sm font-black tracking-[0.18em] text-slate-300">
                <span className="material-symbols-outlined text-[18px] text-green-400">
                  military_tech
                </span>
                ELITE MEMBER
              </p>

              <div className="mt-8 grid w-full grid-cols-3 gap-3">
                <StatCard
                  value={bookingsCount}
                  label="BOOKINGS"
                />
                <StatCard
                  value={bookingsCount * 50}
                  label="POINTS"
                />
                <StatCard
                  value={bookingsCount > 0 ? "#2" : "-"}
                  label="RANK"
                />
              </div>

              <div className="mt-8 w-full space-y-4">
                <Link
                  href="/booking"
                  onClick={handleNavClick("/booking")}
                  className="flex h-16 w-full items-center justify-between rounded-2xl bg-green-400 px-6 text-lg font-black text-[#062015] shadow-[0_18px_48px_rgba(34,197,94,0.32)] transition-transform active:scale-[0.98]"
                >
                  <span>จองสนามฟุตบอล</span>
                  <span className="material-symbols-outlined text-[34px]">
                    arrow_forward
                  </span>
                </Link>

                <Link
                  href="/history"
                  onClick={handleNavClick("/history")}
                  className="flex h-14 w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.05] px-6 text-base font-black text-slate-200 transition-colors hover:bg-white/[0.08] active:scale-[0.98]"
                >
                  <span>ประวัติการจองของฉัน</span>
                  <span className="material-symbols-outlined text-[28px] text-slate-300">
                    history
                  </span>
                </Link>

                <button
                  type="button"
                  onClick={logout}
                  className="mx-auto mt-5 flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-slate-400 transition-colors hover:text-white"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    logout
                  </span>
                  ออกจากระบบ
                </button>
              </div>
            </div>
          </section>
        </div>

        {isMenuOpen && (
          <button
            type="button"
            className="absolute inset-0 z-30 bg-black/55"
            onClick={() => setIsMenuOpen(false)}
            aria-label="ปิดเมนู"
          />
        )}

        <aside
          className={`absolute left-0 top-0 z-40 h-full w-[78%] max-w-[330px] bg-[#061424] px-6 py-8 shadow-2xl transition-transform duration-300 ${
            isMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="mb-8 rounded-3xl bg-white/[0.06] p-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 overflow-hidden rounded-full border border-green-400/40 bg-green-500/10">
                {user.pictureUrl ? (
                  <Image
                    src={user.pictureUrl}
                    alt={user.displayName}
                    width={56}
                    height={56}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-green-300">
                    <span className="material-symbols-outlined">
                      person
                    </span>
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-lg font-black text-slate-100">
                  {user.displayName}
                </p>
                <p className="mt-1 text-sm font-black text-green-400">
                  PRO MEMBER
                </p>
              </div>
            </div>
          </div>

          <nav className="space-y-2">
            <DrawerLink
              href="/booking"
              icon="location_on"
              label="Find a Pitch"
              active
              onClick={handleNavClick("/booking")}
            />
            <DrawerLink
              href="/history"
              icon="history"
              label="My Bookings"
              onClick={handleNavClick("/history")}
            />
            <DrawerLink
              href="/dashboard"
              icon="groups"
              label="My Squad"
              onClick={handleNavClick("/dashboard")}
            />
            <DrawerLink
              href="/dashboard"
              icon="trophy"
              label="Tournaments"
              onClick={handleNavClick("/dashboard")}
            />
            <DrawerLink
              href="/dashboard"
              icon="settings"
              label="Settings"
              onClick={handleNavClick("/dashboard")}
            />
            <DrawerLink
              href="/dashboard"
              icon="help"
              label="Help Center"
              onClick={handleNavClick("/dashboard")}
            />
          </nav>
        </aside>
      </div>

      <AdminRouteLoadingOverlay open={isRouteLoading} />
    </main>
  );
}

function StatCard({
  value,
  label,
}: {
  value: string | number;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-5 text-center shadow-inner">
      <p className="text-2xl font-black text-slate-100">
        {value}
      </p>
      <p className="mt-1 text-[11px] font-black text-slate-400">
        {label}
      </p>
    </div>
  );
}

function DrawerLink({
  href,
  icon,
  label,
  active = false,
  onClick,
}: {
  href: string;
  icon: string;
  label: string;
  active?: boolean;
  onClick: (event: MouseEvent<HTMLAnchorElement>) => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex h-16 items-center gap-5 rounded-2xl px-5 text-lg font-black transition-colors ${
        active
          ? "border-l-4 border-green-400 bg-green-500/20 text-green-400"
          : "text-slate-300 hover:bg-white/[0.06]"
      }`}
    >
      <span className="material-symbols-outlined text-[30px]">
        {icon}
      </span>
      <span>{label}</span>
    </Link>
  );
}
