import type { PaginationMeta } from "@/src/types/pagination";

export function parsePageParam(value?: string) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }

  return Math.floor(parsed);
}

export function createPaginationMeta({
  total,
  page,
  limit,
}: {
  total: number;
  page: number;
  limit: number;
}): PaginationMeta {
  const totalPages = Math.max(
    1,
    Math.ceil(total / limit),
  );

  return {
    total,
    page: Math.min(page, totalPages),
    limit,
    totalPages,
  };
}

export function getPaginationRange(
  currentPage: number,
  totalPages: number,
) {
  const start = Math.max(1, currentPage - 1);
  const end = Math.min(totalPages, currentPage + 1);
  const range: number[] = [];

  for (let page = start; page <= end; page += 1) {
    range.push(page);
  }

  if (!range.includes(1)) {
    range.unshift(1);
  }

  if (!range.includes(totalPages)) {
    range.push(totalPages);
  }

  return Array.from(new Set(range));
}
