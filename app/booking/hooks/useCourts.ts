"use client";

import { useEffect, useState } from "react";
import type { Court } from "../types/booking";
import { getCourts } from "../services/bookingService";

export function useCourts() {
  const [courts, setCourts] = useState<Court[]>([]);
  const [loadingCourts, setLoadingCourts] = useState(true);
  const [courtsError, setCourtsError] = useState("");

  useEffect(() => {
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
  }, []);

  return {
    courts,
    loadingCourts,
    courtsError,
  };
}
