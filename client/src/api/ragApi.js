import axios from "axios";

// Base URL for the API. In dev, Vite proxy handles /api/chat → http://localhost:3000/api/chat
const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "",
  headers: { "Content-Type": "application/json" },
});

/** Attach session ID to every request */
export const setSessionHeader = (id) => {
  http.defaults.headers.common["x-session-id"] = id;
};

export const ragApi = {
  // Endpoints match backend mounting at /api/chat
  indexRepo: ({ repoUrl, force = false }) =>
    http.post("/api/chat/index", { repoUrl, force }).then((r) => r.data),

  askQuestion: ({ question, mode = "semantic" }) =>
    http.post("/api/chat/ask", { question, mode }).then((r) => r.data),

  clearHistory: () =>
    http.delete("/api/chat/clear-history").then((r) => r.data),
};
