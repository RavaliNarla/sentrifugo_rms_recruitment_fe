import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const NonAdminRoute = () => {
  const role = useSelector((state) => state.user?.user?.role?.toLowerCase());

  // Admin should NEVER access job-posting
  if (role === "admin") {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default NonAdminRoute;
