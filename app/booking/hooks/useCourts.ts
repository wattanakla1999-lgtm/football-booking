"use client";

import { useEffect, useState } from "react";
import type { Court } from "../types/booking";
import { getCourts } from "../services/bookingService";

export function useCourts(
  initialCourts: Court[] = [],
) {
  const [courts, setCourts] =
    useState<Court[]>(initialCourts);
  const [loadingCourts, setLoadingCourts] =
    useState(initialCourts.length === 0);
  const [courtsError, setCourtsError] = useState("");

  useEffect(() => {
    if (initialCourts.length > 0) {
      return;
    }

    const loadCourts = async () => {
      try {
        const courtList = await getCourts();

        if (courtList.length > 0) {
          setCourts(courtList);
        } else {
          setCourtsError("ไม่พบข้อมูลสนาม");
        }
      } catch {
        setCourtsError("เกิดข้อผิดพลาดในการโหลดข้อมูล");
      } finally {
        setLoadingCourts(false);
      }
    };

    void loadCourts();
  }, [initialCourts.length]);

  return {
    courts,
    loadingCourts,
    courtsError,
  };
}
