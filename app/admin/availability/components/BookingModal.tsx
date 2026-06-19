import type { FormEvent } from "react";

import {
  Button,
  FormField,
  Input,
  Modal,
  Select,
} from "@/src/components/ui";
import type {
  CourtAvailability,
  CustomerMode,
  CustomerSearchItem,
  ManualBookingStatus,
} from "../types/availability";
import { formatThaiLongDate } from "../utils/availability";

interface BookingModalProps {
  court: CourtAvailability;
  selectedDate: Date;
  selectedSlots: string[];
  customerMode: CustomerMode;
  customerSearchQuery: string;
  customerResults: CustomerSearchItem[];
  searchingCustomers: boolean;
  selectedCustomer: CustomerSearchItem | null;
  customerName: string;
  customerPhone: string;
  bookingStatus: ManualBookingStatus;
  submitError: string;
  isSubmitting: boolean;
  onCustomerModeChange: (
    mode: CustomerMode,
  ) => void;
  onCustomerSearchChange: (value: string) => void;
  onSelectCustomer: (
    customer: CustomerSearchItem,
  ) => void;
  onCustomerNameChange: (value: string) => void;
  onCustomerPhoneChange: (value: string) => void;
  onBookingStatusChange: (
    value: ManualBookingStatus,
  ) => void;
  onClose: () => void;
  onSubmit: (
    event: FormEvent<HTMLFormElement>,
  ) => void;
}

const bookingStatusOptions: Array<{
  value: ManualBookingStatus;
  label: string;
}> = [
  { value: "pending", label: "รอแอดมินยืนยัน" },
  { value: "confirmed", label: "ยืนยันแล้ว" },
  { value: "completed", label: "เสร็จสิ้น" },
  { value: "no_show", label: "ลูกค้าไม่มา" },
];

