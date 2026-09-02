import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

/**
 * Gate a route behind one privilege, or any-of a list of privileges.
 */
const PrivilegeRoute = ({ children, privilege, privilegesRequired }) => {
  const privileges = useSelector((state) => state.user.privileges) || {};

  if (privilege && !privileges[privilege]) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (privilegesRequired && !privilegesRequired.some((key) => privileges[key])) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default PrivilegeRoute;
