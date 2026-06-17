export default function FilterDate({
    id,
    label,
    value,
    min,
    max,
    onChange,
}: {
    id: string;
    label: string;
    value: string;
    min?: string;
    max?: string;
    onChange: (value: string) => void;
}) {
    return (
        <div className="min-w-0">
            <label
                htmlFor={id}
                className="mb-1.5 flex items-center gap-1.5 text-label-sm font-bold text-on-surface-variant"
            >
                <span className="material-symbols-outlined text-[16px]">
                    calendar_today
                </span>

                {label}
            </label>

            <input
                id={id}
                type="date"
                value={value}
                min={min}
                max={max}
                onChange={(event) =>
                    onChange(event.target.value)
                }
                className="
          h-11 w-full min-w-0 rounded-xl
          border border-outline-variant/20
          bg-surface-container px-3
          text-body-md text-on-surface
          outline-none transition-all
          focus:border-primary/60
          focus:ring-4 focus:ring-primary/10
        "
            />
        </div>
    );
}