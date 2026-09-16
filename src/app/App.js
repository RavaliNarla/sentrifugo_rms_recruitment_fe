import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import PrivateRoute from "./PrivateRoute";
import PrivilegeRoute from "./PrivilegeRoute";
import Layout from "./Layout";
import Login from "../modules/auth/Login";
import AuthCallback from "../modules/auth/AuthCallback";
import Unauthorized from "../modules/auth/Unauthorized";
import Dashboard from "../modules/dashboard/Dashboard";
import JobPostings from "../modules/jobPosting/JobPostings";
import CreateRequisition from "../modules/jobPosting/CreateRequisition";
import AddPosition from "../modules/jobPosting/AddPosition";
import Approvals from "../modules/approvals/Approvals";
import CandidateWorkflow from "../modules/candidateWorkflow/CandidateWorkflow";
import CommitteeManagement from "../modules/committeeManagement/CommitteeManagement";
import InterviewerSchedule from "../modules/interviewer/InterviewerSchedule";
import UsersPage from "../modules/admin/UsersPage";
import DepartmentsPage from "../modules/admin/DepartmentsPage";
import LocationsPage from "../modules/admin/LocationsPage";
import PositionTitlesPage from "../modules/admin/PositionTitlesPage";
import EducationQualificationsPage from "../modules/admin/EducationQualificationsPage";

function withLayout(element) {
  return <Layout>{element}</Layout>;
}

function App() {
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        <Route path="/login" element={<Login />} />
        {/* Old BOB FE used /sagarsoft/login — keep bookmark/Azure redirect from looping there */}
        <Route path="/sagarsoft/login" element={<Navigate to="/login" replace />} />
        <Route path="/sagarsoft/*" element={<Navigate to="/login" replace />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        <Route path="/dashboard" element={<PrivateRoute>{withLayout(<Dashboard />)}</PrivateRoute>} />

        <Route
          path="/job-postings"
          element={
            <PrivateRoute>
              <PrivilegeRoute privilege="JobPostings">{withLayout(<JobPostings />)}</PrivilegeRoute>
            </PrivateRoute>
          }
        />
        <Route
          path="/job-postings/create-requisition"
          element={
            <PrivateRoute>
              <PrivilegeRoute privilege="JobPostings">{withLayout(<CreateRequisition />)}</PrivilegeRoute>
            </PrivateRoute>
          }
        />
        <Route
          path="/job-postings/:requisitionId/add-position"
          element={
            <PrivateRoute>
              <PrivilegeRoute privilege="JobPostings">{withLayout(<AddPosition />)}</PrivilegeRoute>
            </PrivateRoute>
          }
        />

        <Route
          path="/approvals"
          element={
            <PrivateRoute>
              <PrivilegeRoute privilegesRequired={["L1Approval", "L2Approval"]}>{withLayout(<Approvals />)}</PrivilegeRoute>
            </PrivateRoute>
          }
        />

        <Route
          path="/candidate-workflow"
          element={
            <PrivateRoute>
              <PrivilegeRoute
                privilegesRequired={["CandidatePool", "InterviewPool", "CompensationPool", "OfferPool"]}
              >
                {withLayout(<CandidateWorkflow />)}
              </PrivilegeRoute>
            </PrivateRoute>
          }
        />

        <Route
          path="/committee-management"
          element={
            <PrivateRoute>
              <PrivilegeRoute privilege="CommitteeManagement">{withLayout(<CommitteeManagement />)}</PrivilegeRoute>
            </PrivateRoute>
          }
        />

        <Route
          path="/interviewer"
          element={
            <PrivateRoute>
              <PrivilegeRoute privilege="Interview">{withLayout(<InterviewerSchedule />)}</PrivilegeRoute>
            </PrivateRoute>
          }
        />

        <Route
          path="/admin/users"
          element={<PrivateRoute><PrivilegeRoute privilege="Admin">{withLayout(<UsersPage />)}</PrivilegeRoute></PrivateRoute>}
        />
        <Route
          path="/admin/departments"
          element={<PrivateRoute><PrivilegeRoute privilege="Admin">{withLayout(<DepartmentsPage />)}</PrivilegeRoute></PrivateRoute>}
        />
        <Route
          path="/admin/locations"
          element={<PrivateRoute><PrivilegeRoute privilege="Admin">{withLayout(<LocationsPage />)}</PrivilegeRoute></PrivateRoute>}
        />
        <Route
          path="/admin/position-titles"
          element={<PrivateRoute><PrivilegeRoute privilege="Admin">{withLayout(<PositionTitlesPage />)}</PrivilegeRoute></PrivateRoute>}
        />
        <Route
          path="/admin/education-qualifications"
          element={<PrivateRoute><PrivilegeRoute privilege="Admin">{withLayout(<EducationQualificationsPage />)}</PrivilegeRoute></PrivateRoute>}
        />

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
}

export default App;
