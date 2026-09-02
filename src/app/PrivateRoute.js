import React from "react";
import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const isMsalAuthenticated = useIsAuthenticated();
  const { inProgress } = useMsal();
  const user = useSelector((state) => state.user);

  if (inProgress !== "none") {
    return <div className="text-center mt-5">Loading...</div>;
  }

  if (!isMsalAuthenticated || !user.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;
