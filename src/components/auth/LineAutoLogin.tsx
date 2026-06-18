"use client";

import { useEffect, useRef, useState } from "react";

import { AdminRouteLoadingOverlay } from "@/src/components/common/AdminRouteLoadingOverlay";
import type { LineProfile } from "@/src/types/line";

type LineAutoLoginProps = {
  hasError: boolean;
  liffId?: string;
};

export function LineAutoLogin({
  hasError,
  liffId,
}: LineAutoLoginProps) {
  const hasStartedRef = useRef(false);
  const [isLoading, setIsLoading] = useState(!hasError && Boolean(liffId));
  const [showManualLogin, setShowManualLogin] = useState(hasError || !liffId);

  useEffect(() => {
    if (hasError || !liffId || hasStartedRef.current) {
      setIsLoading(false);
      setShowManualLogin(true);
      return;
    }

    hasStartedRef.current = true;

    let isCancelled = false;

    const runAutoLogin = async () => {
      try {
        const userAgent = window.navigator.userAgent || "";
        const referrer = document.referrer || "";
        const isLineBrowser =
          /Line\//i.test(userAgent) ||
          /LIFF/i.test(userAgent) ||
          /line\.me/i.test(referrer);

        if (!isLineBrowser) {
          setIsLoading(false);
          setShowManualLogin(true);
          return;
        }

        const { default: liff } = await import("@line/liff");

        await liff.init({ liffId });

        if (isCancelled) {
          return;
        }

        if (!liff.isLoggedIn()) {
          liff.login({
            redirectUri: window.location.href.split("#")[0],
          });
          return;
        }

        const profile = (await liff.getProfile()) as LineProfile;
        const accessToken = liff.getAccessToken();

        if (!accessToken) {
          throw new Error("Missing LINE access token from LIFF");
        }

        const response = await fetch("/api/auth/line/liff", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "same-origin",
          cache: "no-store",
          body: JSON.stringify({
            accessToken,
            profile,
          }),
        });

        if (!response.ok) {
          throw new Error(`LIFF session creation failed: ${response.status}`);
        }

        const result = (await response.json()) as {
          redirectTo?: string;
        };

        window.location.replace(result.redirectTo ?? "/dashboard");
      } catch (error) {
        console.error("[LIFF] Auto login failed:", error);

        if (!isCancelled) {
          window.location.replace("/api/auth/line");
        }
      }
    };

    void runAutoLogin();

    return () => {
      isCancelled = true;
    };
  }, [hasError, liffId]);

  return (
    <>
      <AdminRouteLoadingOverlay open={isLoading} />

      {showManualLogin ? (
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
    </>
  );
}
