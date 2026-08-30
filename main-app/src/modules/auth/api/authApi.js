import API from "../../../shared/api/axios"


export const authApi = async (loginData) => {
    try {

        console.log("LOGIN RESPONSE:", loginData);
        const res = await API.post("/auth/login", loginData);


        // /auth/login in this project is OTP/TOTP-gated for most roles.
        // Avoid storing token here because token is issued only after OTP verify.
        return res.data;
    } catch (error) {
        console.log("this is from Login page frontend " + error.response.data);

        throw error.response?.data || { message: "Login failed" };
    }
};

export const googleLoginApi = async (credential) => {
    try {
        const res = await API.post("/auth/google-login", { credential });
        return res.data;
    } catch (error) {
        throw error.response?.data || { message: "Google login failed" };
    }
};

export const changePassword = async (passwordData) => {
    try {
        const res = await API.post("/auth/change-password", passwordData);
        return res.data;
    } catch (error) {
        throw error.response?.data || { message: "Password update failed" };
    }
};
