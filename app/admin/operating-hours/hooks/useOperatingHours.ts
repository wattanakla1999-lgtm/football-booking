"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  getOperatingHours,
  updateOperatingHours,
} from "../services/operatingHoursService";

import type {
  OperatingHourField,
  OperatingHourRow,
} from "../types/operatingHours";

import {
  completeOperatingHours,
} from "../utils/operatingHours";

const SUCCESS_MESSAGE_DURATION = 3000;

export function useOperatingHours() {
  const [hours, setHours] =
    useState<OperatingHourRow[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const messageTimerRef =
    useRef<ReturnType<typeof setTimeout> | null>(
      null,
    );

  const fetchOperatingHours =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await getOperatingHours();

        setHours(
          completeOperatingHours(
            response.operatingHours ?? [],
          ),
        );
      } catch (requestError) {
        console.error(
          "Fetch operating hours error:",
          requestError,
        );

        setError(
          requestError instanceof Error
            ? requestError.message
            : "ไม่สามารถดึงข้อมูลเวลาทำการได้",
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void fetchOperatingHours();
    });

    return () => {
      if (messageTimerRef.current) {
        clearTimeout(
          messageTimerRef.current,
        );
      }
    };
  }, [fetchOperatingHours]);

  const toggleClosed = useCallback(
    (dayOfWeek: number) => {
      setHours((currentHours) =>
        currentHours.map((item) =>
          item.dayOfWeek === dayOfWeek
            ? {
                ...item,
                isClosed: !item.isClosed,
              }
            : item,
        ),
      );
    },
    [],
  );

  const changeTime = useCallback(
    (
      dayOfWeek: number,
      field: OperatingHourField,
      value: string,
    ) => {
      setHours((currentHours) =>
        currentHours.map((item) =>
          item.dayOfWeek === dayOfWeek
            ? {
                ...item,
                [field]: value,
              }
            : item,
        ),
      );
    },
    [],
  );

  const saveOperatingHours =
    useCallback(async () => {
      try {
        setSaving(true);
        setMessage("");
        setError("");

        const response =
          await updateOperatingHours({
            hours,
          });

        setMessage(
          response.message ||
            "บันทึกเวลาเปิด-ปิดทำการสำเร็จ! 🎉",
        );

        if (messageTimerRef.current) {
          clearTimeout(
            messageTimerRef.current,
          );
        }

        messageTimerRef.current =
          setTimeout(() => {
            setMessage("");
          }, SUCCESS_MESSAGE_DURATION);

        await fetchOperatingHours();

        return true;
      } catch (requestError) {
        console.error(
          "Update operating hours error:",
          requestError,
        );

        setError(
          requestError instanceof Error
            ? requestError.message
            : "เกิดข้อผิดพลาดในการบันทึกข้อมูล",
        );

        return false;
      } finally {
        setSaving(false);
      }
    }, [
      hours,
      fetchOperatingHours,
    ]);

  return {
    hours,
    loading,
    saving,
    message,
    error,
    toggleClosed,
    changeTime,
    saveOperatingHours,
    fetchOperatingHours,
  };
}
