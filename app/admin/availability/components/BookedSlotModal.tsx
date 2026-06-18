"use client";

import { useState } from "react";

import type { SelectedBookedSlot } from "../types/availability";

import {
    getStatusColor,
    getStatusLabel,
} from "../utils/availability";
import { AdminRouteLoadingOverlay } from "@/src/components/common/AdminRouteLoadingOverlay";

interface BookedSlotModalProps {
    slot: SelectedBookedSlot;
    onClose: () => void;
}

export default function BookedSlotModal({
    slot,
    onClose,
}: BookedSlotModalProps) {
    const [isRouteLoading, setIsRouteLoading] =
        useState(false);
    const statusColor = getStatusColor(
        slot.bookingStatus,
    );
    const targetHref = slot.bookingId
        ? `/admin/bookings/${slot.bookingId}`
        : "/admin/all-bookings";

    return (
        <>
            <AdminRouteLoadingOverlay
                open={isRouteLoading}
            />

            <div
                className="admin-modal-backdrop fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
                onClick={onClose}
            >
                <div
                    className="admin-modal-content w-full max-w-[400px] rounded-3xl border border-white/10 bg-slate-900 p-7"
                    onClick={(event) => event.stopPropagation()}
                >
                    <div className="mb-5 flex items-start justify-between">
                        <h3 className="text-lg font-extrabold text-white">
                            รายละเอียดการจอง
                        </h3>

                        <button
                            type="button"
                            onClick={onClose}
                            className="text-xl text-white/40 hover:text-white"
                        >
                            ×
                        </button>
                    </div>

                    <div className="flex flex-col text-sm">
                        <DetailRow
                            label="ชื่อผู้จอง"
                            value={slot.bookedBy || "ไม่ระบุ"}
                        />

                        <DetailRow
                            label="เบอร์โทรศัพท์"
                            value={slot.customerPhone || "ไม่ระบุ"}
                        />

                        <DetailRow
                            label="สนาม"
                            value={slot.courtName}
                        />

                        <DetailRow
                            label="เวลา"
                            value={`${slot.startTime} - ${slot.endTime}`}
                            valueColor="#86efac"
                        />

                        <DetailRow
                            label="สถานะ"
                            value={getStatusLabel(slot.bookingStatus)}
                            valueColor={statusColor.text}
                        />

                        {slot.notes && (
                            <div className="pt-3">
                                <span className="text-white/40">
                                    หมายเหตุ
                                </span>

                                <div className="mt-2 rounded-lg bg-white/[0.03] p-3 leading-6 text-white/80">
                                    {slot.notes}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-6">
                        <button
                            type="button"
                            onClick={() => {
                                setIsRouteLoading(true);
                                window.location.assign(
                                    targetHref,
                                );
                            }}
                            className="block w-full rounded-xl bg-white/[0.05] p-3 text-center text-sm font-semibold text-white transition-colors hover:bg-white/10"
                        >
                            {slot.bookingId
                                ? "ดูรายละเอียดการจอง"
                                : "ดูการจองทั้งหมด"}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

function DetailRow({
    label,
    value,
    valueColor,
}: {
    label: string;
    value: string;
    valueColor?: string;
}) {
    return (
        <div className="flex justify-between gap-4 border-b border-white/[0.05] py-3">
            <span className="text-white/40">
                {label}
            </span>

            <span
                className="text-right font-bold text-white"
                style={{
                    color: valueColor,
                }}
            >
                {value}
            </span>
        </div>
    );
}
