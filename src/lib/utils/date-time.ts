export function formatBusinessDateTime(
    value: string,
    timezone: string,
): string {
    if (!value || !timezone) {
        return value;
    }

    // Database datetime strings are UTC, even if the API omits "Z".
    const normalizedValue =
        /(?:Z|[+-]\d{2}:\d{2})$/i.test(value)
            ? value
            : `${value.replace(" ", "T")}Z`;

    const date = new Date(normalizedValue);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    try {
        return new Intl.DateTimeFormat(undefined, {
            timeZone: timezone,
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
            timeZoneName: "short",
        }).format(date);
    } catch {
        return value;
    }
}