export default function BookingModal({
  court,
  selectedDate,
  selectedSlots,
  customerMode,
  customerSearchQuery,
  customerResults,
  searchingCustomers,
  selectedCustomer,
  customerName,
  customerPhone,
  bookingStatus,
  submitError,
  isSubmitting,
  onCustomerModeChange,
  onCustomerSearchChange,
  onSelectCustomer,
  onCustomerNameChange,
  onCustomerPhoneChange,
  onBookingStatusChange,
  onClose,
  onSubmit,
}: BookingModalProps) {
  return (
    <Modal contentClassName="my-4 max-w-[640px]">
      <div className="max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-[28px] border border-white/10 bg-[#0d1120] sm:max-h-[calc(100dvh-3rem)]">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-white/10 bg-[#0d1120]/95 px-5 py-4 backdrop-blur-sm sm:px-7 sm:py-5">
          <div>
            <h3 className="text-lg font-extrabold text-white">
              สร้างรายการจองโดยผู้ดูแล
            </h3>

            <p className="mt-1 text-xs text-white/45">
              เลือกลูกค้า กำหนดสถานะ และยืนยันการจองด้วยข้อมูลจริง
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="ปิด"
            className="text-xl text-white/45 transition-colors hover:text-white"
          >
            ×
          </button>
        </div>

        <div className="p-5 sm:p-7">
      <div className="mb-5 rounded-2xl border border-white/[0.04] bg-white/[0.01] px-4 py-3 text-xs">
        <SummaryRow
          label="สนาม:"
          value={court.name}
        />
        <SummaryRow
          label="วันที่:"
          value={formatThaiLongDate(selectedDate)}
        />
        <SummaryRow
          label="ช่วงเวลา:"
          value={[...selectedSlots]
            .sort()
            .join(", ")}
          highlight
          noMargin
        />
      </div>

      <form
        onSubmit={onSubmit}
        className="flex flex-col gap-4"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() =>
              onCustomerModeChange("existing")
            }
            className={`rounded-2xl border px-4 py-3 text-left transition-all ${
              customerMode === "existing"
                ? "border-primary/40 bg-primary/10 text-white"
                : "border-white/10 bg-white/[0.02] text-white/65 hover:bg-white/[0.04]"
            }`}
          >
            <div className="text-sm font-bold">
              ลูกค้าเดิม
            </div>
            <div className="mt-1 text-xs text-white/45">
              ค้นหาจากชื่อหรือเบอร์โทร แล้วดึงข้อมูลลูกค้าเดิมอัตโนมัติ
            </div>
          </button>

          <button
            type="button"
            onClick={() =>
              onCustomerModeChange("new")
            }
            className={`rounded-2xl border px-4 py-3 text-left transition-all ${
              customerMode === "new"
                ? "border-primary/40 bg-primary/10 text-white"
                : "border-white/10 bg-white/[0.02] text-white/65 hover:bg-white/[0.04]"
            }`}
          >
            <div className="text-sm font-bold">
              ลูกค้าใหม่
            </div>
            <div className="mt-1 text-xs text-white/45">
              กรอกชื่อและเบอร์โทร ระบบจะสร้างลูกค้าใหม่ให้อัตโนมัติหากยังไม่มี
            </div>
          </button>
        </div>

        {customerMode === "existing" ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <FormField
              id="customerSearch"
              label="ค้นหาลูกค้า"
            >
              <Input
                id="customerSearch"
                type="search"
                placeholder="ค้นหาชื่อหรือเบอร์โทร..."
                value={customerSearchQuery}
                onChange={(event) =>
                  onCustomerSearchChange(
                    event.target.value,
                  )
                }
              />
            </FormField>

            <div className="mt-3 space-y-2">
              {searchingCustomers && (
                <div className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-xs text-white/55">
                  กำลังค้นหาลูกค้า...
                </div>
              )}

              {!searchingCustomers &&
                customerSearchQuery.trim().length >=
                  2 &&
                customerResults.length === 0 && (
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-xs text-white/55">
                    ไม่พบลูกค้าที่ตรงกับคำค้นหา
                  </div>
                )}

              {customerResults.map((customer: CustomerSearchItem) => {
                const isSelected =
                  selectedCustomer?.id ===
                  customer.id;

                return (
                  <button
                    key={customer.id}
                    type="button"
                    onClick={() =>
                      onSelectCustomer(customer)
                    }
                    className={`flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-3 text-left transition-all ${
                      isSelected
                        ? "border-primary/35 bg-primary/10"
                        : "border-white/10 bg-white/[0.02] hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-white">
                        {customer.displayName}
                      </div>
                      <div className="mt-1 truncate text-xs text-white/50">
                        {customer.phone || "ไม่มีเบอร์โทร"}
                      </div>
                    </div>

                    <div className="shrink-0 text-xs font-semibold text-primary">
                      {customer.lineUserId.startsWith(
                        "offline_",
                      )
                        ? "โทรจอง"
                        : "LINE"}
                    </div>
                  </button>
                );
              })}
            </div>

            {selectedCustomer && (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <InfoCard
                  label="ชื่อลูกค้า"
                  value={
                    selectedCustomer.displayName
                  }
                />
                <InfoCard
                  label="เบอร์โทรศัพท์"
                  value={
                    selectedCustomer.phone ||
                    "ไม่ระบุ"
                  }
                />
              </div>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              id="customerName"
              label="ชื่อลูกค้า *"
            >
              <Input
                id="customerName"
                type="text"
                required
                placeholder="เช่น สมชาย ใจดี"
                value={customerName}
                onChange={(event) =>
                  onCustomerNameChange(
                    event.target.value,
                  )
                }
              />
            </FormField>

            <FormField
              id="customerPhone"
              label="เบอร์โทรศัพท์ *"
            >
              <Input
                id="customerPhone"
                type="tel"
                required
                placeholder="เช่น 0812345678"
                value={customerPhone}
                onChange={(event) =>
                  onCustomerPhoneChange(
                    event.target.value,
                  )
                }
              />
            </FormField>
          </div>
        )}

        <div className="grid gap-4">
          <FormField
            id="bookingStatus"
            label="สถานะการจอง"
          >
            <Select
              id="bookingStatus"
              value={bookingStatus}
              onChange={(event) =>
                onBookingStatusChange(
                  event.target
                    .value as ManualBookingStatus,
                )
              }
            >
              {bookingStatusOptions.map((option : { value: string; label: string }) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </Select>
          </FormField>
        </div>

        {submitError && (
          <div className="rounded-lg border border-red-500/15 bg-red-500/[0.08] p-2.5 text-xs text-red-500">
            {submitError}
          </div>
        )}

        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            variant="secondary"
            className="flex-1 py-3"
          >
            ยกเลิก
          </Button>

          <Button
            type="submit"
            loading={isSubmitting}
            className="flex-1 py-3"
          >
            {isSubmitting
              ? "กำลังบันทึก..."
              : "สร้างรายการจอง"}
          </Button>
        </div>
      </form>
      </div>
      </div>
    </Modal>
  );
}

function SummaryRow({
  label,
  value,
  highlight = false,
  noMargin = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  noMargin?: boolean;
}) {
  return (
    <div
      className={`flex justify-between gap-4 ${
        noMargin ? "" : "mb-1.5"
      }`}
    >
      <span className="text-white/40">
        {label}
      </span>

        <span
          className={`text-right font-bold ${
          highlight
            ? "text-green-300"
            : "text-white"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function InfoCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-3">
      <div className="text-[11px] uppercase tracking-[0.12em] text-white/40">
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold text-white">
        {value}
      </div>
    </div>
  );
}
