"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

import { EmptyState } from "@/src/components/common";
import { Input } from "@/src/components/ui";

import type { CustomerSummary } from "./types/customer";

type CustomersListViewProps = {
  customers: CustomerSummary[];
};

function formatPrice(value: number) {
  return value.toLocaleString("th-TH", {
    maximumFractionDigits: 0,
  });
}

function formatThaiDate(dateValue: string | null) {
  if (!dateValue) {
    return "-";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "?";
}

export default function CustomersListView({
  customers,
}: CustomersListViewProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCustomers = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();

    if (!keyword) {
      return customers;
    }

    return customers.filter((customer) =>
      [
        customer.displayName,
        customer.phone,
        customer.email,
        customer.favoriteCourt,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(keyword),
        ),
    );
  }, [customers, searchQuery]);

  const summary = useMemo(() => {
    return customers.reduce(
      (accumulator, customer) => {
        accumulator.total += 1;
        accumulator.active += customer.status === "active" ? 1 : 0;
        accumulator.offline += customer.source === "offline" ? 1 : 0;
        accumulator.revenue += customer.totalSpent;
        return accumulator;
      },
      {
        total: 0,
        active: 0,
        offline: 0,
        revenue: 0,
      },
    );
  }, [customers]);

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-headline-lg font-headline-lg">
            รายชื่อลูกค้า
          </h1>
          <p className="mt-1 text-body-md text-on-surface-variant">
            ดูข้อมูลลูกค้า ประวัติการจอง และภาพรวมการใช้งาน
          </p>
        </div>

        <div className="w-full max-w-md">
          <Input
            type="search"
            value={searchQuery}
            onChange={(event) =>
              setSearchQuery(event.target.value)
            }
            placeholder="ค้นหาชื่อ เบอร์โทร อีเมล หรือสนาม..."
            className="w-full"
          />
        </div>
      </section>

      <section className="grid grid-cols-2 gap-md xl:grid-cols-4">
        <SummaryCard
          label="ลูกค้าทั้งหมด"
          value={summary.total}
        />
        <SummaryCard
          label="ใช้งานอยู่"
          value={summary.active}
        />
        <SummaryCard
          label="Walk-in / โทรเข้า"
          value={summary.offline}
        />
        <SummaryCard
          label="ยอดใช้จ่ายรวม"
          value={`฿${formatPrice(summary.revenue)}`}
        />
      </section>

      {filteredCustomers.length === 0 ? (
        <EmptyState
          className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-outline-variant/10 bg-surface-container-low p-8 text-center"
          icon={
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <span className="material-symbols-outlined text-[32px]">
                group_off
              </span>
            </div>
          }
          title={
            <h2 className="mt-4 text-headline-md font-bold text-on-surface">
              ไม่พบลูกค้าที่ตรงกับการค้นหา
            </h2>
          }
          description={
            <p className="mt-2 max-w-md text-body-md text-on-surface-variant">
              ลองค้นหาด้วยชื่อ เบอร์โทร หรือชื่อสนามที่ลูกค้าเคยจอง
            </p>
          }
        />
      ) : (
        <>
          <section className="hidden overflow-hidden rounded-2xl border border-outline-variant/10 bg-surface-container-low xl:block">
            <div className="grid grid-cols-[2.2fr_1.1fr_1fr_1fr_1fr_1fr] gap-4 border-b border-outline-variant/10 px-5 py-4 text-label-sm font-bold uppercase tracking-wide text-on-surface-variant">
              <span>ลูกค้า</span>
              <span>ติดต่อ</span>
              <span>แหล่งที่มา</span>
              <span>การจอง</span>
              <span>ยอดใช้จ่าย</span>
              <span>ล่าสุด</span>
            </div>

            {filteredCustomers.map((customer) => (
              <article
                key={customer.id}
                className="grid grid-cols-[2.2fr_1.1fr_1fr_1fr_1fr_1fr] gap-4 border-b border-outline-variant/10 px-5 py-4 last:border-b-0"
              >
                <div className="flex items-center gap-3">
                  <CustomerAvatar customer={customer} />
                  <div className="min-w-0">
                    <p className="truncate text-body-md font-bold text-on-surface">
                      {customer.displayName}
                    </p>
                    <p className="truncate text-label-sm text-on-surface-variant">
                      สนามประจำ: {customer.favoriteCourt || "-"}
                    </p>
                  </div>
                </div>

                <div className="min-w-0">
                  <p className="truncate text-body-sm text-on-surface">
                    {customer.phone || "-"}
                  </p>
                  <p className="truncate text-label-sm text-on-surface-variant">
                    {customer.email || "ไม่มีอีเมล"}
                  </p>
                </div>

                <div className="flex items-center">
                  <SourceBadge source={customer.source} />
                </div>

                <div>
                  <p className="text-body-sm font-bold text-on-surface">
                    {customer.totalBookings} ครั้ง
                  </p>
                  <p className="text-label-sm text-on-surface-variant">
                    เปิดอยู่ {customer.activeBookings}
                  </p>
                </div>

                <div>
                  <p className="text-body-sm font-bold text-primary">
                    ฿{formatPrice(customer.totalSpent)}
                  </p>
                  <p className="text-label-sm text-on-surface-variant">
                    เสร็จสิ้น {customer.completedBookings}
                  </p>
                </div>

                <div>
                  <p className="text-body-sm text-on-surface">
                    {formatThaiDate(customer.lastBookingAt)}
                  </p>
                  <StatusPill status={customer.status} />
                </div>
              </article>
            ))}
          </section>

          <section className="grid grid-cols-1 gap-md xl:hidden">
            {filteredCustomers.map((customer) => (
              <article
                key={customer.id}
                className="rounded-2xl border border-outline-variant/10 bg-surface-container-low p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <CustomerAvatar customer={customer} />
                    <div className="min-w-0">
                      <p className="truncate text-body-md font-bold text-on-surface">
                        {customer.displayName}
                      </p>
                      <p className="truncate text-label-sm text-on-surface-variant">
                        {customer.phone || "ไม่มีเบอร์โทร"}
                      </p>
                    </div>
                  </div>

                  <SourceBadge source={customer.source} />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <MobileInfo
                    label="การจอง"
                    value={`${customer.totalBookings} ครั้ง`}
                    secondary={`เปิดอยู่ ${customer.activeBookings}`}
                  />
                  <MobileInfo
                    label="ยอดใช้จ่าย"
                    value={`฿${formatPrice(customer.totalSpent)}`}
                    secondary={`ล่าสุด ${formatThaiDate(customer.lastBookingAt)}`}
                  />
                  <MobileInfo
                    label="สนามประจำ"
                    value={customer.favoriteCourt || "-"}
                  />
                  <MobileInfo
                    label="สถานะ"
                    value={customer.status === "active" ? "ใช้งานอยู่" : "ปิดใช้งาน"}
                    secondary={customer.email || "ไม่มีอีเมล"}
                  />
                </div>
              </article>
            ))}
          </section>
        </>
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl border border-outline-variant/10 bg-surface-container-low p-4">
      <p className="text-label-sm text-on-surface-variant">
        {label}
      </p>
      <p className="mt-2 text-headline-md font-bold text-on-surface">
        {value}
      </p>
    </div>
  );
}

