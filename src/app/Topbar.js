import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useMsal } from "@azure/msal-react";
import { clearUser } from "../store/userSlice";
import { getPageMeta } from "./pageMeta";

const getInitials = (name = "") => {
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 0) return "";
  return parts.length === 1
    ? parts[0][0].toUpperCase()
    : (parts[0][0] + parts[1][0]).toUpperCase();
};

const formatRole = (role = "") =>
  role.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

/**
 * Horizontal bar to the right of the sidebar: breadcrumb + page title/subtitle
 * on the left (LMS "Learning / Dashboard" pattern), notification bell +
 * user avatar pill with a dropdown (Sign out) on the right.
 */
const Topbar = () => {
  const { instance } = useMsal();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const location = useLocation();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(clearUser());
    instance.logoutRedirect({ postLogoutRedirectUri: "/login" });
  };

  const meta = getPageMeta(location.pathname, user);

  return (
    <div className="topbar">
      <div>
        <div className="title">{meta.title}</div>
        {meta.subtitle && <div className="sub">{meta.subtitle}</div>}
      </div>

      <div className="topbar-actions">
        <div className="position-relative" ref={userMenuRef}>
          <button type="button" className="topbar-user-pill" onClick={() => setShowUserMenu((prev) => !prev)}>
            <span className="avatar">{getInitials(user.name)}</span>
            <span className="info">
              <span className="d-block name">{user.name}</span>
              <span className="d-block role">{formatRole(user.role)}</span>
            </span>
            <i className={`bi bi-chevron-${showUserMenu ? "up" : "down"} chevron`} />
          </button>

          {showUserMenu && (
            <div
              className="position-absolute end-0 mt-2 topbar-dropdown-menu"
              style={{ top: "100%", zIndex: 1050 }}
            >
              <div className="dropdown-item danger" onClick={handleLogout}>
                <i className="bi bi-box-arrow-right" />
                Sign out
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Topbar;
