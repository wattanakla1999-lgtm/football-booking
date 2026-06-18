type BookingDashboardErrorProps = {
  message: string;
  onRetry: () => void;
};

export function BookingDashboardError({
  message,
  onRetry,
}: BookingDashboardErrorProps) {
  return (
    <section className="glass-card rounded-xl p-xl text-center">
      <span className="material-symbols-outlined text-error text-4xl">
        error
      </span>

      <h2 className="mt-3 text-headline-md font-headline-md">
        โหลดข้อมูลไม่สำเร็จ
      </h2>

      <p className="mt-2 text-on-surface-variant">
        {message}
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-4 rounded-lg bg-primary px-4 py-2 font-bold text-on-primary"
      >
        ลองอีกครั้ง
      </button>
    </section>
  );
}
