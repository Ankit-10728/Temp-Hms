import axios from "axios";

const API = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    withCredentials: true,
});

API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Requests that legitimately return 401 on their own (wrong password/OTP,
// no active session yet) shouldn't force-redirect - only an *expired or
// invalid* token on an otherwise-authenticated request should.
const AUTH_ENDPOINT_PATTERN = /\/(login|verify-otp|resend-otp|select-role|forgot-password|reset-password)/i;

const clearSessionAndRedirect = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    localStorage.removeItem("passwordResetRequired");
    localStorage.removeItem("totpRequired");
    sessionStorage.clear();
    if (window.location.pathname !== "/login") {
        window.location.assign("/login?sessionExpired=1");
    }
};

API.interceptors.response.use(
    (res) => res,
    (err) => {
        console.error("API ERROR:", err.response?.data || err.message);
        const requestUrl = err.config?.url || "";

        if (err.response?.data?.code === "CLINIC_INACTIVE") {
            clearSessionAndRedirect();
        } else if (
            err.response?.status === 401 &&
            localStorage.getItem("token") &&
            !AUTH_ENDPOINT_PATTERN.test(requestUrl)
        ) {
            // A logged-in session suddenly getting 401'd on a normal request
            // means the token expired or was invalidated server-side -
            // previously this just surfaced a raw "Invalid token" message
            // wherever the failing call happened to be (e.g. mid-way
            // through Add Clinic) with no path back to a working session.
            clearSessionAndRedirect();
        }
        return Promise.reject(err);
    }
);

export default API;
