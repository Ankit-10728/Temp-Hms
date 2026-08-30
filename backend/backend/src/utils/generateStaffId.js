const Staff = require("../models/Staff.js");

const generateStaffId = async () => {
    const existingStaff = await Staff.find(
        {},
        { "employmentInfo.staffId": 1 }
    ).lean();

    const highestNumber = existingStaff.reduce((maxValue, staff) => {
        const staffId = staff?.employmentInfo?.staffId || "";
        const match = staffId.match(/^STF(\d+)$/i);

        if (!match) {
            return maxValue;
        }

        const currentNumber = Number(match[1]);
        return Number.isFinite(currentNumber) && currentNumber > maxValue
            ? currentNumber
            : maxValue;
    }, 0);

    return `STF${String(highestNumber + 1).padStart(4, "0")}`;
};

module.exports = generateStaffId;
