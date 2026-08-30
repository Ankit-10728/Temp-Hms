
import API from "../../../shared/api/axios";

export const createSubscriptionPayment = async (clinicId) => {
    const { data } = await API.post(
        "/subscription/create-subscription",
        { clinicId }
    );
    console.log(data);

    return data;
};


export const getSubscriptionDetails = async (clinicId) => {
    const response = await API.get(`/subscription/${clinicId}`);
    console.log(response);

    return response.data.data;
}

