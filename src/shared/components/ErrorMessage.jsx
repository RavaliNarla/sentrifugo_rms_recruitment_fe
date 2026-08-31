// src/components/ErrorMessage.jsx
import React from "react";

const ErrorMessage = ({ children }) => {
  if (!children) return null;
  return (
    <div
      className="error-message"
      style={{ color: "#dc3545", fontSize: 12, marginTop: 6 }}
    >
      {children}
    </div>
  );
};

export default ErrorMessage;
