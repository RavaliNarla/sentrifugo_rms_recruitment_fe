import React from "react";

const Unauthorized = () => (
  <div className="text-center mt-5">
    <h3>Access Denied</h3>
    <p className="text-muted">You do not have permission to view this page, or your account is not set up in the system.</p>
    <a href="/login" className="btn btn-outline-secondary">Back to Login</a>
  </div>
);

export default Unauthorized;
