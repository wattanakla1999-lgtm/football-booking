"use client";

import {
  useCallback,
  useDeferredValue,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  HISTORY_PAGE_LIMIT,
} from "../constants";
import { getUserBookings } from "../services/bookingHistoryService";
import type {
  BookingHistoryPageData,
  StatusFilter,
} from "../types/booking";
import { EMPTY_STATUS_SUMMARY } from "../utils/booking";

const DEFAULT_HISTORY_PAGE_DATA: BookingHistoryPageData = {
  bookings: [],
  pagination: {
    total: 0,
    page: 1,
    limit: HISTORY_PAGE_LIMIT,
    totalPages: 1,
  },
  totalBookings: 0,
  statusSummary: { ...EMPTY_STATUS_SUMMARY },
};

export function useBookingHistory(
  initialData: BookingHistoryPageData = DEFAULT_HISTORY_PAGE_DATA,
) {
  const [bookings, setBookings] = useState(
    initialData.bookings,
  );
  const [pagination, setPagination] = useState(
    initialData.pagination,
  );
  const [totalBookings, setTotalBookings] =
    useState(initialData.totalBookings);
  const [statusSummary, setStatusSummary] =
    useState(initialData.statusSummary);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("all");
  const [currentPage, setCurrentPage] = useState(
    initialData.pagination.page,
  );
  const deferredSearchKeyword = useDeferredValue(
    searchKeyword,
  );
  const hasMountedRef = useRef(false);

  const fetchBookings = useCallback(
    async (
      signal?: AbortSignal,
      params?: {
        page?: number;
        searchKeyword?: string;
        statusFilter?: StatusFilter;
      },
    ) => {
      try {
        setLoading(true);
        setError("");

        const data = await getUserBookings(
          {
            limit: HISTORY_PAGE_LIMIT,
            page: params?.page ?? currentPage,
            searchKeyword:
              params?.searchKeyword ??
              deferredSearchKeyword,
            statusFilter:
              params?.statusFilter ?? statusFilter,
          },
          signal,
        );

        setBookings(data.bookings);
        setPagination(data.pagination);
        setTotalBookings(data.totalBookings);
        setStatusSummary(data.statusSummary);
        setCurrentPage(data.pagination.page);
      } catch (requestError) {
        if (
          requestError instanceof DOMException &&
          requestError.name === "AbortError"
        ) {
          return;
        }

        console.error("Fetch user bookings error:", requestError);

        setError(
          requestError instanceof Error
            ? requestError.message
            : "เกิดข้อผิดพลาดในการโหลดข้อมูล",
        );
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [currentPage, deferredSearchKeyword, statusFilter],
  );

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    const controller = new AbortController();

    queueMicrotask(() => {
      void fetchBookings(controller.signal, {
        page: currentPage,
      });
    });

    return () => {
      controller.abort();
    };
  }, [
    currentPage,
    deferredSearchKeyword,
    fetchBookings,
    statusFilter,
  ]);

  const clearFilters = useCallback(() => {
    setSearchKeyword("");
    setStatusFilter("all");
    setCurrentPage(1);
  }, []);

  const hasActiveFilters =
    searchKeyword.trim() !== "" || statusFilter !== "all";

  return {
    bookings,
    pagination,
    loading,
    error,
    searchKeyword,
    statusFilter,
    statusSummary,
    totalBookings,
    currentPage,
    hasActiveFilters,
    setSearchKeyword,
    setStatusFilter,
    setCurrentPage,
    clearFilters,
    fetchBookings,
  };
}
