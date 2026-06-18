import Link from "next/link";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { prisma } from "@/src/lib/prisma";
import { bookingStatusMeta } from "@/src/constants/statusColors";

type AdminBookingDetailPageProps = {
  params: Promise<{
    bookingId: string;
  }>;
};

const paymentStatusMeta = {
  unpaid: {
    label: "ยังไม่ชำระ",
    className:
      "border-yellow-500/20 bg-yellow-500/10 text-yellow-300",
  },
  pending_verify: {
    label: "รอตรวจสอบ",
    className:
      "border-blue-500/20 bg-blue-500/10 text-blue-300",
  },
  verified: {
    label: "ตรวจสอบแล้ว",
    className:
      "border-green-500/20 bg-green-500/10 text-green-300",
  },
  rejected: {
    label: "ปฏิเสธ",
    className:
      "border-red-500/20 bg-red-500/10 text-red-300",
  },
} as const;

export const metadata: Metadata = {
  title: "รายละเอียดการจอง — Admin",
  description: "ดูรายละเอียดรายการจองที่สร้างโดยผู้ดูแลระบบ",
};

export default async function AdminBookingDetailPage({
  params,
}: AdminBookingDetailPageProps) {
  const { bookingId } = await params;
  const cookieStore = await cookies();
  const adminId = cookieStore.get("admin_session_id")?.value;

  if (!adminId) {
    redirect("/admin/login");
  }

  const admin = await prisma.admin.findUnique({
    where: { id: adminId },
    select: {
      id: true,
      isActive: true,
      organizationId: true,
    },
  });

  if (!admin || !admin.isActive) {
    redirect("/admin/login");
  }

  const booking = await prisma.booking.findFirst({
    where: {
      id: bookingId,
      organizationId: admin.organizationId,
    },
    include: {
      user: {
        select: {
          id: true,
          displayName: true,
          phone: true,
          pictureUrl: true,
          lineUserId: true,
        },
      },
      items: {
        include: {
          court: {
            select: {
              name: true,
            },
          },
        },
        orderBy: [
          { date: "asc" },
          { startTime: "asc" },
        ],
      },
      payment: {
        select: {
          amount: true,
          status: true,
          createdAt: true,
          verifiedAt: true,
        },
      },
    },
  });

  if (!booking) {
    redirect("/admin/bookings");
  }

  const bookingStatus = bookingStatusMeta[booking.status];
  const paymentStatus = booking.payment
    ? paymentStatusMeta[booking.payment.status]
    : paymentStatusMeta.unpaid;

  return (
    <div className="space-y-6">
      <section className="glass-card rounded-3xl p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-primary">
              <span className="material-symbols-outlined">
                receipt_long
              </span>
              <span className="text-label-sm font-bold uppercase tracking-[0.18em]">
                รายละเอียดการจอง
              </span>
            </div>

            <h1 className="text-headline-lg font-headline-lg text-on-surface">
              รายละเอียดการจอง
            </h1>

            <p className="mt-1 text-body-md text-on-surface-variant">
              รหัสการจอง: {booking.id}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <StatusPill
              className={bookingStatus.softClassName}
              label={bookingStatus.label}
            />
            <StatusPill
              className={paymentStatus.className}
              label={`การชำระเงิน: ${paymentStatus.label}`}
            />
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="glass-card rounded-3xl p-5 sm:p-6">
          <div className="mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">
              schedule
            </span>
            <h2 className="text-title-md font-bold text-on-surface">
              รายการสนามและช่วงเวลา
            </h2>
          </div>

          <div className="space-y-3">
            {booking.items.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-outline-variant/10 bg-surface-container-low p-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-base font-bold text-on-surface">
                      {item.court.name}
                    </div>
                    <div className="mt-1 text-sm text-on-surface-variant">
                      {formatThaiDate(item.date)}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-bold text-primary">
                      {item.startTime} - {item.endTime}
                    </div>
                    <div className="mt-1 text-sm text-on-surface-variant">
                      {formatCurrency(Number(item.price))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="space-y-6">
          <section className="glass-card rounded-3xl p-5 sm:p-6">
            <div className="mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">
                person
              </span>
              <h2 className="text-title-md font-bold text-on-surface">
                ข้อมูลลูกค้า
              </h2>
            </div>

            <div className="space-y-4">
              <DetailRow
                label="ชื่อลูกค้า"
                value={booking.user.displayName}
              />
              <DetailRow
                label="เบอร์โทรศัพท์"
                value={
                  booking.user.phone || "ไม่ระบุ"
                }
              />
              <DetailRow
                label="ช่องทาง"
                value={
                  booking.user.lineUserId.startsWith(
                    "offline_",
                  )
                    ? "โทรจอง / ผู้ดูแลระบบ"
                    : "LINE"
                }
              />
            </div>
          </section>

          <section className="glass-card rounded-3xl p-5 sm:p-6">
            <div className="mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">
                payments
              </span>
              <h2 className="text-title-md font-bold text-on-surface">
                สรุปการชำระเงิน
              </h2>
            </div>

            <div className="space-y-4">
              <DetailRow
                label="ยอดรวม"
                value={formatCurrency(Number(booking.totalPrice))}
              />
              <DetailRow
                label="สถานะชำระเงิน"
                value={paymentStatus.label}
              />
              <DetailRow
                label="สร้างรายการ"
                value={formatDateTime(booking.createdAt)}
              />
              {booking.payment?.verifiedAt && (
                <DetailRow
                  label="ยืนยันการชำระ"
                  value={formatDateTime(
                    booking.payment.verifiedAt,
                  )}
                />
              )}
              {booking.notes && (
                <div className="rounded-2xl border border-outline-variant/10 bg-surface-container-low p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.14em] text-on-surface-variant">
                    หมายเหตุ
                  </div>
                  <p className="mt-2 text-sm leading-6 text-on-surface">
                    {booking.notes}
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/admin/all-bookings"
          className="inline-flex h-11 items-center justify-center rounded-xl border border-outline-variant/20 bg-surface-container-low px-4 text-label-md font-bold text-on-surface transition-all hover:bg-surface-container-high"
        >
          กลับไปหน้ารายการจอง
        </Link>
        <Link
          href="/admin/availability"
          className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-4 text-label-md font-bold text-on-primary transition-all hover:brightness-110"
        >
          สร้างรายการจองเพิ่ม
        </Link>
      </div>
    </div>
  );
}

function StatusPill({
  label,
  className,
}: {
  label: string;
  className: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${className}`}
    >
      {label}
    </span>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-outline-variant/10 pb-3 last:border-b-0 last:pb-0">
      <span className="text-sm text-on-surface-variant">
        {label}
      </span>
      <span className="text-right text-sm font-semibold text-on-surface">
        {value}
      </span>
    </div>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatThaiDate(value: Date) {
  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "full",
  }).format(value);
}

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}
