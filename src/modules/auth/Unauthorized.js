import React from "react";
import { useLocation } from "react-router-dom";

const Unauthorized = () => {
  const location = useLocation();
  const detail = location.state?.message;
  return (
    <div className="text-center mt-5">
      <h3>Not authorized</h3>
      <p className="text-muted">
        {detail || "Open Recruitment from the HRMS portal while you are signed in there."}
      </p>
    </div>
  );
};

export default Unauthorized;
