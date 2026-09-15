import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useMsal } from "@azure/msal-react";
import { clearUser } from "../store/userSlice";
import headerLogo from "../assets/header-logo.png";

const getInitials = (name = "") => {
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 0) return "";
  return parts.length === 1
    ? parts[0][0].toUpperCase()
    : (parts[0][0] + parts[1][0]).toUpperCase();
};

const formatRole = (role = "") =>
  role.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

const Header = () => {
  const { instance } = useMsal();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const privileges = user.privileges || {};

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const userMenuRef = useRef(null);
  const adminMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
      if (adminMenuRef.current && !adminMenuRef.current.contains(e.target)) {
        setShowAdminMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(clearUser());
    instance.logoutRedirect({ postLogoutRedirectUri: "/login" });
  };

  const isAdminRoute = window.location.pathname.startsWith("/admin");

  return (
    <header>
      {/* ===================== TOP COLOR BAR ===================== */}
      <div className="app-header-topbar">
        <Link to="/dashboard" className="brand">
          <img src={headerLogo} alt="Sentrifugo RMS" />
          <span>Sentrifugo RMS</span>
        </Link>

        <div className="d-flex align-items-center gap-3" ref={userMenuRef}>
          <div
            className="d-flex align-items-center gap-2 position-relative"
            style={{ cursor: "pointer" }}
            onClick={() => setShowUserMenu((prev) => !prev)}
          >
            <div className="app-header-avatar">{getInitials(user.name)}</div>
            <div className="d-flex flex-column">
              <div className="d-flex align-items-center text-white fs-13">
                {user.name}
                <i className={`bi bi-chevron-${showUserMenu ? "up" : "down"} ms-1`} style={{ fontSize: "0.7rem" }} />
              </div>
              <small className="text-white-50" style={{ fontSize: "0.7rem" }}>{formatRole(user.role)}</small>
            </div>

            {showUserMenu && (
              <div
                className="position-absolute end-0 mt-1 bg-white border rounded shadow"
                style={{ top: "100%", minWidth: 180, zIndex: 1050 }}
              >
                <div className="px-3 py-2 text-danger" style={{ cursor: "pointer", fontSize: "0.875rem" }} onClick={handleLogout}>
                  <i className="bi bi-box-arrow-right me-2" />
                  Logout
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===================== WHITE TAB NAVBAR ===================== */}
      <nav className="app-header-navbar">
        <ul className="nav">
          {privileges.Dashboard && (
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
            <li className="nav-item position-relative" ref={adminMenuRef}>
              <button
                type="button"
                className={`nav-link bg-transparent border-0 ${isAdminRoute ? "active" : ""}`}
                onClick={() => setShowAdminMenu((prev) => !prev)}
              >
                Admin <i className="bi bi-chevron-down ms-1" style={{ fontSize: "0.7rem" }} />
              </button>
              {showAdminMenu && (
                <div
                  className="position-absolute bg-white border rounded shadow"
                  style={{ top: "100%", left: 0, minWidth: 220, zIndex: 1050 }}
                  onClick={() => setShowAdminMenu(false)}
                >
                  <Link className="dropdown-item py-2 px-3" to="/admin/users">Users</Link>
                  <Link className="dropdown-item py-2 px-3" to="/admin/departments">Departments</Link>
                  <Link className="dropdown-item py-2 px-3" to="/admin/locations">Locations</Link>
                  <Link className="dropdown-item py-2 px-3" to="/admin/position-titles">Position Titles</Link>
                  <Link className="dropdown-item py-2 px-3" to="/admin/education-qualifications">Education Qualifications</Link>
                </div>
              )}
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header;
