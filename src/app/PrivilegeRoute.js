import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const PrivilegeRoute = ({ children, privilege, privilegesRequired }) => {
  const privileges = useSelector((state) => state.user?.privileges);
  const authUser = useSelector((state) => state.user?.authUser);

  // Wait until user is authenticated AND privileges are loaded
  if (!authUser || !privileges || Object.keys(privileges).length === 0) {
    return <div>Loading...</div>;
  }

  // Single privilege
  if (privilege && !privileges[privilege]) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Multiple privileges (OR condition)
  if (
    privilegesRequired &&
    !privilegesRequired.some((key) => privileges[key])
  ) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default PrivilegeRoute;
