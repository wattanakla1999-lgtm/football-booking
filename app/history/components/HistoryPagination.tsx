import { getPaginationRange } from "@/src/utils/pagination";

type HistoryPaginationProps = {
  page: number;
  total: number;
  limit: number;
  totalPages: number;
  loading?: boolean;
  onPageChange: (page: number) => void;
};

export function HistoryPagination({
  page,
  total,
  limit,
  totalPages,
  loading = false,
  onPageChange,
}: HistoryPaginationProps) {
  if (total <= limit) {
    return null;
  }

  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);
  const pageRange = getPaginationRange(
    page,
    totalPages,
  );

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-white/50">
        แสดง{" "}
        <span className="font-bold text-white">
          {start}
        </span>{" "}
        ถึง{" "}
        <span className="font-bold text-white">
          {end}
        </span>{" "}
        จาก{" "}
        <span className="font-bold text-white">
          {total}
        </span>{" "}
        รายการ
      </p>

      <div className="flex flex-wrap items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={loading || page <= 1}
          className="inline-flex h-10 items-center justify-center rounded-xl border border-white/10 bg-black/20 px-3 text-sm font-bold text-white transition-all hover:border-green-500/30 hover:bg-green-500/10 disabled:cursor-not-allowed disabled:opacity-40"
        >
          ก่อนหน้า
        </button>

        {pageRange.map((pageNumber, index) => {
          const previousPage =
            pageRange[index - 1];

          return (
            <div
              key={pageNumber}
              className="flex items-center gap-2"
            >
              {previousPage &&
                pageNumber - previousPage > 1 && (
                  <span className="text-white/35">
                    ...
                  </span>
                )}

              <button
                type="button"
                onClick={() =>
                  onPageChange(pageNumber)
                }
                disabled={loading}
                className={`inline-flex h-10 min-w-10 items-center justify-center rounded-xl px-3 text-sm font-bold transition-all ${
                  pageNumber === page
                    ? "bg-green-500 text-white"
                    : "border border-white/10 bg-black/20 text-white hover:border-green-500/30 hover:bg-green-500/10"
                }`}
              >
                {pageNumber}
              </button>
            </div>
          );
        })}

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={loading || page >= totalPages}
          className="inline-flex h-10 items-center justify-center rounded-xl border border-white/10 bg-black/20 px-3 text-sm font-bold text-white transition-all hover:border-green-500/30 hover:bg-green-500/10 disabled:cursor-not-allowed disabled:opacity-40"
        >
          ถัดไป
        </button>
      </div>
    </section>
  );
}
