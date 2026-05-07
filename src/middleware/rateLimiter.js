import rateLimit from "express-rate-limit";

const askingRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 15, // 20 requests per minute
  message: {
    error: "Too many requests",
    message: "Too many requests, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const indexRepoRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 requests per hour
  message: {
    error: "Too many requests",
    message: "Too many requests, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export { askingRateLimiter, indexRepoRateLimiter };
