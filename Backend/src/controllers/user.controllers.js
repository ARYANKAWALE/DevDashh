import crypto from "crypto";
import { User } from "../models/user.models.js";
import { PasswordResetToken } from "../models/passwordResetToken.models.js";
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

/* POST /api/v1/users/forgotpassword */
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body ?? {};
  if (!email?.trim()) {
    throw new ApiError(400, "Email is required");
  }

  // Always respond 200 so we don't leak whether an email is registered.
  const user = await User.findOne({ email: email.trim().toLowerCase() });
  if (!user) {
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "If that email exists, a reset link has been sent"));
  }

  // Generate a random token, store only its hash.
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

  // Replace any existing token for this user (one active token at a time).
  await PasswordResetToken.deleteMany({ userId: user._id });
  await PasswordResetToken.create({ userId: user._id, tokenHash });

  // Build the reset URL pointing at the frontend.
  const clientOrigin =
    process.env.CORS_ORIGIN?.replace(/\/$/, "") || "http://localhost:5173";
  const resetUrl = `${clientOrigin}/reset-password?token=${rawToken}`;

  

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { resetUrl },
        "Reset link generated (no mailer configured — link returned for development)"
      )
    );
});

/* POST /api/v1/users/resetpassword */
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body ?? {};

  if (!token || !newPassword) {
    throw new ApiError(400, "Token and new password are required");
  }
  if (newPassword.length < 6) {
    throw new ApiError(400, "Password must be at least 6 characters");
  }

  // Hash the incoming raw token to look up the stored record.
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const record = await PasswordResetToken.findOne({ tokenHash });

  if (!record) {
    throw new ApiError(400, "Reset link is invalid or has expired");
  }

  const user = await User.findById(record.userId).select("+password");
  if (!user) {
    throw new ApiError(400, "Reset link is invalid or has expired");
  }

  const isSamePassword = await user.isPasswordCorrect(newPassword)

  if(isSamePassword){
    throw new ApiError(400, "New password cannot be same as old password");
  }


  user.password = newPassword;
  await user.save();

  // Invalidate the token so it can't be reused.
  await PasswordResetToken.deleteOne({ _id: record._id });

  return res
    .status(200)
    .json(new ApiResponse(200, sessionPayload(user), "Password updated — you are now signed in"));
});
