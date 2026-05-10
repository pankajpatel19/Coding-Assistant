import axios from "axios";

// In dev, Vite proxy forwards /index /ask /clear-history → localhost:3000
// In production, set VITE_API_URL to your backend URL
const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "",
  headers: { "Content-Type": "application/json" },
});

/** Called once by useSession to attach the session ID to every request */
export const setSessionHeader = (id) => {
  http.defaults.headers.common["x-session-id"] = id;
};

export const ragApi = {
  indexRepo: ({ repoUrl, force = false }) =>
    http.post("/index", { repoUrl, force }).then((r) => r.data),

  askQuestion: ({ question, mode = "semantic" }) =>
    http.post("/ask", { question, mode }).then((r) => r.data),

  clearHistory: () =>
    http.delete("/clear-history").then((r) => r.data),
};
