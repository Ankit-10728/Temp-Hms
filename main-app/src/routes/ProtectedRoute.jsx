import { Navigate, useLocation } from "react-router-dom";
import API from "../shared/api/axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { normalizeRole } from "../shared/utils/roleRedirects";
import TrialPaymentModal from "../modules/billingModule/components/TrialPaymentModal";
import { getSubscriptionStatus } from "../modules/clinicadmin/api/subscriptionApi"


const ProtectedRoute = ({ children, allowedRoles }) => {
    const location = useLocation();
    const token = localStorage.getItem("token");
    const rawRole = localStorage.getItem("role");
    const navigate = useNavigate();
    const normalizedRole = normalizeRole(rawRole) || null;
    const [loading, setLoading] = useState(true);
    const [subscriptionData, setSubscriptionData] = useState(null);
    const [remainingTrialDays, setRemainingTrialDays] = useState(0);
    const [showTrialPopup, setShowTrialPopup] = useState(false);

    useEffect(() => {
        const checkSubscription = async () => {

            if (!token) {
                setLoading(false);
                return;
            }

            if (normalizedRole !== "CLINIC_ADMIN") {
                setLoading(false);
                return;
            }

            try {
                const { data } = await API.get("/clinic/subscription/status");

                // The live endpoint returns subscription fields flattened
                // directly under data (data.subscriptionStatus, data.plan,
                // data.remainingTrialDays, ...) rather than a separate
                // top-level `subscription` object - matching that shape here
                // is what keeps this from crashing right after OTP login.
                setSubscriptionData(data);
                setRemainingTrialDays(data?.data?.remainingTrialDays ?? 0);

                const shouldShowPopup =
                    location.state?.forceTrialPopup ||
                    !sessionStorage.getItem("trial-popup");

                if (
                    data?.data?.subscriptionStatus === "TRIAL" &&
                    shouldShowPopup
                ) {
                    setShowTrialPopup(true);

                    sessionStorage.setItem("trial-popup", "true");
                }

            } catch (err) {
                console.error(err);

                // Only a genuine auth failure (expired/invalid token) should
                // log the user out. Other failures (e.g. no subscription
                // record yet for this clinic) shouldn't wipe a valid session.
                if (err.response?.status === 401) {
                    localStorage.clear();
                    sessionStorage.clear();
                }
            } finally {
                setLoading(false);
            }
        };

        checkSubscription();
    }, [token, normalizedRole]);

    if (loading) {
        return <div>Loading...</div>;
    }
    if (!token) {
        // location state bhej kar history ko strongly replace kar rahe hain
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (!allowedRoles.includes(normalizedRole)) {
        return <Navigate to="/unauthorized" replace />;
    }


    if (normalizedRole === "CLINIC_ADMIN" && subscriptionData?.data) {

        const clinic = subscriptionData.data;
        const status = clinic.subscriptionStatus;

        // Allow access during trial or active subscription
        if (
            status === "TRIAL" ||
            status === "ACTIVE"
        ) {
            if (showTrialPopup) {
                return (
                    <TrialPaymentModal
                        open={true}
                        onClose={() => setShowTrialPopup(false)}
                        remainingTrialDays={remainingTrialDays}
                        clinicId={clinic._id}
                        email={clinic.contactEmail}
                    />
                );
            }

            return children;
        }

        // Redirect when payment is required or subscription expired
        if (
            status === "PAYMENT_REQUIRED" ||
            status === "EXPIRED"
        ) {
            return (
                <Navigate
                    to="/payment"
                    replace
                    state={{
                        clinicId: clinic._id,
                        email: clinic.contactEmail,
                    }}
                />
            );
        }
    }

    return children;
};

export default ProtectedRoute;
