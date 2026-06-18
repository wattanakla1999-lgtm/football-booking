import type { FormEvent } from "react";

import {
    Button,
    FormField,
    Input,
    Modal,
} from "@/src/components/ui";
import type { CourtAvailability } from "../types/availability";

import { formatThaiLongDate } from "../utils/availability";

interface BookingModalProps {
    court: CourtAvailability;
    selectedDate: Date;
    selectedSlots: string[];

    customerName: string;
    customerPhone: string;
    submitError: string;
    isSubmitting: boolean;

    onCustomerNameChange: (value: string) => void;
    onCustomerPhoneChange: (value: string) => void;
    onClose: () => void;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export default function BookingModal({
    court,
    selectedDate,
    selectedSlots,
    customerName,
    customerPhone,
    submitError,
    isSubmitting,
    onCustomerNameChange,
    onCustomerPhoneChange,
    onClose,
    onSubmit,
}: BookingModalProps) {
    return (
        <Modal contentClassName="max-w-[440px] p-7">
                <h3 className="mb-1.5 text-lg font-extrabold text-white">
                    📝 จองสนาม (เคสโทรเข้า / Walk-in)
                </h3>

                <p className="mb-5 text-xs text-white/45">
                    บันทึกการจองโดยผู้ดูแลระบบ
                    คิวจะได้รับการยืนยันทันที
                </p>

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
                    <FormField id="customerName" label="ชื่อลูกค้า *">
                        <Input
                            id="customerName"
                            type="text"
                            required
                            placeholder="เช่น สมชาย โทรจอง"
                            value={customerName}
                            onChange={(event) =>
                                onCustomerNameChange(
                                    event.target.value,
                                )
                            }
                        />
                    </FormField>

                    <FormField id="customerPhone" label="เบอร์โทรศัพท์ (ไม่บังคับ)">
                        <Input
                            id="customerPhone"
                            type="tel"
                            placeholder="เช่น 0812345678"
                            value={customerPhone}
                            onChange={(event) =>
                                onCustomerPhoneChange(
                                    event.target.value,
                                )
                            }
                        />
                    </FormField>

                    {submitError && (
                        <div className="rounded-lg border border-red-500/15 bg-red-500/[0.08] p-2.5 text-xs text-red-500">
                            ⚠️ {submitError}
                        </div>
                    )}

                    <div className="mt-2 flex gap-2">
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
                            className="flex-1 bg-gradient-to-br from-indigo-500 to-violet-500 py-3 shadow-lg shadow-indigo-500/20"
                        >
                            {isSubmitting
                                ? "กำลังบันทึก..."
                                : "ยืนยันการจอง"}
                        </Button>
                    </div>
                </form>
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
            className={`flex justify-between gap-4 ${noMargin ? "" : "mb-1.5"
                }`}
        >
            <span className="text-white/40">
                {label}
            </span>

            <span
                className={`text-right font-bold ${highlight
                        ? "text-indigo-300"
                        : "text-white"
                    }`}
            >
                {value}
            </span>
        </div>
    );
}
