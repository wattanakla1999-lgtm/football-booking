"use client";

import { useEffect, useRef, useState } from "react";

import { AdminRouteLoadingOverlay } from "@/src/components/common/AdminRouteLoadingOverlay";
import type { LineProfile } from "@/src/types/line";

type LineAutoLoginProps = {
  enabled: boolean;
  liffId?: string;
};

export function LineAutoLogin({
  enabled,
  liffId,
}: LineAutoLoginProps) {
  const hasStartedRef = useRef(false);
  const [isLoading, setIsLoading] = useState(enabled && Boolean(liffId));

  useEffect(() => {
    if (!enabled || !liffId || hasStartedRef.current) {
      setIsLoading(false);
      return;
    }

    hasStartedRef.current = true;

    let isCancelled = false;

    const runAutoLogin = async () => {
      try {
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
          setIsLoading(false);
        }
      }
    };

    void runAutoLogin();

    return () => {
      isCancelled = true;
    };
  }, [enabled, liffId]);

  return <AdminRouteLoadingOverlay open={isLoading} />;
}
