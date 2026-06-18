"use client";

import { useState } from "react";

import { AdminRouteLoadingOverlay } from "@/src/components/common/AdminRouteLoadingOverlay";

export default function BookingDetailNavigationActions() {
  const [isRouteLoading, setIsRouteLoading] =
    useState(false);

  const navigateTo = (href: string) => {
    setIsRouteLoading(true);
    window.location.assign(href);
  };

  return (
    <>
      <AdminRouteLoadingOverlay
        open={isRouteLoading}
      />

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() =>
            navigateTo("/admin/all-bookings")
          }
          disabled={isRouteLoading}
          className="inline-flex h-11 items-center justify-center rounded-xl border border-outline-variant/20 bg-surface-container-low px-4 text-label-md font-bold text-on-surface transition-all hover:bg-surface-container-high disabled:cursor-wait disabled:opacity-70"
        >
          กลับไปหน้ารายการจอง
        </button>

        <button
          type="button"
          onClick={() =>
            navigateTo("/admin/availability")
          }
          disabled={isRouteLoading}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-label-md font-bold text-on-primary transition-all hover:brightness-110 active:scale-95 disabled:cursor-wait disabled:opacity-70"
        >
          <span className="material-symbols-outlined text-[18px]">
            add_circle
          </span>
          สร้างรายการจองเพิ่ม
        </button>
      </div>
    </>
  );
}
