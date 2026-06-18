type ErrorStateProps = {
  message: string;
  onRetry: () => void;
};

export function ErrorState({
  message,
  onRetry,
}: ErrorStateProps) {
  return (
    <section className="flex min-h-72 flex-col items-center justify-center rounded-3xl border border-red-500/20 bg-red-500/[0.06] p-8 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">
        <span className="material-symbols-outlined text-[30px]">
          error
        </span>
      </div>

      <h2 className="mt-4 text-lg font-bold text-white">
        โหลดข้อมูลไม่สำเร็จ
      </h2>

      <p className="mt-2 max-w-md text-sm text-white/50">
        {message}
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-red-500 px-4 text-xs font-bold text-white transition-all hover:bg-red-400 active:scale-95"
      >
        <span className="material-symbols-outlined text-[18px]">
          refresh
        </span>
        ลองอีกครั้ง
      </button>
    </section>
  );
}
