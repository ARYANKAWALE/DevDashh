/** Production backend (Render). Override locally with VITE_API_URL in Frontend/.env */
export const PRODUCTION_API_URL = "https://devdashh.onrender.com";

export const API_BASE =
  import.meta.env.VITE_API_URL ??
  (import.meta.env.DEV ? "http://localhost:4000" : PRODUCTION_API_URL);
