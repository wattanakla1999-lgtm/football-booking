export default function FilterSelect({
    id,
    label,
    icon,
    value,
    onChange,
    options,
}: {
    id: string;
    label: string;
    icon: string;
    value: string;
    onChange: (value: string) => void;
    options: Array<{
        value: string;
        label: string;
    }>;
}) {
    return (
        <div className="min-w-0">
            <label
                htmlFor={id}
                className="mb-1.5 flex items-center gap-1.5 text-label-sm font-bold text-on-surface-variant"
            >
                <span className="material-symbols-outlined text-[16px]">
                    {icon}
                </span>

                {label}
            </label>

            <select
                id={id}
                value={value}
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
            >
                {options.map((option : { value: string; label: string }) => (
                    <option
                        key={option.value}
                        value={option.value}
                    >
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
}