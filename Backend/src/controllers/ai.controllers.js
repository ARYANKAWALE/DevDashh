import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateInsights } from "../services/ai.service.js";

/** POST /api/v1/ai/insights */
export const createInsights = asyncHandler(async (req, res) => {
  const insights = await generateInsights(String(req.user._id), req.body?.stats ?? req.body);
  res.status(200).json(new ApiResponse(200, insights, "Insights generated"));
});
