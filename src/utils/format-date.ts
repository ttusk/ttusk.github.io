export const formatDate = (date: Date | string) =>
    new Intl.DateTimeFormat("pt-BR", {
        timeZone: "UTC",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(new Date(date));
