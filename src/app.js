import express from "express";
import chatRoutes from "./routes/chat.routes.js";
import cors from "cors";
import { applyHelmet, applyHPP, sanitizeInput, globalRateLimiter } from "./middleware/security.js";

const app = express();

// Trust proxy for rate limiter to get correct IP behind reverse proxies (Render, Vercel, etc.)
app.set("trust proxy", 1);

// Security Middleware
app.use(applyHelmet);
app.use(globalRateLimiter);

// Body parser with size limit to prevent large payload DoS
app.use(express.json({ limit: "50kb" }));

// Prevent HTTP Parameter Pollution
app.use(applyHPP);

// Custom NoSQL/Input Sanitization
app.use(sanitizeInput);

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);

// Routes
app.use("/api/chat", chatRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({ message: "CodeBase AI running!" });
});

export default app;
