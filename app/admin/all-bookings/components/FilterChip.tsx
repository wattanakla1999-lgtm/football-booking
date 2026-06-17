export default function FilterChip({
    label,
    onRemove,
}: {
    label: string;
    onRemove: () => void;
}) {
    return (
        <span className="inline-flex max-w-full items-center gap-1 rounded-full border border-primary/20 bg-primary/10 py-1 pl-2.5 pr-1 text-label-sm text-primary">
            <span className="max-w-48 truncate">
                {label}
            </span>

            <button
                type="button"
                onClick={onRemove}
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-primary/20"
                aria-label={`Remove ${label} filter`}
            >
                <span className="material-symbols-outlined text-[14px]">
                    close
                </span>
            </button>
        </span>
    );
}