type EmptyStateProps = {
  title: string;
  description: string;
  icon: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({
  title,
  description,
  icon,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <section className="flex min-h-72 flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-500/10 text-green-400">
        <span className="material-symbols-outlined text-[34px]">
          {icon}
        </span>
      </div>

      <h2 className="mt-4 max-w-3xl text-balance text-lg font-bold text-white">
        {title}
      </h2>

      <p className="mt-2 w-full max-w-2xl text-pretty text-sm leading-7 text-white/45">
        {description}
      </p>

      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-green-500 px-4 text-xs font-bold text-white transition-all hover:bg-green-400 active:scale-95"
        >
          <span className="material-symbols-outlined text-[18px]">
            filter_alt_off
          </span>
          {actionLabel}
        </button>
      )}
    </section>
  );
}
