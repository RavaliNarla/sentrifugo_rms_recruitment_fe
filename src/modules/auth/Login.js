import React, { useEffect, useState } from "react";
import { useMsal } from "@azure/msal-react";
import { InteractionStatus } from "@azure/msal-browser";
import { toast } from "react-toastify";
import { loginRequest } from "../../app/msalConfig";
import logo from "../../assets/sagar-logo.png";
import companyLogo from "../../assets/sagar-cement-logo.png";
import "./Login.css";

const Login = () => {
  const { instance, inProgress } = useMsal();
  const [loggingIn, setLoggingIn] = useState(false);

  // SCL_01: after loginRedirect() navigates away, some browsers restore this page
  // from the back/forward cache (bfcache) on Back, without re-running JS - so the
  // `loggingIn=true` set right before navigating away survives and leaves the
  // button stuck disabled/"Redirecting...". Reset on every mount and on bfcache
  // restore (pageshow with event.persisted) so the button always comes back.
  useEffect(() => {
    setLoggingIn(false);
    const handlePageShow = (event) => {
      if (event.persisted) {
        setLoggingIn(false);
      }
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

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
    <div className="auth-shell">
      <div className="auth-left">
        <div className="auth-left-logo">
          <img src={logo} alt="Sagar Recruitment Hub" className="auth-left-brand-logo" />
        </div>

        <div className="auth-hero-wrap">
          <div className="auth-hero">
            <h2>Recruit Smarter,<br />Hire Faster.</h2>
            <p>
              A single, streamlined portal for Sagar Cement's recruiters to raise requisitions,
              screen candidates, run interview panels, and send offers — end to end.
            </p>
          </div>
        </div>

        <span className="auth-badge">Recruiter Portal &bull; Sagar Cement</span>
      </div>

      <div className="auth-right">
        <div className="auth-right-inner">
          <img src={companyLogo} alt="Sagar Cement" className="auth-logo" />
          <div className="auth-heading">Welcome to the Recruiter Portal</div>
          <div className="auth-subheading">Sign in with your Sagar Cement Microsoft account to continue.</div>

          <div className="auth-card">
            <button type="button" className="btn-auth-ms" disabled={loggingIn} onClick={handleLogin}>
              <i className="bi bi-microsoft" />
              {loggingIn ? "Redirecting to Microsoft..." : "Sign in with Microsoft"}
            </button>
          </div>
        </div>

        <div className="auth-footer">Powered by Sagarsoft &copy; {new Date().getFullYear()}</div>
      </div>
    </div>
  );
};

export default Login;
