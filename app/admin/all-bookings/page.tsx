"use client";

import { useCallback, useEffect, useState } from "react";

import RecentBookingsTable, {
} from "./AllBookingsView";
import { Booking, BookingStatus } from "./types/booking";


export default function AdminBookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchBookings = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch("/api/admin/bookings", {
                method: "GET",
                cache: "no-store",
            });

            if (!response.ok) {
                throw new Error("Unable to load bookings");
            }

            const result = await response.json();

            const bookingList = Array.isArray(result)
                ? result
                : result.bookings ?? [];

            setBookings(bookingList);
        } catch (error) {
            console.error("Fetch bookings error:", error);

            setError(
                error instanceof Error
                    ? error.message
                    : "Unable to load bookings"
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    const updateBookingStatus = async (
        bookingId: string,
        status: BookingStatus
    ) => {
        const response = await fetch(
            `/api/admin/bookings`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    bookingId,
                    status,
                }),
            }
        );

        if (!response.ok) {
            const result = await response.json().catch(() => null);

            throw new Error(
                result?.message || "Unable to update booking status"
            );
        }

        /*
         * อัปเดตข้อมูลบนหน้าจอทันที
         * ไม่ต้องโหลดรายการใหม่ทั้งหมด
         */
        setBookings((currentBookings) =>
            currentBookings.map((booking) =>
                booking.id === bookingId
                    ? {
                        ...booking,
                        status,
                    }
                    : booking
            )
        );
    };

    return (
        <div className="w-full min-w-0 max-w-full space-y-6">
            <div>
                <h1 className="text-headline-lg font-headline-lg">
                    จัดการการจอง
                </h1>

                <p className="mt-1 text-body-md text-on-surface-variant">
                    ดูและจัดการรายการจองสนามทั้งหมด
                </p>
            </div>

            {error && (
                <div className="flex items-center justify-between gap-4 rounded-xl border border-error/20 bg-error/10 p-4 text-error">
                    <p>{error}</p>

                    <button
                        type="button"
                        onClick={fetchBookings}
                        className="shrink-0 font-bold hover:underline"
                    >
                        ลองใหม่อีกครั้ง
                    </button>
                </div>
            )}

            <RecentBookingsTable
                bookings={bookings}
                loading={loading}
                itemsPerPage={10}
                onUpdateStatus={updateBookingStatus}
                onViewAll={fetchBookings}
                title="รายการจองทั้งหมด"
            />
        </div>
    );
}