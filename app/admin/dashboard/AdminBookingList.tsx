"use client";

import { useState, useEffect } from "react";

type BookingItem = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  price: string;
  court: { name: string };
};

type User = {
  displayName: string;
  pictureUrl: string | null;
  phone: string | null;
};

type Booking = {
  id: string;
  totalPrice: string;
  status: "pending" | "paid" | "confirmed" | "cancelled" | "completed";
  createdAt: string;
  items: BookingItem[];
  user: User;
};

type StatusFilter = "all" | "pending" | "paid" | "confirmed" | "cancelled" | "completed";

export default function AdminBookingList() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);


  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await fetch("/api/admin/bookings");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      if (data.bookings) setBookings(data.bookings);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (bookingId: string, newStatus: string) => {
    setUpdatingId(bookingId);
    try {
      const res = await fetch("/api/admin/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update");

      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus as Booking["status"] } : b))
      );
    } catch (err) {
      alert("ไม่สามารถอัปเดตสถานะได้");
    } finally {
      setUpdatingId(null);
    }
  };

  const formatPrice = (price: string) => Number(price).toLocaleString("th-TH");

  // Dynamic values calculation
  const pendingCount = bookings.filter(b => b.status === "pending" || b.status === "paid").length;
  const confirmedCount = bookings.filter(b => b.status === "confirmed").length;
  const completedCount = bookings.filter(b => b.status === "completed").length;
  const cancelledCount = bookings.filter(b => b.status === "cancelled").length;

  // Revenue calculation
  let todayRevenue = 0;
  let monthlyRevenue = 0;
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const monthStart = new Date(todayStart.getFullYear(), todayStart.getMonth(), 1);

  bookings.forEach((b) => {
    if (b.status === "confirmed" || b.status === "completed" || b.status === "paid") {
      const priceVal = Number(b.totalPrice) || 0;
      const createdDate = new Date(b.createdAt);
      if (createdDate >= todayStart) {
        todayRevenue += priceVal;
      }
      if (createdDate >= monthStart) {
        monthlyRevenue += priceVal;
      }
    }
  });

  // Extract unique fields/courts dynamically
  const uniqueCourts = Array.from(
    new Set(
      bookings
        .map((b) => b.items[0]?.court?.name)
        .filter((name): name is string => !!name)
    )
  );


    const getStatusBadge = (status: Booking["status"]) => {
    switch (status) {
      case "pending":
      case "paid":
        return (
          <span className="px-3 py-1 rounded-full text-label-sm font-bold bg-surface-variant/40 text-on-surface-variant border border-outline-variant/20">
            รอดำเนินการ
          </span>
        );
      case "confirmed":
        return (
          <span className="px-3 py-1 rounded-full text-label-sm font-bold bg-primary-container/20 text-primary border border-primary/20">
            ยืนยันแล้ว
          </span>
        );
      case "completed":
        return (
          <span className="px-3 py-1 rounded-full text-label-sm font-bold bg-primary-container/20 text-primary border border-primary/20">
            เสร็จสิ้น
          </span>
        );
      case "cancelled":
        return (
          <span className="px-3 py-1 rounded-full text-label-sm font-bold bg-error-container/20 text-error border border-error/20">
            ยกเลิกแล้ว
          </span>
        );
    }
  };

  return (
    <>
      {/* 1. Top Statistics: KPI Cards */}
      <section className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-md mb-lg">
        {/* Pending */}
        <div className="glass-card p-md rounded-xl flex flex-col justify-between hover:border-primary/20 transition-all duration-300 cursor-default">
          <div className="flex justify-between items-start">
            <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">pending_actions</span>
            <span className="text-label-sm font-label-sm text-primary flex items-center gap-0.5">
              +12% <span className="material-symbols-outlined text-[14px]">trending_up</span>
            </span>
          </div>
          <div className="mt-4">
            <p className="text-label-sm font-label-sm text-on-surface-variant">รอดำเนินการ</p>
            <h3 className="text-headline-md font-headline-md">{pendingCount}</h3>
          </div>
        </div>

        {/* Confirmed */}
        <div className="glass-card p-md rounded-xl flex flex-col justify-between hover:border-primary/20 transition-all duration-300 cursor-default">
          <div className="flex justify-between items-start">
            <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">check_circle</span>
            <span className="text-label-sm font-label-sm text-primary flex items-center gap-0.5">
              +5% <span className="material-symbols-outlined text-[14px]">trending_up</span>
            </span>
          </div>
          <div className="mt-4">
            <p className="text-label-sm font-label-sm text-on-surface-variant">ยืนยันแล้ว</p>
            <h3 className="text-headline-md font-headline-md">{confirmedCount}</h3>
          </div>
        </div>

        {/* Completed */}
        <div className="glass-card p-md rounded-xl flex flex-col justify-between hover:border-primary/20 transition-all duration-300 cursor-default">
          <div className="flex justify-between items-start">
            <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">task_alt</span>
            <span className="text-label-sm font-label-sm text-on-surface-variant">คงที่</span>
          </div>
          <div className="mt-4">
            <p className="text-label-sm font-label-sm text-on-surface-variant">เสร็จสิ้น</p>
            <h3 className="text-headline-md font-headline-md">{completedCount}</h3>
          </div>
        </div>

        {/* Cancelled */}
        <div className="glass-card p-md rounded-xl flex flex-col justify-between hover:border-primary/20 transition-all duration-300 cursor-default">
          <div className="flex justify-between items-start">
            <span className="material-symbols-outlined text-error bg-error/10 p-2 rounded-lg">cancel</span>
            <span className="text-label-sm font-label-sm text-error flex items-center gap-0.5">
              -2% <span className="material-symbols-outlined text-[14px]">trending_down</span>
            </span>
          </div>
          <div className="mt-4">
            <p className="text-label-sm font-label-sm text-on-surface-variant">ยกเลิกแล้ว</p>
            <h3 className="text-headline-md font-headline-md">{cancelledCount}</h3>
          </div>
        </div>

        {/* Today's Revenue */}
        <div className="glass-card p-md rounded-xl flex flex-col justify-between hover:border-primary/20 transition-all duration-300 cursor-default col-span-1">
          <div className="flex justify-between items-start">
            <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">payments</span>
            <span className="text-label-sm font-label-sm text-primary flex items-center gap-0.5">
              +24% <span className="material-symbols-outlined text-[14px]">trending_up</span>
            </span>
          </div>
          <div className="mt-4">
            <p className="text-label-sm font-label-sm text-on-surface-variant">รายได้วันนี้</p>
            <h3 className="text-headline-md font-headline-md">฿{formatPrice(todayRevenue.toString())}</h3>
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className="glass-card p-md rounded-xl flex flex-col justify-between hover:border-primary/20 transition-all duration-300 cursor-default">
          <div className="flex justify-between items-start">
            <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">account_balance_wallet</span>
            <span className="text-label-sm font-label-sm text-primary flex items-center gap-0.5">
              +8% <span className="material-symbols-outlined text-[14px]">trending_up</span>
            </span>
          </div>
          <div className="mt-4">
            <p className="text-label-sm font-label-sm text-on-surface-variant">รายได้เดือนนี้</p>
            <h3 className="text-headline-md font-headline-md">฿{formatPrice(monthlyRevenue.toString())}</h3>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-lg mb-lg">
        {/* 3. Booking Management Table (Span 2) */}


        {/* 4. Revenue & Stats Visualization */}
        <div className="flex flex-col gap-lg">
          {/* Revenue Line Chart Visualization */}
          <div className="glass-card rounded-xl p-md flex-1">
            <div className="flex justify-between items-center mb-md">
              <h3 className="text-headline-md font-headline-md">การเติบโตรายได้</h3>
              <span className="text-label-sm font-label-sm bg-primary/10 text-primary px-2 py-1 rounded">รายสัปดาห์</span>
            </div>
            <div className="relative h-48 w-full mt-4 flex items-end justify-between gap-1">
              <div className="w-full h-full relative group">
                <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                  <defs>
                    <linearGradient id="lineGrad" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#4be277" stopOpacity="0.5" />
                      <stop offset="100%" stopColor="#4be277" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M0 80 Q 25 20, 50 60 T 100 30 V 100 H 0 Z" fill="url(#lineGrad)" />
                  <path d="M0 80 Q 25 20, 50 60 T 100 30" fill="none" stroke="#4be277" strokeWidth="2" />
                </svg>
              </div>
            </div>
            <div className="grid grid-cols-5 mt-4 text-center">
              <span className="text-label-sm text-on-surface-variant">จ.</span>
              <span className="text-label-sm text-on-surface-variant">อ.</span>
              <span className="text-label-sm text-on-surface-variant">พ.</span>
              <span className="text-label-sm text-on-surface-variant">พฤ.</span>
              <span className="text-label-sm text-on-surface-variant">ศ.</span>
            </div>
          </div>

          {/* Daily Load Bar Chart */}
          <div className="glass-card rounded-xl p-md flex-1">
            <div className="flex justify-between items-center mb-md">
              <h3 className="text-headline-md font-headline-md">ปริมาณการใช้งาน</h3>
              <span className="text-label-sm font-label-sm text-on-surface-variant">จำนวนที่จอง</span>
            </div>
            <div className="flex items-end justify-between h-32 gap-3 px-2">
              <div className="w-full bg-primary/20 rounded-t-lg h-[40%] hover:bg-primary transition-all duration-300"></div>
              <div className="w-full bg-primary/20 rounded-t-lg h-[65%] hover:bg-primary transition-all duration-300"></div>
              <div className="w-full bg-primary/20 rounded-t-lg h-[90%] hover:bg-primary transition-all duration-300"></div>
              <div className="w-full bg-primary/20 rounded-t-lg h-[75%] hover:bg-primary transition-all duration-300"></div>
              <div className="w-full bg-primary/20 rounded-t-lg h-[85%] hover:bg-primary transition-all duration-300"></div>
              <div className="w-full bg-primary/20 rounded-t-lg h-[100%] hover:bg-primary transition-all duration-300"></div>
              <div className="w-full bg-primary/20 rounded-t-lg h-[45%] hover:bg-primary transition-all duration-300"></div>
            </div>
            <div className="grid grid-cols-7 mt-4 text-center">
              <span className="text-label-sm text-on-surface-variant">จ</span>
              <span className="text-label-sm text-on-surface-variant">อ</span>
              <span className="text-label-sm text-on-surface-variant">พ</span>
              <span className="text-label-sm text-on-surface-variant">พฤ</span>
              <span className="text-label-sm text-on-surface-variant">ศ</span>
              <span className="text-label-sm text-on-surface-variant">ส</span>
              <span className="text-label-sm text-on-surface-variant">อา</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
