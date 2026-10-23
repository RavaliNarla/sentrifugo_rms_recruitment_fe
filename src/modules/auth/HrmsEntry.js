import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import authApiService from "../../core/authApiService";
import { setAccessToken } from "../../core/tokenStorage";
import { setUser } from "../../store/userSlice";

const HRMS_ACCESS = "hrms_access_token";
const HRMS_REFRESH = "hrms_refresh_token";

/** Opened from the HRMS Recruitment link. Tokens arrive in the URL hash and are removed immediately. */
const HrmsEntry = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    window.history.replaceState(null, "", window.location.pathname + window.location.search);

    if (!accessToken) {
      navigate("/unauthorized", { replace: true });
      return;
    }
    sessionStorage.setItem(HRMS_ACCESS, accessToken);
    if (refreshToken) sessionStorage.setItem(HRMS_REFRESH, refreshToken);

    authApiService
      .hrmsEnter(accessToken)
      .then((res) => {
        const payload = res.data.data;
        setAccessToken(payload.accessToken);
        dispatch(setUser(payload.user));
        navigate("/dashboard", { replace: true });
      })
      .catch((err) => {
        setAccessToken(null);
        const message = err.response?.data?.message;
        navigate("/unauthorized", { replace: true, state: message ? { message } : undefined });
      });
  }, [dispatch, navigate]);

  return (
    <div className="text-center mt-5 text-muted">Checking your HRMS session…</div>
  );
};

export default HrmsEntry;
