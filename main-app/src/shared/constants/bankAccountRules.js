export const BANK_ACCOUNT_RULES = {
    "State Bank of India": { ifscPrefix: "SBIN", accountLengths: [11] },
    "HDFC Bank": { ifscPrefix: "HDFC", accountLengths: [14] },
    "ICICI Bank": { ifscPrefix: "ICIC", accountLengths: [12] },
    "Axis Bank": { ifscPrefix: "UTIB", accountLengths: [15] },
    "Punjab National Bank": { ifscPrefix: "PUNB", accountLengths: [16] },
    "Bank of Baroda": { ifscPrefix: "BARB", accountLengths: [14] },
    "Canara Bank": { ifscPrefix: "CNRB", accountLengths: [13] },
    "Union Bank of India": { ifscPrefix: "UBIN", accountLengths: [15] },
    "Kotak Mahindra Bank": { ifscPrefix: "KKBK", accountLengths: [14] },
    "Bank of India": { ifscPrefix: "BKID", accountLengths: [15] },
    "Indian Bank": { ifscPrefix: "IDIB", minAccountLength: 9, maxAccountLength: 18 },
    "Other": { minAccountLength: 9, maxAccountLength: 18 },
};

export const BANK_OPTIONS = Object.keys(BANK_ACCOUNT_RULES);

const cleanStr = (s) =>
    String(s || "")
        .toLowerCase()
        .replace(/&/g, "and")
        .replace(/[^a-z0-9]/g, "");

export const resolveBankName = (bankName) => {
    const cleanBankName = cleanStr(bankName);
    if (!cleanBankName) return "";

    return BANK_OPTIONS.find((option) => cleanStr(option) === cleanBankName) ||
        (cleanBankName === "sbi" ? "State Bank of India" : "");
};

export const getBankRule = (bankName) => BANK_ACCOUNT_RULES[resolveBankName(bankName)] || null;

export const formatAccountLength = (rule) => {
    if (!rule) return "9 to 18 digits";
    if (rule.accountLengths?.length === 1) return `${rule.accountLengths[0]} digits`;
    if (rule.accountLengths?.length) return `${rule.accountLengths.join(" or ")} digits`;
    return `${rule.minAccountLength || 9} to ${rule.maxAccountLength || 18} digits`;
};

export const getMaxAccountLength = (rule) =>
    Math.max(...(rule?.accountLengths || [rule?.maxAccountLength || 18]));

export const isValidIfsc = (value) =>
    /^[A-Z]{4}0[A-Z0-9]{6}$/.test(String(value || "").trim().toUpperCase());

export const isValidAccountNumber = (value) =>
    /^\d{9,18}$/.test(String(value || "").trim());
