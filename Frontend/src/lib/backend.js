/**
 * Client for the DevDash backend API (Express + MongoDB).
 * Responses follow the ApiResponse shape: { statusCode, data, message, success }.
 */

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

export function getToken() {
  return localStorage.getItem("userToken");
}

export function getSessionUser() {
  try {
    return JSON.parse(localStorage.getItem("userData"));
  } catch {
    return null;
  }
}

export function saveSession(accessToken, user) {
  localStorage.setItem("userToken", accessToken);
  localStorage.setItem("userData", JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem("userToken");
  localStorage.removeItem("userData");
}

export async function backendFetch(path, { method = "GET", body, auth = false } = {}) {
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    const err = new Error("Can't reach the DevDash server. Make sure the backend is running.");
    err.offline = true;
    throw err;
  }

  let payload = null;
  try {
    payload = await res.json();
  } catch {
    /* non-JSON response */
  }

  if (!res.ok) {
    const err = new Error(payload?.message ?? `Request failed (${res.status})`);
    err.status = res.status;
    err.errors = payload?.errors ?? [];
    throw err;
  }
  return payload?.data ?? payload;
}

/**
 * Persists GitHub/LeetCode usernames to the signed-in user's MongoDB document.
 * Returns the updated user, or null when not signed in.
 */
export async function saveConnectionsToDatabase(connections) {
  if (!getToken()) return null;

  const { user } = await backendFetch("/api/v1/users/connections", {
    method: "PATCH",
    auth: true,
    body: {
      github: connections.github ?? null,
      leetcode: connections.leetcode ?? null,
    },
  });

  saveSession(getToken(), user);
  return user;
}

/** After sign-in: merge any guest links into the account and persist to DB. */
export async function mergeGuestConnectionsIntoAccount(serverConnections, localConnections) {
  const merged = {
    github: serverConnections?.github ?? localConnections?.github ?? null,
    leetcode: serverConnections?.leetcode ?? localConnections?.leetcode ?? null,
  };

  const changed =
    merged.github !== (serverConnections?.github ?? null) ||
    merged.leetcode !== (serverConnections?.leetcode ?? null);

  if (!changed) return serverConnections ?? merged;

  const { user } = await backendFetch("/api/v1/users/connections", {
    method: "PATCH",
    auth: true,
    body: merged,
  });

  saveSession(getToken(), user);
  return user.connections;
}
