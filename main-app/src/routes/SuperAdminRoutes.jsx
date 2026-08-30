import { lazy } from "react";
import { Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import SuperAdminLayout from "../layouts/SuperAdminLayout";

const Dashboard = lazy(() => import("../modules/superadmin/pages/Dashboard"));
const Clinics = lazy(() => import("../modules/superadmin/pages/Clinics"));
const Doctors = lazy(() => import("../modules/superadmin/pages/Doctors"));
const Plans = lazy(() => import("../modules/superadmin/pages/Plans"));
const Reports = lazy(() => import("../modules/superadmin/pages/Reports"));
const Verification = lazy(() => import("../modules/superadmin/pages/Verification"));
const Settings = lazy(() => import("../modules/superadmin/pages/Settings"));
const BasicReports = lazy(() => import("../modules/superadmin/pages/BasicReports"));

const SuperAdminRoutes = (
    <Route
        path="/superadmin"
        element={
            <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
                <SuperAdminLayout />
            </ProtectedRoute>
        }
    >
        <Route index element={<Dashboard />} />
        <Route path="clinics" element={<Clinics />} />
        <Route path="veterinarian" element={<Doctors />} />
        <Route path="plans" element={<Plans />} />
        <Route path="reports" element={<Reports />} />
        <Route path="reports/basic" element={<BasicReports />} />
        <Route path="verification" element={<Verification />} />
        <Route path="settings" element={<Settings />} />
    </Route>
);

export default SuperAdminRoutes;
