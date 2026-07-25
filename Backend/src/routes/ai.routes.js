import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { createInsights } from "../controllers/ai.controllers.js";

const router = Router();

router.post("/insights", verifyJWT, createInsights);

export default router;
