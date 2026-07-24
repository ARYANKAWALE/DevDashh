import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/** Normalizes an optional platform username: trimmed string or null. */
function cleanHandle(value, field) {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string") {
    throw new ApiError(400, `${field} must be a string username`);
  }
  const v = value.trim().replace(/^@/, "");
  if (v.length === 0) return null;
  if (v.length > 60 || /\s/.test(v)) {
    throw new ApiError(400, `"${v}" is not a valid ${field} username`);
  }
  return v;
}

function sessionPayload(user) {
  return {
    user: user.toPublic(),
    accessToken: user.generateAccessToken(),
  };
}

/* POST /api/v1/users/register */
export const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password, github, leetcode } = req.body ?? {};

  if (!username?.trim() || !email?.trim() || !password) {
    throw new ApiError(400, "Username, email and password are all required");
  }
  if (password.length < 6) {
    throw new ApiError(400, "Password must be at least 6 characters");
  }

  const existing = await User.findOne({
    $or: [{ email: email.toLowerCase().trim() }, { username: username.toLowerCase().trim() }],
  });
  if (existing) {
    const field = existing.email === email.toLowerCase().trim() ? "email" : "username";
    throw new ApiError(409, `An account with this ${field} already exists`);
  }

  const user = await User.create({
    username: username.toLowerCase().trim(),
    email: email.trim(),
    password,
    githubUsername: cleanHandle(github, "GitHub"),
    leetcodeUsername: cleanHandle(leetcode, "LeetCode"),
  });

  return res
    .status(201)
    .json(new ApiResponse(201, sessionPayload(user), "Account created"));
});

/* POST /api/v1/users/login */
export const loginUser = asyncHandler(async (req, res) => {
  const { identifier, username, email, password } = req.body ?? {};
  const id = (identifier ?? username ?? email ?? "").trim().toLowerCase();

  if (!id || !password) {
    throw new ApiError(400, "Username/email and password are required");
  }

  const user = await User.findOne({
    $or: [{ email: id }, { username: id }],
  }).select("+password");

  if (!user || !(await user.isPasswordCorrect(password))) {
    throw new ApiError(401, "Invalid credentials");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, sessionPayload(user), "Signed in"));
});

/* GET /api/v1/users/me  (auth) */
export const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, { user: req.user.toPublic() }, "Current user"));
});

/* PATCH /api/v1/users/connections  (auth)
   Body: { github?: string|null, leetcode?: string|null } */
export const updateConnections = asyncHandler(async (req, res) => {
  const body = req.body ?? {};

  if (!("github" in body) && !("leetcode" in body)) {
    throw new ApiError(400, "Provide github and/or leetcode to update");
  }

  if ("github" in body) {
    req.user.githubUsername = cleanHandle(body.github, "GitHub");
  }
  if ("leetcode" in body) {
    req.user.leetcodeUsername = cleanHandle(body.leetcode, "LeetCode");
  }

  await req.user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, { user: req.user.toPublic() }, "Connections saved"));
});
