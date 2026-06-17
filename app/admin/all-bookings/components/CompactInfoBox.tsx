export default function CompactInfoBox({
    icon,
    label,
    value,
    secondary,
    highlight = false,
}: {
    icon: string;
    label: string;
    value: string;
    secondary?: string;
    highlight?: boolean;
}) {
    return (
        <div className="flex min-w-0 items-start gap-2 rounded-lg border border-outline-variant/10 bg-surface-container-low/60 p-2.5">
            <div
                className={`
          flex h-7 w-7 shrink-0
          items-center justify-center rounded-md
          ${highlight
                        ? "bg-primary text-on-primary"
                        : "bg-primary/10 text-primary"
                    }
        `}
            >
                <span className="material-symbols-outlined text-[15px]">
                    {icon}
                </span>
            </div>

            <div className="min-w-0 flex-1">
                <p className="text-[8px] font-bold uppercase tracking-wider text-on-surface-variant">
                    {label}
                </p>

                <p
                    title={value}
                    className={`
            mt-0.5 truncate text-xs font-bold
            ${highlight
                            ? "text-primary"
                            : "text-on-surface"
                        }
          `}
                >
                    {value}
                </p>

                {secondary && (
                    <p className="mt-0.5 truncate text-[9px] text-on-surface-variant">
                        {secondary}
                    </p>
                )}
            </div>
        </div>
    );
}