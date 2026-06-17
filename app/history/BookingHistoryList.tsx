"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type Court = {
  name: string;
  surface: string | null;
};

type BookingItem = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  price: string;
  court: Court;
};

type Payment = {
  id: string;
  status: string;
} | null;

type BookingStatus =
  | "pending"
  | "paid"
  | "confirmed"
  | "cancelled"
  | "completed";

type Booking = {
  id: string;
  totalPrice: string;
  status: BookingStatus;
  createdAt: string;
  items: BookingItem[];
  payment: Payment;
};

type StatusFilter = "all" | BookingStatus;

const STATUS_OPTIONS: Array<{
  value: StatusFilter;
  label: string;
}> = [
    { value: "all", label: "ทั้งหมด" },
    { value: "pending", label: "รอดำเนินการ" },
    { value: "paid", label: "รอตรวจสอบ" },
    { value: "confirmed", label: "ยืนยันแล้ว" },
    { value: "completed", label: "เสร็จสิ้น" },
    { value: "cancelled", label: "ยกเลิก" },
  ];

export default function BookingHistoryList() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchKeyword, setSearchKeyword] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("all");

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/user/bookings", {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("ไม่สามารถโหลดประวัติการจองได้");
      }

      const data = await response.json();

      setBookings(
        Array.isArray(data)
          ? data
          : Array.isArray(data.bookings)
            ? data.bookings
            : [],
      );
    } catch (err) {
      console.error("Fetch user bookings error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "เกิดข้อผิดพลาดในการโหลดข้อมูล",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const statusSummary = useMemo(() => {
    return bookings.reduce(
      (summary, booking) => {
        summary.all += 1;
        summary[booking.status] += 1;
        return summary;
      },
      {
        all: 0,
        pending: 0,
        paid: 0,
        confirmed: 0,
        completed: 0,
        cancelled: 0,
      } satisfies Record<StatusFilter, number>,
    );
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();

    return bookings.filter((booking) => {
      const bookingId = booking.id.toLowerCase();

      const fieldNames = booking.items
        .map((item) => item.court?.name || "")
        .join(" ")
        .toLowerCase();

      const surfaces = booking.items
        .map((item) => item.court?.surface || "")
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        keyword === "" ||
        bookingId.includes(keyword) ||
        fieldNames.includes(keyword) ||
        surfaces.includes(keyword);

      const matchesStatus =
        statusFilter === "all" ||
        booking.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [bookings, searchKeyword, statusFilter]);

  const clearFilters = () => {
    setSearchKeyword("");
    setStatusFilter("all");
  };

  const hasActiveFilters =
    searchKeyword.trim() !== "" || statusFilter !== "all";

  const handlePayment = (booking: Booking) => {
    /*
     * เปลี่ยนส่วนนี้เป็นการเปิด Modal
     * หรือ router.push ไปหน้าชำระเงินภายหลังได้
     */
    alert(
      `แจ้งชำระเงินสำหรับรายการ #${shortBookingId(booking.id)}`,
    );
  };

  return (
    <div className="">
      <div className="mx-auto w-full max-w-7xl space-y-5">
        {/* Header */}
        <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04]">
          <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="mb-2 flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-500/10 text-green-400">
                  <span className="material-symbols-outlined text-[21px]">
                    history
                  </span>
                </div>

                <span className="text-xs font-bold uppercase tracking-[0.16em] text-green-400">
                  Booking History
                </span>
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                ประวัติการจอง
              </h1>

              <p className="mt-1 text-sm text-white/50">
                ตรวจสอบรายการจอง ช่วงเวลา และสถานะการชำระเงิน
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <div className="rounded-2xl border border-green-500/20 bg-green-500/10 px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-green-400/70">
                  รายการทั้งหมด
                </p>

                <p className="mt-0.5 text-2xl font-bold text-green-400">
                  {bookings.length}
                </p>
              </div>

              <button
                type="button"
                onClick={fetchBookings}
                disabled={loading}
                className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/60 transition-all hover:border-green-500/30 hover:bg-green-500/10 hover:text-green-400 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="โหลดข้อมูลใหม่"
              >
                <span
                  className={`material-symbols-outlined text-[22px] ${loading ? "animate-spin" : ""
                    }`}
                >
                  refresh
                </span>
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="border-t border-white/10 p-5 sm:p-6">
            <div className="relative">
              <span className="material-symbols-outlined pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[21px] text-white/40">
                search
              </span>

              <input
                type="search"
                value={searchKeyword}
                onChange={(event) =>
                  setSearchKeyword(event.target.value)
                }
                placeholder="ค้นหา Booking ID, ชื่อสนาม หรือประเภทพื้นสนาม"
                className="h-12 w-full min-w-0 rounded-2xl border border-white/10 bg-black/20 pl-12 pr-11 text-sm text-white outline-none transition-all placeholder:text-white/30 focus:border-green-500/50 focus:bg-black/30 focus:ring-4 focus:ring-green-500/10"
              />

              {searchKeyword && (
                <button
                  type="button"
                  onClick={() => setSearchKeyword("")}
                  className="absolute right-4 top-1/2 flex -translate-y-1/2 items-center justify-center text-white/40 transition-colors hover:text-white"
                  aria-label="ล้างการค้นหา"
                >
                  <span className="material-symbols-outlined text-[19px]">
                    close
                  </span>
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Status filters */}
        <section className="flex w-full gap-2 overflow-x-auto pb-1">
          {STATUS_OPTIONS.map((option) => {
            const isActive = statusFilter === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setStatusFilter(option.value)}
                className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-xl border px-3.5 text-xs font-bold transition-all active:scale-95 ${isActive
                  ? "border-green-500/30 bg-green-500 text-white shadow-lg shadow-green-500/10"
                  : "border-white/10 bg-white/[0.04] text-white/50 hover:border-green-500/20 hover:bg-green-500/10 hover:text-green-400"
                  }`}
              >
                {option.label}

                <span
                  className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] ${isActive
                    ? "bg-black/20 text-white"
                    : "bg-white/10 text-white/50"
                    }`}
                >
                  {statusSummary[option.value]}
                </span>
              </button>
            );
          })}
        </section>

        {/* Result header */}
        {!loading && !error && bookings.length > 0 && (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">
                รายการจองของคุณ
              </h2>

              <p className="mt-0.5 text-xs text-white/40">
                พบ {filteredBookings.length} จาก {bookings.length} รายการ
              </p>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex w-fit items-center gap-1.5 text-xs font-bold text-red-400 transition-colors hover:text-red-300"
              >
                <span className="material-symbols-outlined text-[17px]">
                  filter_alt_off
                </span>

                ล้างตัวกรอง
              </button>
            )}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <BookingSkeleton />
        ) : error ? (
          <ErrorState
            message={error}
            onRetry={fetchBookings}
          />
        ) : bookings.length === 0 ? (
          <EmptyState
            title="คุณยังไม่มีประวัติการจอง"
            description="เมื่อคุณจองสนาม รายการจองจะปรากฏอยู่ในหน้านี้"
            icon="event_busy"
          />
        ) : filteredBookings.length === 0 ? (
          <EmptyState
            title="ไม่พบรายการที่ค้นหา"
            description="ลองเปลี่ยนคำค้นหา หรือเลือกสถานะอื่น"
            icon="search_off"
            actionLabel="ล้างตัวกรอง"
            onAction={clearFilters}
          />
        ) : (
          <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2">
            {filteredBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onPayment={() => handlePayment(booking)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function BookingCard({
  booking,
  onPayment,
}: {
  booking: Booking;
  onPayment: () => void;
}) {
  const firstItem = booking.items?.[0];

  const primaryCourtName =
    firstItem?.court?.name || "สนามฟุตบอล";

  const bookingDate = firstItem?.date
    ? formatDate(firstItem.date)
    : "ไม่พบวันที่";

  const additionalCourtCount = Math.max(
    new Set(
      booking.items
        .map((item) => item.court?.name)
        .filter(Boolean),
    ).size - 1,
    0,
  );

  return (
    <article className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] transition-all duration-200 hover:-translate-y-0.5 hover:border-green-500/20 hover:bg-white/[0.055]">
      {/* Card header */}
      <div className="flex min-w-0 items-start justify-between gap-3 border-b border-white/10 p-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-500/10 text-green-400">
            <span className="material-symbols-outlined text-[21px]">
              sports_soccer
            </span>
          </div>

          <div className="min-w-0">
            <h3 className="truncate text-base font-bold text-green-400">
              {primaryCourtName}
            </h3>

            <div className="mt-0.5 flex min-w-0 items-center gap-1.5 text-[11px] text-white/40">
              <span className="material-symbols-outlined shrink-0 text-[14px]">
                confirmation_number
              </span>

              <span className="truncate font-mono">
                #{shortBookingId(booking.id)}
              </span>
            </div>
          </div>
        </div>

        <StatusBadge status={booking.status} />
      </div>

      {/* Main information */}
      <div className="flex-1 space-y-4 p-4">
        <div className="grid min-w-0 grid-cols-2 gap-2">
          <InformationBox
            icon="calendar_today"
            label="วันที่จอง"
            value={bookingDate}
          />

          <InformationBox
            icon="grass"
            label="พื้นสนาม"
            value={firstItem?.court?.surface || "ไม่ระบุ"}
          />
        </div>

        {/* Booking slots */}
        <div className="overflow-hidden rounded-xl border border-white/10 bg-black/20">
          <div className="flex items-center justify-between border-b border-white/10 px-3 py-2.5">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[17px] text-green-400">
                schedule
              </span>

              <p className="text-xs font-bold text-white/70">
                ช่วงเวลาที่จอง
              </p>
            </div>

            <span className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-bold text-white/50">
              {booking.items.length} รายการ
            </span>
          </div>

          <div className="divide-y divide-white/10">
            {booking.items.map((item) => (
              <BookingTimeRow
                key={item.id}
                item={item}
                showCourtName={
                  item.court?.name !== primaryCourtName ||
                  additionalCourtCount > 0
                }
              />
            ))}
          </div>
        </div>

        {/* Payment */}
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/35">
              สถานะการชำระเงิน
            </p>

            <div className="mt-1 flex items-center gap-1.5">
              <span
                className={`h-2 w-2 shrink-0 rounded-full ${booking.payment
                  ? "bg-green-400"
                  : "bg-yellow-400"
                  }`}
              />

              <span className="truncate text-xs text-white/60">
                {getPaymentLabel(booking)}
              </span>
            </div>
          </div>

          <div className="shrink-0 text-right">
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/35">
              ยอดรวม
            </p>

            <p className="mt-0.5 text-xl font-bold text-white">
              <span className="mr-0.5 text-sm text-green-400">
                ฿
              </span>
              {formatPrice(booking.totalPrice)}
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-col gap-3 border-t border-white/10 bg-black/10 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-1.5 text-[11px] text-white/35">
          <span className="material-symbols-outlined shrink-0 text-[15px]">
            history
          </span>

          <span className="truncate">
            สร้างเมื่อ {formatCreatedAt(booking.createdAt)}
          </span>
        </div>

        {booking.status === "pending" ? (
          <button
            type="button"
            onClick={onPayment}
            className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-green-500/30 bg-green-500/10 px-3 text-xs font-bold text-green-400 transition-all hover:bg-green-500 hover:text-white active:scale-95"
          >
            <span className="material-symbols-outlined text-[17px]">
              upload_file
            </span>

            แจ้งชำระเงิน
          </button>
        ) : (
          <div className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 text-[11px] font-bold text-white/40">
            <span className="material-symbols-outlined text-[16px]">
              receipt_long
            </span>

            ดูรายละเอียด
          </div>
        )}
      </div>
    </article>
  );
}

function BookingTimeRow({
  item,
  showCourtName,
}: {
  item: BookingItem;
  showCourtName: boolean;
}) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-3 px-3 py-2.5">
      <div className="flex min-w-0 items-center gap-2">
        <span className="material-symbols-outlined shrink-0 text-[16px] text-white/35">
          schedule
        </span>

        <div className="min-w-0">
          <p className="whitespace-nowrap text-xs font-medium text-white/80">
            {item.startTime} - {item.endTime}
          </p>

          {showCourtName && (
            <p className="mt-0.5 truncate text-[10px] text-white/35">
              {item.court?.name || "สนามฟุตบอล"}
            </p>
          )}
        </div>
      </div>

      <span className="shrink-0 text-xs font-bold text-white/55">
        ฿{formatPrice(item.price)}
      </span>
    </div>
  );
}

