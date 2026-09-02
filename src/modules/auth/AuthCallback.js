import React, { useEffect } from "react";
import { useMsal } from "@azure/msal-react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { authApi } from "../../core/apiService";
import { setUser } from "../../store/userSlice";

const AuthCallback = () => {
  const { instance, accounts, inProgress } = useMsal();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const resolveUser = async () => {
      // MSAL may still be finishing up handleRedirectPromise() when this component
      // first mounts - wait for it rather than bouncing back to /login prematurely.
      if (inProgress !== "none") return;

      let account = instance.getActiveAccount();
      if (!account && accounts.length > 0) {
        account = accounts[0];
        instance.setActiveAccount(account);
      }

      if (!account) {
        console.warn("AuthCallback: no MSAL account found after redirect.");
        navigate("/login", { replace: true });
        return;
      }

      try {
        const res = await authApi.get("/getdetails/user");
        const data = res.data.data;
        dispatch(setUser(data));
        navigate("/dashboard", { replace: true });
      } catch (e) {
        console.error("AuthCallback: failed to fetch current user details.", e);
        navigate("/unauthorized", { replace: true });
      }
    };

    resolveUser();
  }, [inProgress, accounts, instance, dispatch, navigate]);

  return (
    <div className="d-flex flex-column align-items-center justify-content-center" style={{ height: "100vh" }}>
      <div className="spinner-border text-primary mb-3" role="status" />
      <div>Signing you in...</div>
    </div>
  );
};

export default AuthCallback;
