import { Navigate } from "react-router-dom";
import { getToken } from "../lib/backend";

/** Login/register only — signed-in users go to the dashboard. */
export default function GuestRoute({ children }) {
  if (getToken()) return <Navigate to="/" replace />;
  return children;
}
