import Link from "next/link";
import Image from "next/image";
import type {
    Booking,
    BookingItem,
    BookingStatus,
} from "../types/booking";

import { capitalize, formatDate, formatPrice } from "../../../../utils/bookingFormatters";
import { statusOptions } from "../utils/bookingFilters";
import StatusBadge from "./StatusBadge";
import ActionMenu from "./ActionMenu";
import CompactInfoBox from "./CompactInfoBox";
import QuickActionButton from "./QuickActionButton";

interface BookingCardProps {
    booking: Booking;
    isUpdating: boolean;
    isMenuOpen: boolean;
    menuRef?: React.RefObject<HTMLDivElement | null>;
    onToggleMenu: () => void;
    onCloseMenu: () => void;
    onUpdateStatus: (
        bookingId: string,
        status: BookingStatus
    ) => Promise<void>;
}

export default function BookingCard({
    booking,
    isUpdating,
    isMenuOpen,
    menuRef,
    onToggleMenu,
    onCloseMenu,
    onUpdateStatus,
}: BookingCardProps) {
    const sortedItems = [...(booking.items || [])].sort((a, b) => a.startTime.localeCompare(b.startTime));
    const firstItem = sortedItems[0];
    const lastItem = sortedItems[sortedItems.length - 1];

    const bookingDate = firstItem?.date
        ? formatDate(firstItem.date)
        : "ไม่มีข้อมูลวันที่";

    const bookingTime =
        firstItem?.startTime && lastItem?.endTime
            ? `${firstItem.startTime} - ${lastItem.endTime}`
            : "ไม่มีข้อมูลเวลา";

    const fieldName =
        firstItem?.court?.name || "ไม่มีข้อมูลสนาม";

    const additionalItems = Math.max(
        booking.items.length - 1,
        0
    );

    const customerInitial =
        booking.user?.displayName
            ?.trim()
            .charAt(0)
            .toUpperCase() || "?";

    return (
        <article
            className={`
        glass-card relative min-w-0
        overflow-visible rounded-xl
        transition-all duration-200
        hover:-translate-y-0.5
        hover:border-primary/20
        ${isUpdating
                    ? "pointer-events-none opacity-60"
                    : ""
                }
      `}
        >
            {/* Card Header */}
            <div className="flex min-w-0 items-start justify-between gap-2 border-b border-outline-variant/10 p-3.5">
                <div className="flex min-w-0 items-center gap-2.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <span className="material-symbols-outlined text-[19px]">
                            confirmation_number
                        </span>
                    </div>

                    <div className="min-w-0">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant">
                            ID การจอง
                        </p>

                        <p className="truncate font-mono text-sm font-bold text-on-surface">
                            #{booking.id.slice(-8).toUpperCase()}
                        </p>
                    </div>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                    <StatusBadge status={booking.status} />

                    <div ref={menuRef} className="relative">
                        <button
                            type="button"
                            onClick={onToggleMenu}
                            disabled={isUpdating}
                            aria-label="Booking actions"
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface disabled:opacity-50"
                        >
                            {isUpdating ? (
                                <span className="material-symbols-outlined animate-spin text-[19px]">
                                    progress_activity
                                </span>
                            ) : (
                                <span className="material-symbols-outlined text-[20px]">
                                    more_vert
                                </span>
                            )}
                        </button>

                        {isMenuOpen && (
                            <ActionMenu
                                booking={booking}
                                onClose={onCloseMenu}
                                onUpdateStatus={onUpdateStatus}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Card Content */}
            <div className="space-y-3 p-3.5">
                {/* Customer */}
                <div className="flex min-w-0 items-center gap-2.5">
                    {booking.user?.pictureUrl ? (
                        <Image
                            src={booking.user.pictureUrl}
                            alt={booking.user.displayName}
                            width={40}
                            height={40}
                            className="h-10 w-10 shrink-0 rounded-full border border-primary/20 object-cover"
                        />
                    ) : (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary-container/15 text-sm font-bold text-primary">
                            {customerInitial}
                        </div>
                    )}

                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-on-surface">
                            {booking.user?.displayName ||
                                "ไม่ระบุชื่อลูกค้า"}
                        </p>

                        <div className="mt-0.5 flex min-w-0 items-center gap-1 text-[11px] text-on-surface-variant">
                            <span className="material-symbols-outlined shrink-0 text-[14px]">
                                call
                            </span>

                            <span className="truncate">
                                {booking.user?.phone || "ไม่มีเบอร์โทร"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Booking Information */}
                <div className="grid min-w-0 grid-cols-2 gap-2">
                    <CompactInfoBox
                        icon="stadium"
                        label="สนาม"
                        value={fieldName}
                        secondary={
                            additionalItems > 0
                                ? `+${additionalItems} อื่นๆ`
                                : undefined
                        }
                    />

                    <CompactInfoBox
                        icon="calendar_today"
                        label="วันที่"
                        value={bookingDate}
                    />

                    <CompactInfoBox
                        icon="schedule"
                        label="เวลา"
                        value={bookingTime}
                    />

                    <CompactInfoBox
                        icon="payments"
                        label="จำนวนเงิน"
                        value={`฿${formatPrice(
                            booking.totalPrice
                        )}`}
                        highlight
                    />
                </div>

                {/* Additional Courts */}
                {booking.items.length > 1 && (
                    <div className="rounded-lg border border-outline-variant/10 bg-surface-container-low/60 p-2.5">
                        <p className="mb-1.5 text-[9px] font-bold uppercase tracking-wider text-on-surface-variant">
                            สนามทั้งหมด
                        </p>

                        <div className="flex flex-wrap gap-1.5">
                            {booking.items.map((item: BookingItem, index: number) => (
                                <span
                                    key={item.id || `${booking.id}-${index}`}
                                    className="inline-flex max-w-full items-center gap-1 rounded-md bg-surface-container-high px-2 py-1 text-[10px] text-on-surface"
                                >
                                    <span className="material-symbols-outlined text-[13px] text-primary">
                                        sports_soccer
                                    </span>

                                    <span className="max-w-24 truncate">
                                        {item.court?.name || "ไม่ทราบชื่อ"}
                                    </span>

                                    <span className="whitespace-nowrap text-on-surface-variant">
                                        {item.startTime} - {item.endTime}
                                    </span>
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="flex flex-col gap-2 border-t border-outline-variant/10 bg-surface-container-low/30 p-3.5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[10px] text-on-surface-variant">
                    สถานะ:{" "}
                    <span className="font-bold text-on-surface">
                        {statusOptions.find(opt => opt.value === booking.status)?.label || capitalize(booking.status)}
                    </span>
                </p>
                <div className="flex flex-wrap items-center gap-2">
                    <Link
                        href={`/admin/bookings/${booking.id}`}
                        className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-primary/20 bg-primary/10 px-3 text-[10px] font-bold text-primary transition-all hover:brightness-110 active:scale-95"
                    >
                        <span className="material-symbols-outlined text-[16px]">
                            visibility
                        </span>

                        ดูรายละเอียด
                    </Link>

                    <QuickActionButton
                        booking={booking}
                        onUpdateStatus={onUpdateStatus}
                    />
                </div>
            </div>
        </article>
    );
}