function InformationBox({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 items-start gap-2.5 rounded-xl border border-white/10 bg-black/15 p-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-500/10 text-green-400">
        <span className="material-symbols-outlined text-[17px]">
          {icon}
        </span>
      </div>

      <div className="min-w-0">
        <p className="text-[9px] font-bold uppercase tracking-wider text-white/35">
          {label}
        </p>

        <p
          title={value}
          className="mt-1 truncate text-xs font-bold text-white/80"
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: BookingStatus;
}) {
  const config: Record<
    BookingStatus,
    {
      label: string;
      icon: string;
      className: string;
    }
  > = {
    pending: {
      label: "รอดำเนินการ",
      icon: "schedule",
      className:
        "border-yellow-500/30 bg-yellow-500/15 text-yellow-400",
    },
    paid: {
      label: "รอตรวจสอบ",
      icon: "payments",
      className:
        "border-blue-500/30 bg-blue-500/15 text-blue-400",
    },
    confirmed: {
      label: "ยืนยันแล้ว",
      icon: "verified",
      className:
        "border-green-500/30 bg-green-500/15 text-green-400",
    },
    completed: {
      label: "เสร็จสิ้น",
      icon: "task_alt",
      className:
        "border-white/20 bg-white/10 text-white/60",
    },
    cancelled: {
      label: "ยกเลิก",
      icon: "cancel",
      className:
        "border-red-500/30 bg-red-500/15 text-red-400",
    },
  };

  const statusConfig = config[status];

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-lg border px-2 py-1 text-[10px] font-bold ${statusConfig.className}`}
    >
      <span className="material-symbols-outlined text-[13px]">
        {statusConfig.icon}
      </span>

      <span className="hidden xs:inline">
        {statusConfig.label}
      </span>
    </span>
  );
}

function BookingSkeleton() {
  return (
    <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2 sx:grid-cols-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]"
        >
          <div className="flex items-center justify-between border-b border-white/10 p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/10" />

              <div>
                <div className="h-4 w-28 rounded bg-white/10" />
                <div className="mt-2 h-3 w-20 rounded bg-white/10" />
              </div>
            </div>

            <div className="h-7 w-20 rounded-lg bg-white/10" />
          </div>

          <div className="space-y-4 p-4">
            <div className="grid grid-cols-2 gap-2">
              <div className="h-16 rounded-xl bg-white/10" />
              <div className="h-16 rounded-xl bg-white/10" />
            </div>

            <div className="h-28 rounded-xl bg-white/10" />

            <div className="flex items-end justify-between">
              <div>
                <div className="h-3 w-24 rounded bg-white/10" />
                <div className="mt-2 h-3 w-32 rounded bg-white/10" />
              </div>

              <div className="h-7 w-24 rounded bg-white/10" />
            </div>
          </div>

          <div className="h-16 border-t border-white/10 bg-white/[0.02]" />
        </div>
      ))}
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <section className="flex min-h-72 flex-col items-center justify-center rounded-3xl border border-red-500/20 bg-red-500/[0.06] p-8 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">
        <span className="material-symbols-outlined text-[30px]">
          error
        </span>
      </div>

      <h2 className="mt-4 text-lg font-bold text-white">
        โหลดข้อมูลไม่สำเร็จ
      </h2>

      <p className="mt-2 max-w-md text-sm text-white/50">
        {message}
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-red-500 px-4 text-xs font-bold text-white transition-all hover:bg-red-400 active:scale-95"
      >
        <span className="material-symbols-outlined text-[18px]">
          refresh
        </span>

        ลองอีกครั้ง
      </button>
    </section>
  );
}

function EmptyState({
  title,
  description,
  icon,
  actionLabel,
  onAction,
}: {
  title: string;
  description: string;
  icon: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <section className="flex min-h-72 flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-500/10 text-green-400">
        <span className="material-symbols-outlined text-[34px]">
          {icon}
        </span>
      </div>

      <h2 className="mt-4 text-lg font-bold text-white">
        {title}
      </h2>

      <p className="mt-2 max-w-md text-sm leading-6 text-white/45">
        {description}
      </p>

      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-green-500 px-4 text-xs font-bold text-white transition-all hover:bg-green-400 active:scale-95"
        >
          <span className="material-symbols-outlined text-[18px]">
            filter_alt_off
          </span>

          {actionLabel}
        </button>
      )}
    </section>
  );
}

function formatPrice(price: string | number) {
  const numericPrice = Number(price);

  if (!Number.isFinite(numericPrice)) {
    return "0";
  }

  return numericPrice.toLocaleString("th-TH", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

function formatDate(dateValue: string) {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "ไม่พบวันที่";
  }

  return date.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatCreatedAt(dateValue: string) {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "ไม่พบข้อมูล";
  }

  return date.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function shortBookingId(bookingId: string) {
  return bookingId.slice(-8).toUpperCase();
}

function getPaymentLabel(booking: Booking) {
  if (!booking.payment) {
    return "ยังไม่มีข้อมูลการชำระเงิน";
  }

  switch (booking.payment.status.toLowerCase()) {
    case "pending":
      return "กำลังรอตรวจสอบการชำระเงิน";

    case "paid":
    case "success":
    case "completed":
      return "ชำระเงินแล้ว";

    case "failed":
      return "การชำระเงินไม่สำเร็จ";

    case "cancelled":
      return "ยกเลิกการชำระเงิน";

    default:
      return booking.payment.status;
  }
}