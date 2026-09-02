import React from "react";
import { Link, NavLink } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useMsal } from "@azure/msal-react";
import { clearUser } from "../store/userSlice";
import headerLogo from "../assets/header-logo.png";

const Header = () => {
  const { instance } = useMsal();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const privileges = user.privileges || {};

  const handleLogout = () => {
    dispatch(clearUser());
    instance.logoutRedirect({ postLogoutRedirectUri: "/login" });
  };

  return (
    <nav className="navbar navbar-expand-lg app-header px-3">
      <Link className="navbar-brand d-flex align-items-center gap-2" to="/dashboard">
        <img src={headerLogo} alt="logo" height="32" />
        <span className="fw-bold">Sentrifugo RMS</span>
      </Link>
      <div className="collapse navbar-collapse">
        <ul className="navbar-nav me-auto">
          {(privileges.Dashboard) && (
            <li className="nav-item">
              <NavLink className="nav-link" to="/dashboard">Dashboard</NavLink>
            </li>
          )}
          {privileges.JobPostings && (
            <li className="nav-item">
              <NavLink className="nav-link" to="/job-postings">Job Postings</NavLink>
            </li>
          )}
          {(privileges.CandidatePool || privileges.InterviewPool || privileges.CompensationPool || privileges.OfferPool) && (
            <li className="nav-item">
              <NavLink className="nav-link" to="/candidate-workflow">Candidate Workflow</NavLink>
            </li>
          )}
          {privileges.CommitteeManagement && (
            <li className="nav-item">
              <NavLink className="nav-link" to="/committee-management">Committee Management</NavLink>
            </li>
          )}
          {privileges.Interview && (
            <li className="nav-item">
              <NavLink className="nav-link" to="/interviewer">Interview</NavLink>
            </li>
          )}
          {(privileges.L1Approval || privileges.L2Approval) && (
            <li className="nav-item">
              <NavLink className="nav-link" to="/approvals">Approvals</NavLink>
            </li>
          )}
          {privileges.Admin && (
            <li className="nav-item dropdown">
              <button className="nav-link dropdown-toggle bg-transparent border-0" type="button" data-bs-toggle="dropdown">
                Admin
              </button>
              <ul className="dropdown-menu">
                <li><Link className="dropdown-item" to="/admin/users">Users</Link></li>
                <li><Link className="dropdown-item" to="/admin/departments">Departments</Link></li>
                <li><Link className="dropdown-item" to="/admin/locations">Locations</Link></li>
                <li><Link className="dropdown-item" to="/admin/position-titles">Position Titles</Link></li>
                <li><Link className="dropdown-item" to="/admin/education-qualifications">Education Qualifications</Link></li>
              </ul>
            </li>
          )}
        </ul>
        <div className="dropdown">
          <button className="nav-link dropdown-toggle bg-transparent border-0" type="button" data-bs-toggle="dropdown">
            {user.name} <small className="d-block text-white-50">{user.role}</small>
          </button>
          <ul className="dropdown-menu dropdown-menu-end">
            <li><button className="dropdown-item" onClick={handleLogout}>Logout</button></li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Header;
