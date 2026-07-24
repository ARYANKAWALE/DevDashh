import { Router } from "express";
import {
  registerUser,
  loginUser,
  getCurrentUser,
  updateConnections,
} from "../controllers/user.controllers.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", verifyJWT, getCurrentUser);
router.patch("/connections", verifyJWT, updateConnections);

export default router;
