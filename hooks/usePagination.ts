import { useCallback, useMemo, useState } from "react";

export function usePagination<T>(
    items: T[],
    itemsPerPage: number
) {
    const [currentPage, setCurrentPage] = useState(1);

    const totalItems = items.length;

    const totalPages = Math.max(
        1,
        Math.ceil(totalItems / itemsPerPage)
    );

    const safeCurrentPage = Math.min(
        currentPage,
        totalPages
    );

    const startIndex =
        (safeCurrentPage - 1) * itemsPerPage;

    const endIndex = Math.min(
        startIndex + itemsPerPage,
        totalItems
    );

    const paginatedItems = useMemo(() => {
        return items.slice(startIndex, endIndex);
    }, [items, startIndex, endIndex]);

    const goToPreviousPage = () => {
        setCurrentPage((page) =>
            Math.max(page - 1, 1)
        );
    };

    const goToNextPage = () => {
        setCurrentPage((page) =>
            Math.min(page + 1, totalPages)
        );
    };

    const resetPage = useCallback(() => {
        setCurrentPage(1);
    }, []);

    return {
        currentPage: safeCurrentPage,
        totalPages,
        totalItems,
        startIndex,
        endIndex,
        paginatedItems,
        goToPreviousPage,
        goToNextPage,
        resetPage,
    };
}
