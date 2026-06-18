"use client";

import { getPaginationRange } from "@/src/utils/pagination";

interface PaginationControlsProps {
  page: number;
  total: number;
  limit: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function PaginationControls({
  page,
  total,
  limit,
  totalPages,
  onPageChange,
}: PaginationControlsProps) {
  if (total === 0) {
    return null;
  }

  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);
  const pageRange = getPaginationRange(
    page,
    totalPages,
  );

  return (
    <section className="glass-card flex flex-col gap-4 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
      <p className="text-label-sm text-on-surface-variant">
        แสดง{" "}
        <span className="font-bold text-on-surface">
          {start}
        </span>{" "}
        ถึง{" "}
        <span className="font-bold text-on-surface">
          {end}
        </span>{" "}
        จาก{" "}
        <span className="font-bold text-on-surface">
          {total}
        </span>{" "}
        รายการ
      </p>

      <div className="flex flex-wrap items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="inline-flex h-10 items-center justify-center gap-1 rounded-xl border border-outline-variant/20 bg-surface-container-low px-3 text-label-md font-bold text-on-surface transition-all hover:bg-surface-container-high active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
        >
          ก่อนหน้า
        </button>

        {pageRange.map((pageNumber : number, index : number) => {
          const previousPage =
            pageRange[index - 1];

          return (
            <div
              key={pageNumber}
              className="flex items-center gap-2"
            >
              {previousPage &&
                pageNumber - previousPage > 1 && (
                  <span className="text-on-surface-variant">
                    ...
                  </span>
                )}

              <button
                type="button"
                onClick={() =>
                  onPageChange(pageNumber)
                }
                className={`inline-flex h-10 min-w-10 items-center justify-center rounded-xl px-3 text-label-md font-bold transition-all active:scale-95 ${
                  pageNumber === page
                    ? "bg-primary text-on-primary"
                    : "border border-outline-variant/20 bg-surface-container-low text-on-surface hover:bg-surface-container-high"
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
          disabled={page >= totalPages}
          className="inline-flex h-10 items-center justify-center gap-1 rounded-xl border border-outline-variant/20 bg-surface-container-low px-3 text-label-md font-bold text-on-surface transition-all hover:bg-surface-container-high active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
        >
          ถัดไป
        </button>
      </div>
    </section>
  );
}