function CustomerAvatar({
  customer,
}: {
  customer: CustomerSummary;
}) {
  return customer.pictureUrl ? (
    <Image
      src={customer.pictureUrl}
      alt={customer.displayName}
      width={44}
      height={44}
      className="h-11 w-11 shrink-0 rounded-full border border-primary/20 object-cover"
    />
  ) : (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-sm font-bold text-primary">
      {getInitials(customer.displayName)}
    </div>
  );
}

function SourceBadge({
  source,
}: {
  source: CustomerSummary["source"];
}) {
  const isOffline = source === "offline";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-label-sm font-bold ${
        isOffline
          ? "bg-amber-500/10 text-amber-300"
          : "bg-primary/10 text-primary"
      }`}
    >
      <span className="material-symbols-outlined text-[14px]">
        {isOffline ? "call" : "chat"}
      </span>
      {isOffline ? "Walk-in" : "LINE"}
    </span>
  );
}

function StatusPill({
  status,
}: {
  status: CustomerSummary["status"];
}) {
  return (
    <span
      className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-label-sm font-bold ${
        status === "active"
          ? "bg-primary/10 text-primary"
          : "bg-error/10 text-error"
      }`}
    >
      {status === "active" ? "ใช้งานอยู่" : "ปิดใช้งาน"}
    </span>
  );
}

function MobileInfo({
  label,
  value,
  secondary,
}: {
  label: string;
  value: string;
  secondary?: string;
}) {
  return (
    <div className="rounded-xl border border-outline-variant/10 bg-surface-container p-3">
      <p className="text-label-sm text-on-surface-variant">
        {label}
      </p>
      <p className="mt-1 text-body-sm font-bold text-on-surface">
        {value}
      </p>
      {secondary && (
        <p className="mt-1 text-label-sm text-on-surface-variant">
          {secondary}
        </p>
      )}
    </div>
  );
}
