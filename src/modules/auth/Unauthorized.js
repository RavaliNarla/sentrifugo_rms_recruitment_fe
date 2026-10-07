import React from "react";
import { Link } from "react-router-dom";

const Unauthorized = () => (
  <div className="text-center mt-5">
    <h3>Access Denied</h3>
    <p className="text-muted">You do not have permission to view this page, or your account is not set up in the system.</p>
    <Link to="/login" className="btn btn-outline-secondary">Back to Login</Link>
  </div>
);

export default Unauthorized;
