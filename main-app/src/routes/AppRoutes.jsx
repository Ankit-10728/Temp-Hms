import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";

import PublicRoutes from "./PublicRoutes";
import SuperAdminRoutes from "./SuperAdminRoutes";
import ClinicAdminRoutes from "./ClinicAdminRoutes";
import PageNotFound from "../modules/public/pages/PageNotFound";

import ChangePassword from './ChangePassword';
import Payment from "../modules/billingModule/pages/PaymentPage";
import PaymentSucess from "../modules/billingModule/pages/PaymentSuccess";
import PaymentFailure from "../modules/billingModule/pages/PaymentFailed";
import ComingSoon from "../modules/clinicadmin/pages/pet-owner/ComingSoon";


function AppRoutes() {
    return (
        <Routes>
            {PublicRoutes}
            {SuperAdminRoutes}
            {ClinicAdminRoutes}

            <Route
                path="/payment"
                element={<Payment />}
            />
            <Route path="/payment-success" element={<PaymentSucess />} />
            <Route path="/payment-failure" element={<PaymentFailure />} />

            <Route path="/change-password" element={<ChangePassword />} />
            <Route path="/coming-soon" element={<ComingSoon />} />

            <Route path="/unauthorized" element={<div />} />

            <Route path="*" element={<PageNotFound />} />

        </Routes>
    );
}

export default AppRoutes;
