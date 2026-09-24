import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { clearUser } from "../store/userSlice";
import { clearAccessToken } from "../core/tokenStorage";
import authApiService from "../core/authApiService";
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

const formatNotifTime = (iso) => {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
};

/**
 * Horizontal bar to the right of the sidebar: page title/subtitle on the left,
 * notifications bell + user avatar pill with Sign out on the right.
 */
const Topbar = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const location = useLocation();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifLoading, setNotifLoading] = useState(false);
  const userMenuRef = useRef(null);
  const notifMenuRef = useRef(null);

  const loadNotifications = async () => {
    try {
      const res = await authApiService.getNotifications();
      const data = res.data?.data || {};
      setNotifications(data.items || []);
      setUnreadCount(data.unreadCount || 0);
    } catch {
      // Keep prior list; bell is non-critical.
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 60000);
    const onRefresh = () => loadNotifications();
    window.addEventListener("rms:notifications-refresh", onRefresh);
    return () => {
      clearInterval(interval);
      window.removeEventListener("rms:notifications-refresh", onRefresh);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(e.target)) {
        setShowNotifMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const openNotifications = async () => {
    const opening = !showNotifMenu;
    setShowNotifMenu(opening);
    setShowUserMenu(false);
    if (!opening) return;

    setNotifLoading(true);
    try {
      const res = await authApiService.getNotifications();
      const data = res.data?.data || {};
      const items = data.items || [];
      const unread = data.unreadCount || 0;
      setNotifications(items);
      setUnreadCount(unread);
      if (unread > 0) {
        await authApiService.markNotificationsRead();
        setUnreadCount(0);
        setNotifications(items.map((n) => ({ ...n, unread: false })));
      }
    } catch {
      // ignore
    } finally {
      setNotifLoading(false);
    }
  };

  const handleLogout = () => {
    clearAccessToken();
    dispatch(clearUser());
    window.location.href = "/login";
  };

  const meta = getPageMeta(location.pathname, user);
  const badgeLabel = unreadCount > 99 ? "99+" : String(unreadCount);

  return (
    <div className="topbar">
      <div>
        <div className="title">{meta.title}</div>
        {meta.subtitle && <div className="sub">{meta.subtitle}</div>}
      </div>

      <div className="topbar-actions">
        <div className="position-relative" ref={notifMenuRef}>
          <button
            type="button"
            className="topbar-icon-btn topbar-notif-btn"
            title="Notifications"
            aria-label="Notifications"
            onClick={openNotifications}
          >
            <i className="bi bi-bell-fill" />
            {unreadCount > 0 && <span className="topbar-notif-badge">{badgeLabel}</span>}
          </button>

          {showNotifMenu && (
            <div
              className="position-absolute end-0 mt-2 topbar-notif-dropdown"
              style={{ top: "100%", zIndex: 1050 }}
            >
              <div className="topbar-notif-header">Notifications</div>
              <div className="topbar-notif-list">
                {notifLoading && notifications.length === 0 ? (
                  <div className="topbar-notif-empty">Loading...</div>
                ) : notifications.length === 0 ? (
                  <div className="topbar-notif-empty">No notifications in the last 3 days</div>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className={`topbar-notif-item${n.unread ? " unread" : ""}`}>
                      <div className="topbar-notif-text">{n.message}</div>
                      <div className="topbar-notif-time">{formatNotifTime(n.createdDate)}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="position-relative" ref={userMenuRef}>
          <button type="button" className="topbar-user-pill" onClick={() => { setShowUserMenu((prev) => !prev); setShowNotifMenu(false); }}>
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
