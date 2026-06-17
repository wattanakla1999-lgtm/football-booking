

export default function SummaryCard({
    icon,
    label,
    value,
    active,
    onClick,
}: {
    icon: string;
    label: string;
    value: number;
    active?: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`
        glass-card min-w-0 rounded-2xl
        p-4 text-left transition-all
        hover:-translate-y-0.5
        active:scale-[0.98]
        ${active
                    ? "border-primary/40 bg-primary/10"
                    : ""
                }
      `}
        >
            <div className="flex items-center justify-between gap-2">
                <div
                    className={`
            flex h-10 w-10 shrink-0
            items-center justify-center
            rounded-xl
            ${active
                            ? "bg-primary text-on-primary"
                            : "bg-primary/10 text-primary"
                        }
          `}
                >
                    <span className="material-symbols-outlined text-[21px]">
                        {icon}
                    </span>
                </div>

                <span className="text-headline-md font-bold text-on-surface">
                    {value}
                </span>
            </div>

            <p className="mt-3 truncate text-label-sm font-bold text-on-surface-variant">
                {label}
            </p>
        </button>
    );
}