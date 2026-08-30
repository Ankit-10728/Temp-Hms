
import { Navbar, Footer } from "../modules/public/components"
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getDashboardPathForRole } from "../shared/utils/roleRedirects";

function PublicLayout() {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const dashboardPath = getDashboardPathForRole(role);
    const location = useLocation();

    if (token) {
        if (localStorage.getItem("passwordResetRequired") === "true") {
            return <Navigate to="/change-password" replace />;
        }

        // /contact stays reachable for logged-in users too (e.g. Clinic
        // Admin's "Contact Admin To Change Plan" button) instead of being
        // bounced straight back to their dashboard.
        if (dashboardPath && location.pathname !== "/contact") {
            return <Navigate to={dashboardPath} replace />;
        }
    }

    return (
        <>
            <Navbar />
            <Outlet />
            <Footer />
        </>
    );
}

export default PublicLayout;
