import express from "express";
import {
  askedQuestion,
  clearHistory,
  indexRepo,
} from "../controllers/chat.controller.js";
import {
  askingRateLimiter,
  indexRepoRateLimiter,
} from "../middleware/rateLimiter.js";

const router = express.Router();

router.post("/index", indexRepoRateLimiter, indexRepo);
router.post("/ask", askingRateLimiter, askedQuestion);
router.delete("/clear-history", clearHistory);

export default router;
