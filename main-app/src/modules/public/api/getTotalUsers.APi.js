import API from "../../../shared/api/axios";

/* GET ALL users */
export const getUsers = async () => {
    console.log("***");
    const res = await API.get("/total-users");

    return res;
};

