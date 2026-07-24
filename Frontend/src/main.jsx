import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
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

const router = createBrowserRouter([
  { path: "/login", element: <Login />, errorElement: <RouteError /> },
  { path: "/register", element: <Register />, errorElement: <RouteError /> },
  {
    path: "/",
    element: <Layout />,
    errorElement: <RouteError />,
    children: [
      { path: "", element: <Overview /> },
      { path: "github", element: <GitHubPage /> },
      { path: "leetcode", element: <LeetCodePage /> },
      { path: "connections", element: <Connections /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
