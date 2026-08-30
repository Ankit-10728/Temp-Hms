
import toast from "react-hot-toast";
import CustomToast from "./CustomToast";

export const showToast = ({
    type,
    title,
    description,
}) => {
    toast.custom((t) => (
        <CustomToast
            t={t}
            type={type}
            title={title}
            description={description}
        />
    ));
};