"use client";

import {
  usePathname,
  useRouter,
} from "next/navigation";
import {
  useEffect,
  useState,
  useTransition,
} from "react";

import { AdminRouteLoadingOverlay } from "@/src/components/common/AdminRouteLoadingOverlay";
import { PaginationControls } from "@/src/components/common/PaginationControls";
import {
  updateAdminBookingStatus,
} from "@/src/services/adminBookings";
import type { PaginationMeta } from "@/src/types/pagination";
import AdminBookingsDesktopTable from "./components/AdminBookingsDesktopTable";
import AdminBookingsEmptyState from "./components/AdminBookingsEmptyState";
import AdminBookingsHeader from "./components/AdminBookingsHeader";
import AdminBookingsMobileCards from "./components/AdminBookingsMobileCards";
import AdminBookingsStatusTabs from "./components/AdminBookingsStatusTabs";
import type {
  Booking,
  BookingStatus,
  StatusFilter,
} from "./types/booking";

interface AdminBookingsTableProps {
  initialBookings: Booking[];
  pagination: PaginationMeta;
  initialSearchQuery: string;
  initialStatusFilter: StatusFilter;
  statusCounts: Record<
    StatusFilter,
    number
  > &
    Record<BookingStatus, number>;
}

export default function AdminBookingsTable({
  initialBookings,
  pagination,
  initialSearchQuery,
  initialStatusFilter,
  statusCounts,
}: AdminBookingsTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] =
    useTransition();
  const [searchQuery, setSearchQuery] =
    useState(initialSearchQuery);
  const [expandedId, setExpandedId] =
    useState<string | null>(null);
  const [actionMenuId, setActionMenuId] =
    useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const trimmedQuery =
        searchQuery.trim();

      if (trimmedQuery === initialSearchQuery) {
        return;
      }

      const params = new URLSearchParams();

      if (trimmedQuery) {
        params.set("q", trimmedQuery);
      }

      if (
        initialStatusFilter !== "all"
      ) {
        params.set(
          "status",
          initialStatusFilter,
        );
      }

      startTransition(() => {
        router.replace(
          params.size
            ? `${pathname}?${params.toString()}`
            : pathname,
        );
      });
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [
    initialSearchQuery,
    initialStatusFilter,
    pathname,
    router,
    searchQuery,
  ]);

  const pushQuery = ({
    nextPage = 1,
    nextStatus = initialStatusFilter,
    nextSearch = searchQuery.trim(),
  }: {
    nextPage?: number;
    nextStatus?: StatusFilter;
    nextSearch?: string;
  }) => {
    const params = new URLSearchParams();

    if (nextSearch) {
      params.set("q", nextSearch);
    }

    if (nextStatus !== "all") {
      params.set("status", nextStatus);
    }

    if (nextPage > 1) {
      params.set("page", String(nextPage));
    }

    startTransition(() => {
      router.push(
        params.size
          ? `${pathname}?${params.toString()}`
          : pathname,
      );
    });
  };

  const updateStatus = async (
    bookingId: string,
    status: BookingStatus,
  ) => {
    setUpdating(true);

    try {
      await updateAdminBookingStatus(
        bookingId,
        status,
      );
      router.refresh();
    } catch {
      console.error("Failed to update status");
    } finally {
      setUpdating(false);
      setActionMenuId(null);
    }
  };

  const hasFilters =
    Boolean(initialSearchQuery) ||
    initialStatusFilter !== "all";

  return (
    <div className="space-y-4">
      <AdminRouteLoadingOverlay
        open={isPending}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <AdminBookingsHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        <AdminBookingsStatusTabs
          counts={statusCounts}
          statusFilter={initialStatusFilter}
          onStatusChange={(status) =>
            pushQuery({
              nextStatus: status,
              nextPage: 1,
            })
          }
        />
      </div>

      {initialBookings.length === 0 ? (
        <AdminBookingsEmptyState
          hasFilters={hasFilters}
        />
      ) : (
        <>
          <AdminBookingsDesktopTable
            bookings={initialBookings}
            updating={updating}
            actionMenuId={actionMenuId}
            onToggleMenu={(bookingId) =>
              setActionMenuId(
                (currentId) =>
                  currentId === bookingId
                    ? null
                    : bookingId,
              )
            }
            onUpdateStatus={updateStatus}
          />
          <AdminBookingsMobileCards
            bookings={initialBookings}
            expandedId={expandedId}
            updating={updating}
            onToggleExpanded={(bookingId) =>
              setExpandedId(
                (currentId) =>
                  currentId === bookingId
                    ? null
                    : bookingId,
              )
            }
            onUpdateStatus={updateStatus}
          />

          <PaginationControls
            page={pagination.page}
            total={pagination.total}
            limit={pagination.limit}
            totalPages={pagination.totalPages}
            loading={isPending}
            onPageChange={(page) =>
              pushQuery({
                nextPage: page,
              })
            }
          />
        </>
      )}
    </div>
  );
}
