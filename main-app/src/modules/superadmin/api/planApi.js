import API from "../../../shared/api/axios";

export const createPlan = async (planData) => {
    const res = await API.post("/super-admin/plans", planData);
    return res.data;
};

export const getPlans = async () => {
    const res = await API.get("/super-admin/plans");
    return res.data;
};

export const updatePlan = async (id, planData) => {
    const res = await API.put(`/super-admin/plans/${id}`, planData);
    return res.data;
};

export const deletePlan = async (id) => {
    const res = await API.delete(`/super-admin/plans/${id}`);
    return res.data;
};
