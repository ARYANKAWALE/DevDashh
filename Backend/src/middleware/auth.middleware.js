import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/** Verifies the Bearer token and attaches the user document to req.user. */
export const verifyJWT = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    throw new ApiError(401, "Authentication required. Please sign in.");
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (err) {
    throw new ApiError(
      401,
      err.name === "TokenExpiredError"
        ? "Session expired. Please sign in again."
        : "Invalid session token. Please sign in again."
    );
  }

  const user = await User.findById(payload._id);
  if (!user) {
    throw new ApiError(401, "This account no longer exists.");
  }

  req.user = user;
  next();
});
