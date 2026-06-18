import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import BookingHistoryList from "./BookingHistoryList";
import { getHistoryBookingsByUserId } from "./bookingHistoryData";

export const metadata: Metadata = {
  title: "ประวัติการจอง — Football Booking",
  description: "ดูประวัติการจองสนามฟุตบอลของคุณ",
};

export default async function HistoryPage() {
  const cookieStore = await cookies();
  const sessionUserId = cookieStore.get("session_user_id")?.value;

  if (!sessionUserId) {
    redirect("/");
  }

  const initialBookings =
    await getHistoryBookingsByUserId(sessionUserId);

  return (
    <main className="min-h-screen bg-[#0f172a] text-white">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-[#0f172a]/90 backdrop-blur-md border-b border-white/10 px-5 py-4 flex items-center gap-3">
        <a href="/dashboard" className="text-white/70 hover:text-white p-1 -ml-1">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </a>
        <h1 className="text-lg font-bold">ประวัติการจอง</h1>
      </header>

      {/* Client Component */}
      <BookingHistoryList
        initialBookings={initialBookings}
      />
    </main>
  );
}
