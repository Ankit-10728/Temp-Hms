import { lazy } from "react";
import { Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import DoctorLayout from "../layouts/DoctorStaffLayout";
import ReceptionLayout from "../layouts/ReceptionLayout";
import ClinicAdminLayout from "../layouts/ClinicAdminLayout";
import PreConsultationLayout from "../layouts/PreConsultationLayout";
import LabLayout from "../layouts/LabLayout";

const Dashboard = lazy(() => import("../modules/clinicadmin/features/dashboard/Dashboard"));
const StaffEnrollment = lazy(() => import("../modules/clinicadmin/features/staff/StaffEnrollment"));
const DoctorDetails = lazy(() => import("../modules/clinicadmin/features/doctors/DoctorDetails"));
const LabTechnician = lazy(() => import("../modules/clinicadmin/features/lab/LabTechnician"));
const Groomer = lazy(() => import("../modules/clinicadmin/features/groomer/Groomer"));
const KennelStaff = lazy(() => import("../modules/clinicadmin/features/kennel/KennelStaff"));
const ClinicSettings = lazy(() => import("../modules/clinicadmin/features/settings/ClinicSettings"));
const Reports = lazy(() => import("../modules/clinicadmin/features/reports/Reports"));

const ReceptionDashboard = lazy(() => import("../modules/clinicadmin/pages/clinic-receptionist/ReceptionDashboard"));
const NewRegistrationPet = lazy(() => import("../modules/clinicadmin/pages/clinic-receptionist/NewRegistrationPet"));
const ExistingCustomerPet = lazy(() => import("../modules/clinicadmin/pages/clinic-receptionist/ExistingCustomerPet"));
const PetHistory = lazy(() => import("../modules/clinicadmin/pages/clinic-receptionist/PetHistory"));
const CreateVisit = lazy(() => import("../modules/clinicadmin/pages/clinic-receptionist/CreateVisit"));

const LabDashboard = lazy(() => import("../modules/clinicadmin/pages/lab_pages/LabDashboard"));
const LabReportUpload = lazy(() => import("../modules/clinicadmin/pages/lab_pages/LabReportUpload"));
const LabPendingCases = lazy(() => import("../modules/clinicadmin/pages/lab_pages/PendingPetsLab"));

const PetOwnerDashboard = lazy(() => import("../modules/clinicadmin/pages/pet-owner/PetOwnerDashboard"));
const PetOwnerHistory = lazy(() => import("../modules/clinicadmin/pages/pet-owner/PetOwnerHistory"));
const PetOwnerUploadDocuments = lazy(() => import("../modules/clinicadmin/pages/pet-owner/PetOwnerUploadDocuments"));

const PreConsultationDashboard = lazy(() => import("../modules/clinicadmin/pages/pre-consultations/PreConsultationDashboard"));
const PendingPets = lazy(() => import("../modules/clinicadmin/pages/pre-consultations/PendingPets"));
const CompletedPets = lazy(() => import("../modules/clinicadmin/pages/pre-consultations/CompletedPets"));
const HistoryPets = lazy(() => import("../modules/clinicadmin/pages/pre-consultations/HistoryPets"));

const DoctorDashboard = lazy(() => import("../modules/clinicadmin/pages/doctor-staff/DoctorDashboard"));
const DoctorPendingPetsPage = lazy(() => import("../modules/clinicadmin/pages/doctor-staff/DoctorPendingPetsPage"));
const DoctorCompletedPetsPage = lazy(() => import("../modules/clinicadmin/pages/doctor-staff/DoctorCompletedPetsPage"));
const DoctorHistoryPetsPage = lazy(() => import("../modules/clinicadmin/pages/doctor-staff/DoctorHistoryPetsPage"));

import PrePaidSubscription from "../modules/clinicadmin/features/subscription/PrePaidSubscription";

const ClinicAdminRoutes = (
  <>
    {/* Clinic Admin */}
    <Route
      path="/clinic"
      element={
        <ProtectedRoute allowedRoles={["CLINIC_ADMIN"]}>
          <ClinicAdminLayout />
        </ProtectedRoute>
      }
    >
      <Route index element={<Dashboard />} />
      <Route path="staff" element={<StaffEnrollment />} />
      <Route path="doctors" element={<DoctorDetails />} />
      <Route path="lab-technician" element={<LabTechnician />} />
      <Route path="groomer" element={<Groomer />} />
      <Route path="kennel" element={<KennelStaff />} />
      <Route path="reports" element={<Reports />} />
      <Route path="reports/basic" element={<Reports />} />
      <Route path="settings" element={<ClinicSettings />} />
      <Route path="subscription" element={<PrePaidSubscription />} />
    </Route>

    {/* Pre-Consultation */}
    <Route
      path="/clinic/preconsultation"
      element={
        <ProtectedRoute allowedRoles={["PRE_CONSULTATION_STAFF", "CLINIC_ADMIN"]}>
          <PreConsultationLayout />
        </ProtectedRoute>
      }
    >
      <Route index element={<PreConsultationDashboard />} />
      <Route path="pending" element={<PendingPets />} />
      <Route path="completed" element={<CompletedPets />} />
      <Route path="history" element={<HistoryPets />} />
    </Route>

    {/* Doctor */}
    <Route
      path="/clinic/doctor"
      element={
        <ProtectedRoute allowedRoles={["DOCTOR", "CLINIC_ADMIN"]}>
          <DoctorLayout />
        </ProtectedRoute>
      }
    >
      <Route index element={<DoctorDashboard />} />
      <Route path="pending" element={<DoctorPendingPetsPage />} />
      <Route path="completed" element={<DoctorCompletedPetsPage />} />
      <Route path="history" element={<DoctorHistoryPetsPage />} />
    </Route>


    {/* Reception */}
    <Route path="/clinic/reception" element={<ReceptionLayout />}>
      <Route index element={<ReceptionDashboard />} />
      <Route path="new-registration" element={<NewRegistrationPet />} />
      <Route path="create-visit" element={<CreateVisit />} />
      <Route path="existing-customer" element={<ExistingCustomerPet />} />
      <Route path="history" element={<PetHistory />} />
    </Route>

    {/* Lab — FIX Bug 7: added ProtectedRoute guard */}
    <Route
      path="/clinic/lab"
      element={
        <ProtectedRoute allowedRoles={["LAB_TECHNICIAN", "CLINIC_ADMIN"]}>
          <LabLayout />
        </ProtectedRoute>
      }
    >
      <Route index element={<LabDashboard />} />
      <Route path="upload" element={<LabReportUpload />} />
      <Route path="pending-pets" element={<LabPendingCases />} />
    </Route>

    {/* Pet Owner */}
    <Route path="/clinic/owner">
      <Route index element={<PetOwnerDashboard />} />
      <Route path="history" element={<PetOwnerHistory />} />
      <Route path="upload" element={<PetOwnerUploadDocuments />} />
    </Route>
  </>
);

export default ClinicAdminRoutes;
