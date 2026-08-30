import API from "../../../shared/api/axios";

const BASE_URL = "/clinic/kennel";


export const getKennels = async () => {
    const res = await API.get(BASE_URL);
    return res.data;
};

export const getKennelById = async (id) => {
    const res = await API.get(`${BASE_URL}/${id}`);
    return res.data;
};

export const createKennel = async (kennelData) => {

    console.log("Kennel data --->>", kennelData);


    const formData = buildKennelFormData(kennelData);

    console.log("--- FormData Contents ---");
    for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
            console.log(`${key}: [File] ${value.name} (${value.size} bytes, ${value.type})`);
        } else {
            console.log(`${key}: ${value}`);
        }
    }

    const res = await API.post(
        `${BASE_URL}/create`,
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
    );

    return res.data;
};

/* UPDATE KENNEL */
export const updateKennel = async (id, kennelData) => {
    const formData = buildKennelFormData(kennelData);

    const res = await API.put(
        `${BASE_URL}/${id}`,
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
    );

    return res.data;
};

/* TOGGLE STATUS */
export const toggleKennelStatus = async (id) => {
    const res = await API.patch(
        `${BASE_URL}/${id}/status`
    );

    return res.data;
};

/* DELETE */
export const deleteKennel = async (id) => {
    const res = await API.delete(
        `${BASE_URL}/${id}`
    );

    return res.data;
};

/* BUILDER */

const buildKennelFormData = (kennelData) => {
    const formData = new FormData();

    formData.append(
        "staffId",
        kennelData.staffId || ""
    );

    formData.append(
        "experience",
        kennelData.experience || 0
    );

    formData.append(
        "shift",
        kennelData.shift || ""
    );

    formData.append(
        "firstAidCertified",
        kennelData.firstAidCertified
    );

    formData.append(
        "canAdministerMedication",
        kennelData.canAdministerMedication
    );

    formData.append(
        "speciesComfortableWith",
        JSON.stringify(
            kennelData.speciesComfortableWith || []
        )
    );

    if (kennelData.firstAidCertificate) {
        formData.append(
            "firstAidCertificate",
            kennelData.firstAidCertificate
        );
    }

    return formData;
};