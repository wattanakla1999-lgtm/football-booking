const THAI_SHORT_WEEKDAYS = [
    "อา.",
    "จ.",
    "อ.",
    "พ.",
    "พฤ.",
    "ศ.",
    "ส.",
];

const THAI_SHORT_MONTHS = [
    "ม.ค.",
    "ก.พ.",
    "มี.ค.",
    "เม.ย.",
    "พ.ค.",
    "มิ.ย.",
    "ก.ค.",
    "ส.ค.",
    "ก.ย.",
    "ต.ค.",
    "พ.ย.",
    "ธ.ค.",
];

function parseDateValue(dateValue: string) {
    const normalizedValue = dateValue.includes("T")
        ? dateValue
        : `${dateValue}T12:00:00`;

    return new Date(normalizedValue);
}

export function formatPrice(price: number) {
    return new Intl.NumberFormat("th-TH", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(Number(price) || 0);
}

export function formatDate(dateValue: string) {
    const date = parseDateValue(dateValue);

    if (Number.isNaN(date.getTime())) {
        return "Invalid date";
    }

    const weekday =
        THAI_SHORT_WEEKDAYS[date.getDay()];
    const day = date.getDate();
    const month =
        THAI_SHORT_MONTHS[date.getMonth()];
    const year = date.getFullYear() + 543;

    return `${weekday} ${day} ${month} ${year}`;
}

export function normalizeDate(
    dateValue: string
): number | null {
    if (!dateValue) return null;

    const dateOnly = dateValue.includes("T")
        ? dateValue.split("T")[0]
        : dateValue;

    const date = new Date(`${dateOnly}T12:00:00`);

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
