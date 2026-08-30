export const calculateEndDate = (startDate, billingCycle) => {
    if (!startDate) return "";

    const date = new Date(startDate);

    switch (billingCycle) {
        case "Monthly":
            date.setMonth(date.getMonth() + 1);
            break;

        case "Quarterly":
            date.setMonth(date.getMonth() + 3);
            break;

        case "Annual":
            date.setFullYear(date.getFullYear() + 1);
            break;

        default:
            date.setMonth(date.getMonth() + 1);
    }

    return date.toISOString().split("T")[0];
};

export const getTodayDate = () => {
    return new Date().toISOString().split("T")[0];
};