import express from "express";
import { askedQuestion, indexRepo } from "../controllers/chat.controller.js";

const router = express.Router();

router.post("/index", indexRepo);
router.post("/ask", askedQuestion);

export default router;
