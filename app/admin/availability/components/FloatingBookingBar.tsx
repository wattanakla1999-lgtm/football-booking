interface FloatingBookingBarProps {
    courtName: string;
    selectedCount: number;
    onCancel: () => void;
    onConfirm: () => void;
}

export default function FloatingBookingBar({
    courtName,
    selectedCount,
    onCancel,
    onConfirm,
}: FloatingBookingBarProps) {
    return (
        <div className="admin-floating-bar">
            <div>
                <p className="text-xs font-medium text-white/40">
                    {courtName}
                </p>

                <p className="text-sm font-extrabold text-white">
                    เลือก {selectedCount} ช่วงเวลา
                </p>
            </div>

            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-sm font-semibold text-white/50 transition-colors hover:text-white"
                >
                    ยกเลิก
                </button>

                <button
                    type="button"
                    onClick={onConfirm}
                    className="rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 px-5 py-2 text-sm font-bold text-white shadow-lg shadow-indigo-500/25"
                >
                    จองสนาม (Admin)
                </button>
            </div>
        </div>
    );
}