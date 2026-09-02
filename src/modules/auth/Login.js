import React, { useState } from "react";
import { useMsal } from "@azure/msal-react";
import { InteractionStatus } from "@azure/msal-browser";
import { toast } from "react-toastify";
import { loginRequest } from "../../app/msalConfig";
import logo from "../../assets/logo.png";
import pana from "../../assets/pana.png";
import "./Login.css";

const Login = () => {
  const { instance, inProgress } = useMsal();
  const [loggingIn, setLoggingIn] = useState(false);

  const handleLogin = async () => {
    setLoggingIn(true);
    try {
      // If a previous attempt left MSAL thinking an interaction is still in progress
      // (e.g. the page was refreshed mid-redirect), clear it first - otherwise
      // loginRedirect() throws "interaction_in_progress" and silently does nothing,
      // which looks exactly like the button not working.
      if (inProgress !== InteractionStatus.None) {
        sessionStorage.removeItem("msal.interaction.status");
      }
      await instance.loginRedirect({ ...loginRequest, prompt: "select_account" });
    } catch (e) {
      console.error("Login redirect failed:", e);
      toast.error(e.errorMessage || "Failed to start Microsoft login. Check the console for details.");
      setLoggingIn(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-left-panel">
        <img src={pana} alt="Recruitment illustration" />
        <h1 className="fw-bold">Sentrifugo RMS</h1>
        <p className="text-white-50">Recruitment made simple</p>
      </div>
      <div className="login-right-panel">
        <img src={logo} alt="Company logo" className="logo" />
        <h4 className="mb-4">Welcome to the Recruiter Portal</h4>
        <button className="btn btn-primary btn-lg px-5 w-100" disabled={loggingIn} onClick={handleLogin}>
          {loggingIn ? "Redirecting to Microsoft..." : "Login with Microsoft"}
        </button>
      </div>
    </div>
  );
};

export default Login;
