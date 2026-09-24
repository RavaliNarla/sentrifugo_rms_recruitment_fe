import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import authApiService from "../../core/authApiService";
import { setAccessToken } from "../../core/tokenStorage";
import { setUser } from "../../store/userSlice";
import logo from "../../assets/sagar-logo.png";
import companyLogo from "../../assets/sagar-cement-logo.png";
import "./Login.css";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loggingIn, setLoggingIn] = useState(false);
  const submittingRef = useRef(false);

  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1 request OTP, 2 reset
  const [forgotUsername, setForgotUsername] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [forgotErrors, setForgotErrors] = useState({});
  const [forgotBusy, setForgotBusy] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const otpInputRefs = useRef([]);
  const otp = otpDigits.join("");

  useEffect(() => {
    if (resendCooldown <= 0) return undefined;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);


  const handleLogin = async (e) => {
    e.preventDefault();
    if (submittingRef.current) return;
    const next = {};
    if (!username.trim()) next.username = "Employee ID or email is required";
    if (!password) next.password = "Password is required";
    setErrors(next);
    if (Object.keys(next).length) return;

    submittingRef.current = true;
    setLoggingIn(true);
    try {
      const res = await authApiService.login({
        username: username.trim(),
        password,
      });
      const payload = res.data.data;
      setAccessToken(payload.accessToken);
      dispatch(setUser(payload.user));
      navigate("/dashboard", { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid username or password");
    } finally {
      submittingRef.current = false;
      setLoggingIn(false);
    }
  };

  const openForgot = () => {
    setForgotOpen(true);
    setForgotStep(1);
    setForgotUsername(username.trim());
    setOtpDigits(["", "", "", "", "", ""]);
    setNewPassword("");
    setConfirmPassword("");
    setForgotErrors({});
    setResendCooldown(0);
  };

  const closeForgot = () => {
    setForgotOpen(false);
    setForgotBusy(false);
  };

  const focusOtpBox = (index) => {
    const el = otpInputRefs.current[index];
    if (el) el.focus();
  };

  const handleOtpChange = (index, raw) => {
    const digit = raw.replace(/\D/g, "").slice(-1);
    setOtpDigits((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });
    if (forgotErrors.otp) setForgotErrors((p) => ({ ...p, otp: undefined }));
    if (digit && index < 5) focusOtpBox(index + 1);
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      e.preventDefault();
      setOtpDigits((prev) => {
        const next = [...prev];
        next[index - 1] = "";
        return next;
      });
      focusOtpBox(index - 1);
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      focusOtpBox(index - 1);
    } else if (e.key === "ArrowRight" && index < 5) {
      e.preventDefault();
      focusOtpBox(index + 1);
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = (e.clipboardData.getData("text") || "").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const next = ["", "", "", "", "", ""];
    for (let i = 0; i < pasted.length; i += 1) next[i] = pasted[i];
    setOtpDigits(next);
    if (forgotErrors.otp) setForgotErrors((p) => ({ ...p, otp: undefined }));
    focusOtpBox(Math.min(pasted.length, 5));
  };

  const sendOtp = async ({ isResend = false } = {}) => {
    const next = {};
    if (!forgotUsername.trim()) next.forgotUsername = "Employee ID or email is required";
    setForgotErrors(next);
    if (Object.keys(next).length) return;
    setForgotBusy(true);
    try {
      await authApiService.forgotPassword({ username: forgotUsername.trim() });
      toast.success(isResend
        ? "A new OTP has been sent to the registered email."
        : "If an account exists, an OTP has been sent to the registered email.");
      setForgotStep(2);
      setOtpDigits(["", "", "", "", "", ""]);
      setResendCooldown(30);
      setTimeout(() => focusOtpBox(0), 50);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setForgotBusy(false);
    }
  };

  const submitReset = async () => {
    const next = {};
    if (otp.length !== 6) next.otp = "Enter the 6-digit OTP";
    if (!newPassword || newPassword.length < 8) next.newPassword = "Password must be at least 8 characters";
    if (newPassword !== confirmPassword) next.confirmPassword = "Passwords do not match";
    setForgotErrors(next);
    if (Object.keys(next).length) return;
    setForgotBusy(true);
    try {
      await authApiService.resetPassword({
        username: forgotUsername.trim(),
        otp,
        newPassword,
      });
      toast.success("Password updated. Please sign in.");
      closeForgot();
      setPassword("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reset password");
    } finally {
      setForgotBusy(false);
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
          <div className="auth-subheading">Sign in with your Employee ID or email to continue.</div>

          <div className="auth-card">
            <form onSubmit={handleLogin} noValidate>
              <div className="mb-3 text-start">
                <label className="form-label auth-label">Employee ID or Email</label>
                <input
                  className={`form-control ${errors.username ? "is-invalid" : ""}`}
                  value={username}
                  autoComplete="username"
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (errors.username) setErrors((p) => ({ ...p, username: undefined }));
                  }}
                />
                <div className="text-danger fs-13 mt-1" style={{ minHeight: 18 }}>{errors.username || ""}</div>
              </div>
              <div className="mb-2 text-start">
                <label className="form-label auth-label">Password</label>
                <input
                  type="password"
                  className={`form-control ${errors.password ? "is-invalid" : ""}`}
                  value={password}
                  autoComplete="current-password"
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((p) => ({ ...p, password: undefined }));
                  }}
                />
                <div className="text-danger fs-13 mt-1" style={{ minHeight: 18 }}>{errors.password || ""}</div>
              </div>
              <div className="text-end mb-3">
                <button type="button" className="btn btn-link p-0 auth-forgot-link" onClick={openForgot}>
                  Forgot password?
                </button>
              </div>
              <button type="submit" className="btn-auth-ms" disabled={loggingIn}>
                {loggingIn ? "Signing in..." : "Sign in"}
              </button>
            </form>
          </div>
        </div>

        <div className="auth-footer">Powered by Sagarsoft &copy; {new Date().getFullYear()}</div>
      </div>

      {forgotOpen && (
        <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.45)", zIndex: 2000 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{forgotStep === 1 ? "Forgot Password" : "Reset Password"}</h5>
                <button type="button" className="btn-close" onClick={closeForgot} />
              </div>
              <div className="modal-body">
                {forgotStep === 1 ? (
                  <>
                    <p className="text-muted fs-14">
                      Enter your Employee ID or email. We will send a one-time password (OTP) to the registered email.
                    </p>
                    <label className="form-label">Employee ID or Email</label>
                    <input
                      className={`form-control ${forgotErrors.forgotUsername ? "is-invalid" : ""}`}
                      value={forgotUsername}
                      onChange={(e) => setForgotUsername(e.target.value)}
                    />
                    <div className="text-danger fs-13 mt-1" style={{ minHeight: 18 }}>{forgotErrors.forgotUsername || ""}</div>
                  </>
                ) : (
                  <>
                    <p className="text-muted fs-14">
                      Enter the OTP sent to your email and choose a new password.
                    </p>
                    <div className="mb-3">
                      <label className="form-label">Enter your OTP</label>
                      <div className="auth-otp-row" onPaste={handleOtpPaste}>
                        {otpDigits.map((digit, index) => (
                          <input
                            key={index}
                            ref={(el) => { otpInputRefs.current[index] = el; }}
                            type="text"
                            inputMode="numeric"
                            autoComplete={index === 0 ? "one-time-code" : "off"}
                            maxLength={1}
                            className={`auth-otp-box ${forgotErrors.otp ? "is-invalid" : ""}`}
                            value={digit}
                            onChange={(e) => handleOtpChange(index, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                            onFocus={(e) => e.target.select()}
                          />
                        ))}
                      </div>
                      <div className="text-danger fs-13 mt-1" style={{ minHeight: 18 }}>{forgotErrors.otp || ""}</div>
                      <div className="auth-otp-resend">
                        <span>Didn&apos;t receive the OTP?</span>
                        <button
                          type="button"
                          className="btn btn-link p-0 auth-otp-resend-btn"
                          disabled={forgotBusy || resendCooldown > 0}
                          onClick={() => sendOtp({ isResend: true })}
                        >
                          {resendCooldown > 0 ? `Resend OTP (${resendCooldown}s)` : "Resend OTP"}
                        </button>
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">New Password</label>
                      <input
                        type="password"
                        className={`form-control ${forgotErrors.newPassword ? "is-invalid" : ""}`}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                      <div className="text-danger fs-13 mt-1" style={{ minHeight: 18 }}>{forgotErrors.newPassword || ""}</div>
                    </div>
                    <div className="mb-1">
                      <label className="form-label">Confirm Password</label>
                      <input
                        type="password"
                        className={`form-control ${forgotErrors.confirmPassword ? "is-invalid" : ""}`}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                      <div className="text-danger fs-13 mt-1" style={{ minHeight: 18 }}>{forgotErrors.confirmPassword || ""}</div>
                    </div>
                  </>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeForgot}>Cancel</button>
                {forgotStep === 1 ? (
                  <button type="button" className="btn btn-primary" disabled={forgotBusy} onClick={() => sendOtp()}>
                    {forgotBusy ? "Sending..." : "Send OTP"}
                  </button>
                ) : (
                  <button type="button" className="btn btn-primary" disabled={forgotBusy} onClick={submitReset}>
                    {forgotBusy ? "Saving..." : "Reset Password"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
