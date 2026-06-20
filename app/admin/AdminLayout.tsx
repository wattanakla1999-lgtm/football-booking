"use client";

import { AdminRouteLoadingOverlay } from "@/src/components/common/AdminRouteLoadingOverlay";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { MouseEvent } from "react";
import { useEffect, useState } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [pendingPath, setPendingPath] =
    useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] =
    useState(false);
  const isLoginPage = pathname === "/admin/login";
  const isRouteLoading =
    pendingPath !== null && pendingPath !== pathname;

  useEffect(() => {
    if (!pendingPath || pendingPath !== pathname) {
      return;
    }

    const frameId = window.requestAnimationFrame(
      () => {
        setPendingPath(null);
      },
    );

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [pathname, pendingPath]);

  if (isLoginPage) {
    return <div className="bg-background text-on-surface min-h-screen">{children}</div>;
  }

  const startNavigationLoading = (
    targetPath: string,
  ) => {
    if (targetPath === pathname) {
      return;
    }

    setPendingPath(targetPath);
    setIsMobileMenuOpen(false);
  };

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

      startNavigationLoading(targetPath);
    };

  // Active link helper
  const getNavClass = (path: string) => {
    const isActive = pathname.startsWith(path) && (path !== "/admin" || pathname === "/admin/dashboard");
    if (isActive) {
      return "flex items-center gap-3 px-4 py-3 bg-primary-container/20 text-primary font-bold border-r-4 border-primary rounded-r-lg transition-transform duration-200 cursor-pointer";
    }
    return "flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-variant/30 hover:translate-x-1 transition-transform duration-200 cursor-pointer";
  };

  const getMobileNavClass = (path: string) => {
    const isActive = pathname.startsWith(path) && (path !== "/admin" || pathname === "/admin/dashboard");
    if (isActive) {
      return "flex items-center gap-3 rounded-2xl bg-primary-container/20 px-4 py-3 text-primary active:scale-95 duration-200 transition-all";
    }
    return "flex items-center gap-3 rounded-2xl px-4 py-3 text-on-secondary-container hover:bg-surface-container-high active:scale-95 duration-200 transition-all";
  };

  return (
    <div className="admin-layout-root min-h-dvh w-full max-w-full overflow-x-clip bg-background text-on-surface">
      {/* Sidebar Navigation */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full py-lg bg-surface-container border-r border-outline-variant/10 z-50 w-64 h-screen">
        <div className="px-gutter mb-xl mt-4">
          <span className="text-headline-md font-headline-md font-black text-primary">ArenaManager</span>
        </div>

        {/* <div className="flex items-center px-gutter mb-lg gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center border border-primary/30">
            <span className="material-symbols-outlined text-primary">person</span>
          </div>
          <div>
            <p className="text-label-md font-label-md font-bold text-on-surface">ผู้ดูแลระบบ</p>
            <p className="text-label-sm font-label-sm text-on-surface-variant">Admin</p>
          </div>
        </div> */}

        <nav className="flex-1 space-y-1 px-md">
          <Link
            href="/admin/dashboard"
            className={getNavClass("/admin/dashboard")}
            onClick={handleNavClick("/admin/dashboard")}
          >
            <span className="material-symbols-outlined">dashboard</span>
            <span className="text-body-md font-body-md">แดชบอร์ด</span>
          </Link>
          <Link
            href="/admin/availability"
            className={getNavClass("/admin/availability")}
            onClick={handleNavClick("/admin/availability")}
          >
            <span className="material-symbols-outlined">calendar_month</span>
            <span className="text-body-md font-body-md">ตารางสนาม</span>
          </Link>
          <Link
            href="/admin/all-bookings"
            className={getNavClass("/admin/all-bookings")}
            onClick={handleNavClick("/admin/all-bookings")}
          >
            <span className="material-symbols-outlined">calendar_month</span>
            <span className="text-body-md font-body-md">การจองทั้งหมด</span>
          </Link>

          <Link
            href="/admin/courts"
            className={getNavClass("/admin/courts")}
            onClick={handleNavClick("/admin/courts")}
          >
            <span className="material-symbols-outlined">stadium</span>
            <span className="text-body-md font-body-md">จัดการสนาม</span>
          </Link>
          <Link
            href="/admin/customers"
            className={getNavClass("/admin/customers")}
            onClick={handleNavClick("/admin/customers")}
          >
            <span className="material-symbols-outlined">group</span>
            <span className="text-body-md font-body-md">ลูกค้า</span>
          </Link>
          <Link
            href="/admin/operating-hours"
            className={getNavClass("/admin/operating-hours")}
            onClick={handleNavClick("/admin/operating-hours")}
          >
            <span className="material-symbols-outlined">settings</span>
            <span className="text-body-md font-body-md">ตั้งค่าระบบ</span>
          </Link>
        </nav>

        <div className="mt-auto px-gutter mb-4 flex flex-col gap-2">
          <div className="p-4 rounded-xl bg-surface-variant/20 border border-outline-variant/10">
            <p className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-widest mb-2">ช่วยเหลือ</p>
            <button className="w-full flex items-center justify-center gap-2 py-2 mb-2 rounded-lg bg-primary text-on-primary font-bold text-label-md active:scale-95 transition-all">
              <span className="material-symbols-outlined text-[18px]">help_center</span>
              ติดต่อซัพพอร์ต
            </button>
            <a href="/api/admin/logout" className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-error-container/20 text-error font-bold text-label-md hover:bg-error-container/40 active:scale-95 transition-all">
              <span className="material-symbols-outlined text-[18px]">logout</span>
              ออกจากระบบ
            </a>
          </div>
        </div>
      </aside>

      {/* Top App Bar */}
      <header
        className="
    sticky top-0 z-40
    flex h-16
    w-full min-w-0 max-w-full
    items-center justify-between
    border-b border-outline-variant/10
    bg-surface/80
    px-gutter
    backdrop-blur-md
    md:ml-64
    md:w-[calc(100%-16rem)]
  "
      >
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() =>
              setIsMobileMenuOpen((current) => !current)
            }
            className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-xl border border-outline-variant/10 bg-surface-container-low text-primary transition-colors hover:bg-surface-container"
            aria-label={
              isMobileMenuOpen
                ? "ปิดเมนู"
                : "เปิดเมนู"
            }
          >
            <span className="material-symbols-outlined">
              {isMobileMenuOpen ? "close" : "menu"}
            </span>
          </button>
          <h1 className="text-headline-md font-headline-md font-bold tracking-tight text-on-surface">ArenaManager</h1>
        </div>
        {/* <div className="flex items-center gap-md">
          <div className="hidden sm:flex items-center bg-surface-container-low px-3 py-1.5 rounded-full border border-outline-variant/10">
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant mr-2">search</span>
            <input className="bg-transparent border-none focus:ring-0 text-label-md text-on-surface w-40" placeholder="ค้นหา..." type="text" />
          </div>
          <button className="p-2 rounded-full hover:bg-surface-variant/20 transition-colors relative">
            <span className="material-symbols-outlined text-primary">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full"></span>
          </button>
          <div className="w-8 h-8 rounded-full overflow-hidden border border-primary/20">
            <Image
              alt="Admin"
              className="h-full w-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBPqX2fqsvM1LXZbY0NeERHQT75ET37PZ288idwzxalyPJPLYvJLDzV-IEXnmshy2AIeRyLQ8G_eMC_omEUfwwFxDt9LCToPHhWwUoRXRqwaEIxXRCc3kkBj7pLUOZhKF9uEg6FB36F2F3QRwdq3uMElQuVg46Eutafq3uK5XE6wSDep2vpVY9hEWIQNwiMGbh173bL9gJ4xrNZu1rSIuBzsVcfrGThARGryHt7t0PMri0enGVbhHkOeH0TPfgx-Ll_qKDbvBnLnpw"
              width={32}
              height={32}
            />
          </div>
        </div> */}
      </header>

      {/* Main Content */}
      <main
        className="
    w-full min-w-0 max-w-full
    overflow-x-clip
    p-gutter pb-gutter
    transition-all duration-300
    md:ml-64
    md:w-[calc(100%-16rem)]
    md:pb-gutter
  "
      >
        {children}
      </main>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-[70] bg-black/55 md:hidden"
          onClick={() =>
            setIsMobileMenuOpen(false)
          }
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-[80] flex h-full w-[86vw] max-w-[320px] flex-col border-r border-outline-variant/10 bg-surface-container shadow-2xl transition-transform duration-300 md:hidden ${
          isMobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-outline-variant/10 px-5 py-5">
          <div>
            <p className="text-lg font-black text-primary">
              ArenaManager
            </p>
            {/* <p className="mt-1 text-xs text-on-surface-variant">
              เมนูผู้ดูแลระบบ
            </p> */}
          </div>

          <button
            type="button"
            onClick={() =>
              setIsMobileMenuOpen(false)
            }
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-outline-variant/10 bg-surface-container-low text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
            aria-label="ปิดเมนู"
          >
            <span className="material-symbols-outlined">
              close
            </span>
          </button>
        </div>

        {/* <div className="flex items-center gap-3 px-5 py-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-primary/30 bg-primary-container/20">
            <span className="material-symbols-outlined text-primary">
              person
            </span>
          </div>
          <div>
            <p className="text-sm font-bold text-on-surface">
              ผู้ดูแลระบบ
            </p>
            <p className="text-xs text-on-surface-variant">
              Admin
            </p>
          </div>
        </div> */}

        <nav className="flex-1 space-y-2 px-4">
          <Link
            href="/admin/dashboard"
            className={getMobileNavClass("/admin/dashboard")}
            onClick={handleNavClick("/admin/dashboard")}
          >
            <span className="material-symbols-outlined text-[22px]">dashboard</span>
            <span className="text-sm font-semibold">แดชบอร์ด</span>
          </Link>

          <Link
            href="/admin/availability"
            className={getMobileNavClass("/admin/availability")}
            onClick={handleNavClick("/admin/availability")}
          >
            <span className="material-symbols-outlined text-[22px]">calendar_today</span>
            <span className="text-sm font-semibold">ตารางสนาม</span>
          </Link>

          <Link
            href="/admin/all-bookings"
            className={getMobileNavClass("/admin/all-bookings")}
            onClick={handleNavClick("/admin/all-bookings")}
          >
            <span className="material-symbols-outlined text-[22px]">list_alt</span>
            <span className="text-sm font-semibold">การจองทั้งหมด</span>
          </Link>

          <Link
            href="/admin/courts"
            className={getMobileNavClass("/admin/courts")}
            onClick={handleNavClick("/admin/courts")}
          >
            <span className="material-symbols-outlined text-[22px]">sports_soccer</span>
            <span className="text-sm font-semibold">จัดการสนาม</span>
          </Link>

          <Link
            href="/admin/customers"
            className={getMobileNavClass("/admin/customers")}
            onClick={handleNavClick("/admin/customers")}
          >
            <span className="material-symbols-outlined text-[22px]">group</span>
            <span className="text-sm font-semibold">ลูกค้า</span>
          </Link>

          <Link
            href="/admin/operating-hours"
            className={getMobileNavClass("/admin/operating-hours")}
            onClick={handleNavClick("/admin/operating-hours")}
          >
            <span className="material-symbols-outlined text-[22px]">settings</span>
            <span className="text-sm font-semibold">ตั้งค่าระบบ</span>
          </Link>
        </nav>

        <div className="mt-auto space-y-3 border-t border-outline-variant/10 px-4 py-5">
          <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-on-primary active:scale-95 transition-all">
            <span className="material-symbols-outlined text-[18px]">help_center</span>
            ติดต่อซัพพอร์ต
          </button>

          <a
            href="/api/admin/logout"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-error-container/20 py-3 text-sm font-bold text-error transition-all hover:bg-error-container/40 active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            ออกจากระบบ
          </a>
        </div>
      </aside>

      <AdminRouteLoadingOverlay
        open={isRouteLoading}
      />

      {/* FAB */}
      {/* <Link href="/admin/availability" className="fixed bottom-20 right-6 md:bottom-10 md:right-10 w-14 h-14 bg-primary text-on-primary rounded-full shadow-2xl flex items-center justify-center active:scale-90 transition-all group z-50 pitch-green-glow">
        <span className="material-symbols-outlined text-[32px]">add</span>
        <span className="absolute right-full mr-4 bg-surface-container text-on-surface px-4 py-2 rounded-lg text-label-md font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-outline-variant/10">Quick Booking</span>
      </Link> */}
    </div>
  );
}
