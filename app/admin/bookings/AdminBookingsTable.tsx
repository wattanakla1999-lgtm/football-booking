"use client";

import { useState } from "react";

import AdminBookingsDesktopTable from "./components/AdminBookingsDesktopTable";
import AdminBookingsEmptyState from "./components/AdminBookingsEmptyState";
import AdminBookingsHeader from "./components/AdminBookingsHeader";
import AdminBookingsMobileCards from "./components/AdminBookingsMobileCards";
import AdminBookingsStatusTabs from "./components/AdminBookingsStatusTabs";
import { useAdminBookingFilters } from "./hooks/useAdminBookingFilters";
import {
  fetchAdminBookings,
  updateAdminBookingStatus,
} from "@/src/services/adminBookings";
import { LoadingSpinner } from "@/src/components/ui";

import type {
  Booking,
  BookingStatus,
} from "./types/booking";

interface AdminBookingsTableProps {
  initialBookings: Booking[];
}

export default function AdminBookingsTable({
  initialBookings,
}: AdminBookingsTableProps) {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const {
    filteredBookings,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
  } = useAdminBookingFilters(bookings);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const nextBookings = await fetchAdminBookings<Booking>();
      setBookings(nextBookings);
    } catch {
      console.error("Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (
    bookingId: string,
    status: BookingStatus
  ) => {
    setUpdating(true);
    try {
      await updateAdminBookingStatus(bookingId, status);
      await fetchBookings();
    } catch {
      console.error("Failed to update status");
    } finally {
      setUpdating(false);
      setActionMenuId(null);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.5rem" }}>
        <AdminBookingsHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        <AdminBookingsStatusTabs
          bookings={bookings}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
        />
      </div>

      {loading && <LoadingSpinner />}

      {!loading && filteredBookings.length === 0 && (
        <AdminBookingsEmptyState
          hasFilters={Boolean(searchQuery) || statusFilter !== "all"}
        />
      )}

      {!loading && filteredBookings.length > 0 && (
        <>
          <AdminBookingsDesktopTable
            bookings={filteredBookings}
            updating={updating}
            actionMenuId={actionMenuId}
            onToggleMenu={(bookingId) =>
              setActionMenuId((currentId) =>
                currentId === bookingId
                  ? null
                  : bookingId
              )
            }
            onUpdateStatus={updateStatus}
          />
          <AdminBookingsMobileCards
            bookings={filteredBookings}
            expandedId={expandedId}
            updating={updating}
            onToggleExpanded={(bookingId) =>
              setExpandedId((currentId) =>
                currentId === bookingId
                  ? null
                  : bookingId
              )
            }
            onUpdateStatus={updateStatus}
          />

          <div style={{
            marginTop: "1rem",
            fontSize: "0.7rem",
            color: "rgba(255,255,255,0.3)",
            textAlign: "center",
          }}>
            แสดง {filteredBookings.length} จาก {bookings.length} รายการ
          </div>
        </>
      )}
    </div>
  );
}
