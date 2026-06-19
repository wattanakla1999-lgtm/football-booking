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
import { FeedbackMessage } from "@/src/components/ui/Feedback";
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
  const [detailLoadingId, setDetailLoadingId] =
    useState<string | null>(null);
  const [actionMessage, setActionMessage] =
    useState("");

  const getConfirmMessage = (
    status: BookingStatus,
  ) => {
    switch (status) {
      case "confirmed":
        return "ยืนยันการจองรายการนี้ใช่หรือไม่?";
      case "cancelled":
        return "ยกเลิกรายการจองนี้ใช่หรือไม่?";
      case "completed":
        return "ทำเครื่องหมายว่ารายการนี้เสร็จสิ้นแล้วใช่หรือไม่?";
      case "no_show":
        return "ยืนยันว่าลูกค้าไม่มาหน้างานใช่หรือไม่?";
      case "expired":
        return "ทำเครื่องหมายว่าคำขอนี้หมดเวลารอใช่หรือไม่?";
      default:
        return "ยืนยันการเปลี่ยนสถานะรายการนี้ใช่หรือไม่?";
    }
  };

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
    if (!window.confirm(getConfirmMessage(status))) {
      return;
    }

    setUpdating(true);
    setActionMessage("");

    try {
      await updateAdminBookingStatus(
        bookingId,
        status,
      );
      setActionMessage("อัปเดตสถานะรายการจองเรียบร้อยแล้ว");
      router.refresh();
    } catch (error) {
      console.error("Failed to update status", error);
      setActionMessage(
        error instanceof Error
          ? error.message
          : "ไม่สามารถอัปเดตสถานะรายการจองได้",
      );
    } finally {
      setUpdating(false);
      setActionMenuId(null);
    }
  };

  const handleViewDetails = (
    bookingId: string,
  ) => {
    setActionMenuId(null);
    setExpandedId(null);
    setDetailLoadingId(bookingId);
    window.location.assign(
      `/admin/bookings/${bookingId}`,
    );
  };

  const hasFilters =
    Boolean(initialSearchQuery) ||
    initialStatusFilter !== "all";

  return (
    <div className="space-y-4">
      <AdminRouteLoadingOverlay
        open={
          isPending ||
          updating ||
          detailLoadingId !== null
        }
      />

      <FeedbackMessage
        variant={actionMessage.includes("เรียบร้อย") ? "success" : "error"}
      >
        {actionMessage}
      </FeedbackMessage>

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
            onViewDetails={handleViewDetails}
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
            onViewDetails={handleViewDetails}
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
