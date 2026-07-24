import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { backendFetch, clearSession, getToken, saveSession } from "../lib/backend";
import { replaceConnections } from "../lib/connections";
import { LoadingPane } from "./ui/Primitives";

/** Blocks the app until the user is signed in with a valid session. */
export default function RequireAuth({ children }) {
  const location = useLocation();
  const [status, setStatus] = useState(() => (getToken() ? "checking" : "denied"));

  useEffect(() => {
    if (!getToken()) {
      setStatus("denied");
      return;
    }

    let alive = true;
    setStatus("checking");

    backendFetch("/api/v1/users/me", { auth: true })
      .then(({ user }) => {
        if (!alive) return;
        saveSession(getToken(), user);
        replaceConnections(user.connections);
        setStatus("ok");
      })
      .catch((err) => {
        if (!alive) return;
        if (err.status === 401) clearSession();
        setStatus("denied");
      });

    return () => {
      alive = false;
    };
  }, []);

  if (status === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <LoadingPane label="verifying session" />
      </div>
    );
  }

  if (status === "denied") {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}
