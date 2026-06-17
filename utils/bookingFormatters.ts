export function formatPrice(price: number) {
    return new Intl.NumberFormat("th-TH", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(Number(price) || 0);
}

export function formatDate(dateValue: string) {
    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return "Invalid date";
    }

    return date.toLocaleDateString("th-TH", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

export function normalizeDate(
    dateValue: string
): number | null {
    if (!dateValue) return null;

    const dateOnly = dateValue.includes("T")
        ? dateValue.split("T")[0]
        : dateValue;

    const date = new Date(`${dateOnly}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return date.getTime();
}

export function capitalize(value: string) {
    return (
        value.charAt(0).toUpperCase() +
        value.slice(1)
    );
}