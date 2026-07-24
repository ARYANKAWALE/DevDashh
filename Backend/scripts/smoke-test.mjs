/**
 * API smoke test — exercises every endpoint incl. error paths.
 * Prints only PASS/FAIL + status codes (no tokens, no user data),
 * and removes the test user from the database when done.
 *
 * Usage: node scripts/smoke-test.mjs   (backend must be running)
 */
import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import { DB_NAME } from "../src/utils/constants.js";

const BASE = `http://localhost:${process.env.PORT || 4000}`;
const uname = `cursor_smoke_${Date.now().toString(36)}`;
const email = `${uname}@example.com`;
const pass = "smoke-test-pw-1";

let token = null;
const results = [];

async function call(path, { method = "GET", body, auth = false } = {}) {
  const headers = {};
  if (body) headers["Content-Type"] = "application/json";
  if (auth && token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  let json = null;
  try {
    json = await res.json();
  } catch {
    /* ignore */
  }
  return { status: res.status, json };
}

function check(name, actual, expected, extra = true) {
  const ok = actual === expected && extra;
  results.push({ name, ok, detail: `status ${actual} (want ${expected})` });
}

try {
  // happy paths
  const reg = await call("/api/v1/users/register", {
    method: "POST",
    body: { username: uname, email, password: pass, github: "octocat", leetcode: null },
  });
  token = reg.json?.data?.accessToken ?? null;
  check(
    "register",
    reg.status,
    201,
    !!token && reg.json?.data?.user?.connections?.github === "octocat"
  );

  const login = await call("/api/v1/users/login", {
    method: "POST",
    body: { identifier: uname, password: pass },
  });
  token = login.json?.data?.accessToken ?? token;
  check("login", login.status, 200, !!login.json?.data?.accessToken);

  const me = await call("/api/v1/users/me", { auth: true });
  check("me (auth)", me.status, 200, me.json?.data?.user?.username === uname);

  const patch = await call("/api/v1/users/connections", {
    method: "PATCH",
    auth: true,
    body: { github: null, leetcode: "neal_wu" },
  });
  check(
    "patch connections",
    patch.status,
    200,
    patch.json?.data?.user?.connections?.leetcode === "neal_wu" &&
      patch.json?.data?.user?.connections?.github === null
  );

  // error paths
  const dup = await call("/api/v1/users/register", {
    method: "POST",
    body: { username: uname, email, password: pass },
  });
  check("duplicate register -> 409", dup.status, 409);

  const badpw = await call("/api/v1/users/login", {
    method: "POST",
    body: { identifier: uname, password: "wrong-password" },
  });
  check("wrong password -> 401", badpw.status, 401);

  const noAuth = await call("/api/v1/users/me");
  check("me without token -> 401", noAuth.status, 401);

  const missing = await call("/api/v1/users/register", {
    method: "POST",
    body: { username: "x" },
  });
  check("register missing fields -> 400", missing.status, 400);

  const badPatch = await call("/api/v1/users/connections", {
    method: "PATCH",
    auth: true,
    body: { github: 12345 },
  });
  check("patch non-string handle -> 400", badPatch.status, 400);

  const notFound = await call("/api/v1/nope");
  check("unknown route -> 404", notFound.status, 404);
} finally {
  // cleanup: remove the throwaway test user
  try {
    const base = (process.env.MONGO_URI ?? "").trim().replace(/\/+$/, "");
    await mongoose.connect(`${base}/${DB_NAME}`);
    const { deletedCount } = await mongoose.connection
      .collection("users")
      .deleteMany({ username: uname });
    console.log(`cleanup: removed ${deletedCount} test user(s)`);
    await mongoose.disconnect();
  } catch (e) {
    console.log("cleanup failed:", e.message);
  }
}

let failed = 0;
for (const r of results) {
  if (!r.ok) failed++;
  console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.name.padEnd(32)} ${r.detail}`);
}
console.log(failed === 0 ? "\nALL CHECKS PASSED" : `\n${failed} CHECK(S) FAILED`);
process.exit(failed === 0 ? 0 : 1);
