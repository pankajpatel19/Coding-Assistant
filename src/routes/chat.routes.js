import express from "express";
import {
  askedQuestion,
  clearHistory,
  indexRepo,
  getHistory,
} from "../controllers/chat.controller.js";
import {
  askingRateLimiter,
  indexRepoRateLimiter,
} from "../middleware/rateLimiter.js";

const router = express.Router();

router.post("/index", indexRepoRateLimiter, indexRepo);
router.post("/ask", askingRateLimiter, askedQuestion);
router.delete("/clear-history", clearHistory);
router.get("/history", getHistory);

export default router;
