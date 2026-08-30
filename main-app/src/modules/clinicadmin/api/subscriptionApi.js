import API from "../../../shared/api/axios";

const BASE_URL = "/clinic/subscription";

/* GET SUBSCRIPTION STATUS */
export const getSubscriptionStatus = async () => {
    const res = await API.get(`${BASE_URL}/status`);

    console.log("Subscription Status:");
    console.log(res.data);

    return res.data;
};

/* GET ALL AVAILABLE PLANS */
export const getAllPlans = async () => {
    const res = await API.get(`${BASE_URL}/all-plans`);

    console.log("Available Subscription Plans:");
    console.log(res.data);

    return res.data;
};

/* GET CURRENT SUBSCRIPTION */
export const getCurrentSubscription = async () => {
    const res = await API.get(`${BASE_URL}/current-status`);

    console.log("Current Subscription:");
    console.log(res.data);

    return res.data;
};