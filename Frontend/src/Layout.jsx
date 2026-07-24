import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import Navigation from "./Components/Navigation";
import Sidebar from "./Components/Sidebar";
import { backendFetch, clearSession, getToken, saveSession } from "./lib/backend";
import { replaceConnections } from "./lib/connections";

export default function Layout() {
  // signed-in users: the account on the backend is the source of truth
  useEffect(() => {
    if (!getToken()) return;
    backendFetch("/api/v1/users/me", { auth: true })
      .then(({ user }) => {
        saveSession(getToken(), user);
        replaceConnections(user.connections);
      })
      .catch((err) => {
        if (err.status === 401) clearSession();
        // backend unreachable — keep local connections and continue as before
      });
  }, []);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-bg text-ink">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <Navigation />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
