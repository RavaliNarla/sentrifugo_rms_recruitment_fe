import React from "react";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import mascot from "../assets/mascot.png";

/**
 * Vertical nav, styled after the Sagar Cement Learning Hub sidebar: a green
 * gradient rail with a logo chip at top, section-labelled nav groups, and a
 * footer showing the signed-in user's role. Items are shown/hidden per the
 * signed-in user's privileges (same privilege flags PrivilegeRoute checks).
 */
const Sidebar = () => {
  const user = useSelector((state) => state.user);
  const privileges = user.privileges || {};

  const showCandidateWorkflow =
    privileges.CandidatePool || privileges.InterviewPool || privileges.CompensationPool || privileges.OfferPool;
  const showApprovals = privileges.L1Approval || privileges.L2Approval;

  return (
    <aside className="sidebar">
      <NavLink to="/dashboard" className="sidebar-brand">
        <span className="sidebar-logo-chip">
          <img src={mascot} alt="Sagar Cement" />
        </span>
        <span className="sidebar-brand-text">
          <span className="word">SAGAR RMS</span>
          <span className="sub">Recruitment Hub</span>
        </span>
      </NavLink>

      <nav className="sidebar-nav">
        {privileges.Dashboard && (
          <>
            <div className="nav-label">Recruitment</div>
            <NavLink to="/dashboard" className={({ isActive }) => (isActive ? "active" : "")}>
              <i className="bi bi-grid-1x2-fill" />
              <span className="label">Dashboard</span>
            </NavLink>
          </>
        )}
        {privileges.JobPostings && (
          <NavLink to="/job-postings" className={({ isActive }) => (isActive ? "active" : "")}>
            <i className="bi bi-briefcase-fill" />
            <span className="label">Job Postings</span>
          </NavLink>
        )}
        {showCandidateWorkflow && (
          <NavLink to="/candidate-workflow" className={({ isActive }) => (isActive ? "active" : "")}>
            <i className="bi bi-people-fill" />
            <span className="label">Candidate Management</span>
          </NavLink>
        )}
        {privileges.CommitteeManagement && (
          <NavLink to="/committee-management" className={({ isActive }) => (isActive ? "active" : "")}>
            <i className="bi bi-diagram-3-fill" />
            <span className="label">Committee Management</span>
          </NavLink>
        )}

        {showApprovals && (
          <>
            <div className="nav-label">Approvals</div>
            <NavLink to="/approvals" className={({ isActive }) => (isActive ? "active" : "")}>
              <i className="bi bi-check2-square" />
              <span className="label">Requisition Approvals</span>
            </NavLink>
            <NavLink to="/offer-approvals" className={({ isActive }) => (isActive ? "active" : "")}>
              <i className="bi bi-envelope-paper-fill" />
              <span className="label">Offer Approvals</span>
            </NavLink>
          </>
        )}

        {privileges.Interview && (
          <>
            <div className="nav-label">Interviews</div>
            <NavLink to="/interviewer" className={({ isActive }) => (isActive ? "active" : "")}>
              <i className="bi bi-person-video3" />
              <span className="label">My Interview Schedule</span>
            </NavLink>
          </>
        )}

        {privileges.Admin && (
          <>
            <div className="nav-label">Administration</div>
            <NavLink to="/admin/users" className={({ isActive }) => (isActive ? "active" : "")}>
              <i className="bi bi-person-badge-fill" />
              <span className="label">Users</span>
            </NavLink>
            <NavLink to="/admin/departments" className={({ isActive }) => (isActive ? "active" : "")}>
              <i className="bi bi-building" />
              <span className="label">Departments</span>
            </NavLink>
            <NavLink to="/admin/locations" className={({ isActive }) => (isActive ? "active" : "")}>
              <i className="bi bi-geo-alt-fill" />
              <span className="label">Locations</span>
            </NavLink>
            <NavLink to="/admin/position-titles" className={({ isActive }) => (isActive ? "active" : "")}>
              <i className="bi bi-award-fill" />
              <span className="label">Position Titles</span>
            </NavLink>
            <NavLink to="/admin/education-qualifications" className={({ isActive }) => (isActive ? "active" : "")}>
              <i className="bi bi-mortarboard-fill" />
              <span className="label">Education Qualifications</span>
            </NavLink>
            <NavLink to="/admin/specializations" className={({ isActive }) => (isActive ? "active" : "")}>
              <i className="bi bi-mortarboard" />
              <span className="label">Specializations</span>
            </NavLink>
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        <div className="label">Sagar Cement</div>
        <div>© {new Date().getFullYear()} Sagarsoft</div>
      </div>
    </aside>
  );
};

export default Sidebar;
