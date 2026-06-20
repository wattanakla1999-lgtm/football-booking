"use client";

import Image from "next/image";
import {
  usePathname,
  useRouter,
} from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";

import { PaginationControls } from "@/src/components/common/PaginationControls";
import { Modal } from "@/src/components/ui";
import type { PaginationMeta } from "@/src/types/pagination";

import type { CustomerSummary } from "./types/customer";

type CustomersListViewProps = {
  customers: CustomerSummary[];
  pagination: PaginationMeta;
  initialSearchQuery: string;
  summary: {
    total: number;
    active: number;
    offline: number;
    revenue: number;
  };
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
    .map((part : string) => part.charAt(0).toUpperCase())
    .join("") || "?";
}

export default function CustomersListView({
  customers,
  pagination,
  initialSearchQuery,
  summary,
}: CustomersListViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] =
    useTransition();
  const searchInputRef =
    useRef<HTMLInputElement | null>(null);
  const [searchQuery, setSearchQuery] =
    useState(initialSearchQuery);
  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerSummary | null>(null);

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
    pathname,
    router,
    searchQuery,
  ]);

  useEffect(() => {
    if (isPending || document.activeElement !== document.body) {
      return;
    }

    searchInputRef.current?.focus({
      preventScroll: true,
    });
  }, [initialSearchQuery, isPending]);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams();

    if (searchQuery.trim()) {
      params.set("q", searchQuery.trim());
    }

    if (page > 1) {
      params.set("page", String(page));
    }

    startTransition(() => {
      router.push(
        params.size
          ? `${pathname}?${params.toString()}`
          : pathname,
      );
    });
  };

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(360px,520px)] xl:items-end">
        <div>
          <h1 className="text-headline-lg font-headline-lg">
            รายชื่อลูกค้า
          </h1>
          <p className="mt-1 text-body-md text-on-surface-variant">
            ดูข้อมูลลูกค้า ประวัติการจอง และภาพรวมการใช้งาน
          </p>
        </div>

        <div className="w-full min-w-0">
          <div className="flex min-h-14 w-full items-center gap-3 rounded-2xl border border-outline-variant/20 bg-surface-container-low px-4 shadow-[0_16px_40px_rgba(0,0,0,0.18)] transition-all focus-within:border-primary/60 focus-within:bg-surface-container focus-within:ring-4 focus-within:ring-primary/10">
            <span className="material-symbols-outlined shrink-0 text-[24px] text-primary">
              search
            </span>

            <input
              ref={searchInputRef}
              type="text"
              inputMode="search"
              autoComplete="off"
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(event.target.value)
              }
              placeholder="ค้นหาชื่อ เบอร์โทร อีเมล หรือสนาม"
              className="h-14 min-w-0 flex-1 bg-transparent text-body-md text-on-surface outline-none placeholder:text-on-surface-variant/60"
            />

            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  searchInputRef.current?.focus({
                    preventScroll: true,
                  });
                }}
                aria-label="ล้างการค้นหา"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant transition-colors hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[18px]">
                  close
                </span>
              </button>
            )}
          </div>
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
          label="โทรจอง / โทรเข้า"
          value={summary.offline}
        />
        <SummaryCard
          label="ยอดใช้จ่ายรวม"
          value={`฿${formatPrice(summary.revenue)}`}
        />
      </section>

      {isPending ? (
        <div className="rounded-2xl border border-outline-variant/10 bg-surface-container-low p-10 text-center text-on-surface-variant">
          กำลังโหลดข้อมูล...
        </div>
      ) : customers.length === 0 ? (
        <CustomerEmptySearch
          onClear={() => {
            setSearchQuery("");
            searchInputRef.current?.focus({
              preventScroll: true,
            });
          }}
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

            {customers.map((customer: CustomerSummary) => (
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

          <section className="grid grid-cols-2 gap-3 xl:hidden">
            {customers.map((customer : CustomerSummary) => (
              <button
                key={customer.id}
                type="button"
                onClick={() =>
                  setSelectedCustomer(customer)
                }
                className="min-w-0 rounded-2xl border border-outline-variant/10 bg-surface-container-low p-3 text-left transition-all active:scale-[0.98]"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <CustomerAvatar
                    customer={customer}
                    size="sm"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-body-sm font-bold text-on-surface">
                      {customer.displayName}
                    </p>
                    <p className="truncate text-label-sm text-on-surface-variant">
                      {customer.phone || "ไม่มีเบอร์โทร"}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between gap-2">
                  <SourceBadge source={customer.source} compact />
                  <span className="text-label-sm font-bold text-primary">
                    ฿{formatPrice(customer.totalSpent)}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 border-t border-outline-variant/10 pt-3">
                  <CompactStat
                    label="จอง"
                    value={`${customer.totalBookings}`}
                  />
                  <CompactStat
                    label="เปิดอยู่"
                    value={`${customer.activeBookings}`}
                  />
                </div>

                <div className="mt-3 flex items-center justify-between gap-2 text-label-sm text-on-surface-variant">
                  <span className="truncate">
                    {customer.favoriteCourt || "ไม่มีสนามประจำ"}
                  </span>
                  <span className="material-symbols-outlined text-[18px] text-primary">
                    visibility
                  </span>
                </div>
              </button>
            ))}
          </section>

          <PaginationControls
            page={pagination.page}
            total={pagination.total}
            limit={pagination.limit}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />

          {selectedCustomer && (
            <CustomerDetailModal
              customer={selectedCustomer}
              onClose={() =>
                setSelectedCustomer(null)
              }
            />
          )}
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

function CustomerEmptySearch({
  onClear,
}: {
  onClear: () => void;
}) {
  return (
    <section className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-outline-variant/10 bg-surface-container-low px-6 py-10 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <span className="material-symbols-outlined text-[32px]">
          person_search
        </span>
      </div>

      <h2 className="mt-5 max-w-[24rem] text-title-lg font-bold leading-8 text-on-surface">
        ไม่พบลูกค้าที่ตรงกับการค้นหา
      </h2>

      <p className="mt-2 max-w-[22rem] text-body-md leading-6 text-on-surface-variant">
        ลองค้นหาด้วยชื่อลูกค้า เบอร์โทร อีเมล หรือชื่อสนามที่ลูกค้าเคยจอง
      </p>

      <button
        type="button"
        onClick={onClear}
        className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-label-md font-bold text-on-primary transition-all hover:brightness-110 active:scale-95"
      >
        <span className="material-symbols-outlined text-[18px]">
          backspace
        </span>
        ล้างคำค้นหา
      </button>
    </section>
  );
}

function CustomerAvatar({
  customer,
  size = "md",
}: {
  customer: CustomerSummary;
  size?: "sm" | "md";
}) {
  const sizeClassName =
    size === "sm"
      ? "h-10 w-10 text-xs"
      : "h-11 w-11 text-sm";

  return customer.pictureUrl ? (
    <Image
      src={customer.pictureUrl}
      alt={customer.displayName}
      width={44}
      height={44}
      className={`${sizeClassName} shrink-0 rounded-full border border-primary/20 object-cover`}
    />
  ) : (
    <div className={`flex ${sizeClassName} shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10 font-bold text-primary`}>
      {getInitials(customer.displayName)}
    </div>
  );
}

function SourceBadge({
  source,
  compact = false,
}: {
  source: CustomerSummary["source"];
  compact?: boolean;
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
      {compact
        ? isOffline
          ? "โทร"
          : "LINE"
        : isOffline
          ? "โทรจอง"
          : "LINE"}
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

function CompactStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] text-on-surface-variant">
        {label}
      </p>
      <p className="mt-0.5 truncate text-body-sm font-bold text-on-surface">
        {value}
      </p>
    </div>
  );
}

function CustomerDetailModal({
  customer,
  onClose,
}: {
  customer: CustomerSummary;
  onClose: () => void;
}) {
  return (
    <Modal contentClassName="max-w-[520px] p-5 sm:p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <CustomerAvatar customer={customer} />
          <div className="min-w-0">
            <h2 className="truncate text-title-md font-bold text-on-surface">
              {customer.displayName}
            </h2>
            <p className="mt-1 text-body-sm text-on-surface-variant">
              {customer.phone || "ไม่มีเบอร์โทร"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="ปิด"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant transition-colors hover:text-on-surface"
        >
          <span className="material-symbols-outlined text-[20px]">
            close
          </span>
        </button>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        <SourceBadge source={customer.source} />
        <StatusPill status={customer.status} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <DetailBox
          label="การจองทั้งหมด"
          value={`${customer.totalBookings} ครั้ง`}
          secondary={`เปิดอยู่ ${customer.activeBookings}`}
        />
        <DetailBox
          label="ยอดใช้จ่าย"
          value={`฿${formatPrice(customer.totalSpent)}`}
          secondary={`ล่าสุด ${formatThaiDate(customer.lastBookingAt)}`}
        />
        <DetailBox
          label="เสร็จสิ้น"
          value={`${customer.completedBookings} ครั้ง`}
          secondary={`ยกเลิก ${customer.cancelledBookings}`}
        />
        <DetailBox
          label="สนามประจำ"
          value={customer.favoriteCourt || "-"}
          secondary="จากประวัติการจอง"
        />
      </div>

      <div className="mt-4 rounded-2xl border border-outline-variant/10 bg-surface-container-low p-4">
        <DetailRow label="อีเมล" value={customer.email || "ไม่มีอีเมล"} />
        <DetailRow label="วันที่สมัคร" value={formatThaiDate(customer.createdAt)} />
        <DetailRow label="รหัสลูกค้า" value={customer.id} />
      </div>
    </Modal>
  );
}

function DetailBox({
  label,
  value,
  secondary,
}: {
  label: string;
  value: string;
  secondary: string;
}) {
  return (
    <div className="rounded-2xl border border-outline-variant/10 bg-surface-container p-4">
      <p className="text-label-sm text-on-surface-variant">
        {label}
      </p>
      <p className="mt-2 break-words text-title-md font-bold text-on-surface">
        {value}
      </p>
      <p className="mt-1 text-label-sm text-on-surface-variant">
        {secondary}
      </p>
    </div>
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
    <div className="flex items-start justify-between gap-4 border-b border-outline-variant/10 py-3 first:pt-0 last:border-b-0 last:pb-0">
      <span className="shrink-0 text-label-sm text-on-surface-variant">
        {label}
      </span>
      <span className="min-w-0 break-all text-right text-label-sm font-semibold text-on-surface">
        {value}
      </span>
    </div>
  );
}
