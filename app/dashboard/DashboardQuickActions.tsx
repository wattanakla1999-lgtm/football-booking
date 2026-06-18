"use client";

import type { MouseEvent } from "react";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AdminRouteLoadingOverlay } from "@/src/components/common/AdminRouteLoadingOverlay";

export default function DashboardQuickActions() {
  const pathname = usePathname();
  const [pendingPath, setPendingPath] =
    useState<string | null>(null);
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
    };

  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
          width: "100%",
        }}
      >
        <Link
          href="/booking"
          onClick={handleNavClick("/booking")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0.875rem 1.5rem",
            borderRadius: "14px",
            background: "#06c755",
            color: "#ffffff",
            fontSize: "1rem",
            fontWeight: "700",
            textDecoration: "none",
            boxShadow: "0 4px 24px rgba(6, 199, 85, 0.4)",
            transition: "transform 0.18s, box-shadow 0.18s",
            width: "100%",
          }}
        >
          🏟️ จองสนามฟุตบอล
        </Link>

        <Link
          href="/history"
          onClick={handleNavClick("/history")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0.875rem 1.5rem",
            borderRadius: "14px",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#ffffff",
            fontSize: "1rem",
            fontWeight: "600",
            textDecoration: "none",
            transition: "all 0.2s",
            width: "100%",
          }}
        >
          📋 ประวัติการจองของฉัน
        </Link>

        <a
          href="/api/auth/logout"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0.6rem 1.5rem",
            borderRadius: "12px",
            border: "1px solid rgba(255,255,255,0.15)",
            color: "rgba(255,255,255,0.7)",
            fontSize: "0.85rem",
            textDecoration: "none",
            transition: "all 0.2s",
            width: "100%",
          }}
        >
          ออกจากระบบ
        </a>
      </div>

      <AdminRouteLoadingOverlay open={isRouteLoading} />
    </>
  );
}
