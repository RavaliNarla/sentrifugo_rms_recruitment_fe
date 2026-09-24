import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { getAccessToken } from "../core/tokenStorage";

const PrivateRoute = ({ children }) => {
  const user = useSelector((state) => state.user);
  const hasToken = !!getAccessToken();

  if (!hasToken || !user.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;
