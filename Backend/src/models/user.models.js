import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const USERNAME_RE = /^[a-z0-9_-]{3,30}$/;

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [USERNAME_RE, "Username must be 3-30 chars: letters, numbers, _ or -"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\s*[\w\-.]+@([\w-]+\.)+[\w-]{2,10}\s*$/,
        "Please provide a valid email address",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minLength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    /** Public GitHub handle — one profile per account. */
    githubUsername: { type: String, trim: true, default: null },
    /** Public LeetCode handle — one profile per account. */
    leetcodeUsername: { type: String, trim: true, default: null },
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.isPasswordCorrect = function (password) {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    { _id: this._id, username: this.username, email: this.email },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "5d" }
  );
};

/** Safe API shape — keeps `connections` for the frontend. */
userSchema.methods.toPublic = function () {
  return {
    _id: this._id,
    username: this.username,
    email: this.email,
    connections: {
      github: this.githubUsername ?? null,
      leetcode: this.leetcodeUsername ?? null,
    },
    createdAt: this.createdAt,
  };
};

export const User = mongoose.model("User", userSchema);
