export default function MenuButton({
    icon,
    label,
    className,
    onClick,
}: {
    icon: string;
    label: string;
    className?: string;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`
        flex w-full items-center gap-2.5
        px-4 py-2.5 text-left
        text-body-md font-bold
        transition-colors
        hover:bg-surface-container-high
        ${className || ""}
      `}
        >
            <span className="material-symbols-outlined text-[19px]">
                {icon}
            </span>

            {label}
        </button>
    );
}