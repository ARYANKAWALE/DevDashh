import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { DBConnnet } from "./src/db/index.js";
import userRouter from "./src/routes/user.routes.js";
import { ApiError } from "./src/utils/ApiError.js";

if (!process.env.ACCESS_TOKEN_SECRET) {
  // dev fallback so the API still runs; never rely on this in production
  process.env.ACCESS_TOKEN_SECRET = "devdash-insecure-dev-secret";
  console.warn(
    "[warn] ACCESS_TOKEN_SECRET is not set in .env — using an insecure dev fallback."
  );
}

if (!process.env.ACCESS_TOKEN_EXPIRY) {
  process.env.ACCESS_TOKEN_EXPIRY = "5d";
}

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") ?? "http://localhost:5173",
  })
);
app.use(express.json({ limit: "32kb" }));

app.get("/", (_req, res) => {
  res.json({ success: true, message: "DevDash API is running" });
});

app.use("/api/v1/users", userRouter);

// unknown route
app.use((req, _res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
});

// central error handler — converts every failure into a consistent JSON shape
app.use((err, _req, res, _next) => {
  let status = 500;
  let message = "Internal server error";
  let errors = [];

  if (err instanceof ApiError) {
    status = err.statusCode;
    message = err.message;
    errors = err.errors;
  } else if (err.name === "ValidationError") {
    // mongoose schema validation
    status = 400;
    errors = Object.values(err.errors ?? {}).map((e) => e.message);
    message = errors[0] ?? "Validation failed";
  } else if (err.code === 11000) {
    // mongo duplicate key
    status = 409;
    const field = Object.keys(err.keyPattern ?? {})[0] ?? "value";
    message = `An account with this ${field} already exists`;
  } else if (err.type === "entity.parse.failed") {
    status = 400;
    message = "Request body is not valid JSON";
  }

  if (status >= 500) console.error("[error]", err);

  res.status(status).json({ success: false, message, errors });
});

const PORT = process.env.PORT || 4000;

DBConnnet()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to MongoDB — server not started.", error.message);
    process.exit(1);
  });
