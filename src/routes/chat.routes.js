import express from "express";
import {
  askedQuestion,
  clearHistory,
  indexRepo,
} from "../controllers/chat.controller.js";

const router = express.Router();

router.post("/index", indexRepo);
router.post("/ask", askedQuestion);
router.delete("/clear-history", clearHistory);

export default router;
