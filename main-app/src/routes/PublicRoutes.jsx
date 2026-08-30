import { lazy } from "react";
import { Route } from "react-router-dom";
import PublicLayout from "../layouts/PublicLayout";

const Home = lazy(() => import("../modules/public/pages/Home"));
const About = lazy(() => import("../modules/public/pages/About"));
const Contact = lazy(() => import("../modules/public/pages/Contact"));
const Login = lazy(() => import("../modules/public/pages/Login"));
const ForgotPassword = lazy(() => import("../modules/public/pages/ForgotPassword"));
const Terms = lazy(() => import("../modules/public/pages/Terms"));
const Privacy = lazy(() => import("../modules/public/pages/Privacy"));
const Cookies = lazy(() => import("../modules/public/pages/Cookies"));
const Info = lazy(() => import("../modules/public/pages/Info"));
const ComingSoon = lazy(() => import("../modules/clinicadmin/pages/pet-owner/ComingSoon"));
const RoleSelection = lazy(() => import("../modules/public/pages/RoleSelection"));

const PublicRoutes = (
    <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/cookies" element={<Cookies />} />
        <Route path="/login" element={<Login />} />
        <Route path="/select-role" element={<RoleSelection />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/total-users" element={<Info />} />
        <Route path="/create-account" element={<ComingSoon />} />
    </Route>
);

export default PublicRoutes;
