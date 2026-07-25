import { ApiError } from "../utils/ApiError.js";

const MODEL_FALLBACKS = [
  process.env.GEMINI_MODEL,
  "gemini-2.5-flash",
  "gemini-3.6-flash",
  "gemini-3.1-flash-lite",
].filter(Boolean);

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const MIN_INTERVAL_MS = 30_000;

const insightCache = new Map();
const lastRequestAt = new Map();

function cacheKey(userId, stats) {
  return `${userId}:${JSON.stringify(stats)}`;
}

function parseGeminiJson(text) {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = fenced ? fenced[1].trim() : trimmed;
  return JSON.parse(raw);
}

function buildPrompt(stats) {
  return `You are DevDash, a concise developer coach. Analyze this developer's GitHub and LeetCode activity and respond ONLY with valid JSON matching this shape:
{
  "summary": "2-3 sentences, encouraging but honest",
  "highlights": ["3-4 short bullet insights about patterns or wins"],
  "recommendations": ["2-3 actionable next steps"]
}

Rules:
- Be specific using the numbers provided.
- If only one platform is connected, focus on that platform.
- Keep each bullet under 120 characters.
- Do not invent data that is not in the payload.

Developer stats:
${JSON.stringify(stats, null, 2)}`;
}

export async function generateInsights(userId, stats) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new ApiError(503, "AI insights are not configured on the server.");
  }

  if (!stats || typeof stats !== "object") {
    throw new ApiError(400, "Stats payload is required.");
  }

  const key = cacheKey(userId, stats);
  const cached = insightCache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return { ...cached.data, cached: true };
  }

  const lastAt = lastRequestAt.get(userId) ?? 0;
  if (Date.now() - lastAt < MIN_INTERVAL_MS) {
    throw new ApiError(429, "Please wait a moment before generating new insights.");
  }

  let payload = null;
  let lastError = "AI service unavailable. Try again later.";

  for (const model of [...new Set(MODEL_FALLBACKS)]) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    let res;
    try {
      res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: buildPrompt(stats) }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
            responseMimeType: "application/json",
          },
        }),
      });
    } catch {
      throw new ApiError(502, "Could not reach the AI service. Try again shortly.");
    }

    payload = await res.json().catch(() => null);

    if (res.ok) break;

    lastError =
      payload?.error?.message ?? `AI service returned ${res.status}. Try again later.`;

    // try next model when this one doesn't exist or isn't supported
    if (res.status === 404 || /not found|not supported/i.test(lastError)) continue;

    throw new ApiError(res.status === 429 ? 429 : 502, lastError);
  }

  if (!payload?.candidates?.[0]?.content?.parts?.[0]?.text) {
    throw new ApiError(502, lastError);
  }

  const text = payload.candidates[0].content.parts[0].text;

  let parsed;
  try {
    parsed = parseGeminiJson(text);
  } catch {
    throw new ApiError(502, "AI response could not be parsed. Try again.");
  }

  const result = {
    summary: String(parsed.summary ?? "").trim(),
    highlights: Array.isArray(parsed.highlights)
      ? parsed.highlights.map((h) => String(h).trim()).filter(Boolean).slice(0, 4)
      : [],
    recommendations: Array.isArray(parsed.recommendations)
      ? parsed.recommendations.map((r) => String(r).trim()).filter(Boolean).slice(0, 3)
      : [],
    cached: false,
  };

  if (!result.summary) {
    throw new ApiError(502, "AI response was incomplete. Try again.");
  }

  lastRequestAt.set(userId, Date.now());
  insightCache.set(key, { data: result, expiresAt: Date.now() + CACHE_TTL_MS });

  return result;
}
