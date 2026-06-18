const LEGEND_ITEMS = [
    {
        label: "ว่าง",
        background: "rgba(16,185,129,0.03)",
        border: "rgba(16,185,129,0.3)",
    },
    {
        label: "รอดำเนินการ (รอจ่ายเงิน)",
        background: "rgba(245,158,11,0.08)",
        border: "rgba(245,158,11,0.3)",
    },
    {
        label: "รอตรวจสอบ (โอนแล้ว)",
        background: "rgba(59,130,246,0.08)",
        border: "rgba(59,130,246,0.3)",
    },
    {
        label: "ยืนยันแล้ว / จองแล้ว",
        background: "rgba(239,68,68,0.08)",
        border: "rgba(239,68,68,0.3)",
    },
];

export default function StatusLegend() {
    return (
        <div className="mt-8 flex flex-wrap gap-4 border-t border-white/[0.03] pt-4">
            {LEGEND_ITEMS.map((item : { label: string; background: string; border: string }) => (
                <div
                    key={item.label}
                    className="flex items-center gap-2 text-[0.7rem] text-white/40"
                >
                    <div
                        className="h-3 w-3 rounded"
                        style={{
                            background: item.background,
                            border: `1px solid ${item.border}`,
                        }}
                    />

                    {item.label}
                </div>
            ))}
        </div>
    );
}