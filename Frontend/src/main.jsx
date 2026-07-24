import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import "./index.css";
import Layout from "./Layout.jsx";
import Overview from "./Components/Menu/Overview.jsx";
import GitHubPage from "./Components/Menu/GitHub.jsx";
import LeetCodePage from "./Components/Menu/LeetCode.jsx";
import Connections from "./Components/Menu/Connections.jsx";
import Login from "./Components/Authentication/Login.jsx";
import Register from "./Components/Authentication/Register.jsx";
import NotFound from "./NotFound.jsx";
import RouteError from "./RouteError.jsx";
import RequireAuth from "./Components/RequireAuth.jsx";
import GuestRoute from "./Components/GuestRoute.jsx";

const router = createBrowserRouter([
  {
    path: "/login",
    element: (
      <GuestRoute>
        <Login />
      </GuestRoute>
    ),
    errorElement: <RouteError />,
  },
  {
    path: "/register",
    element: (
      <GuestRoute>
        <Register />
      </GuestRoute>
    ),
    errorElement: <RouteError />,
  },
  {
    path: "/",
    element: (
      <RequireAuth>
        <Layout />
      </RequireAuth>
    ),
    errorElement: <RouteError />,
    children: [
      { path: "", element: <Overview /> },
      { path: "github", element: <GitHubPage /> },
      { path: "leetcode", element: <LeetCodePage /> },
      { path: "connections", element: <Connections /> },
      { path: "*", element: <NotFound /> },
    ],
  },
  { path: "*", element: <Navigate to="/login" replace /> },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
