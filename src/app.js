import express from "express";
import chatRoutes from "./routes/chat.routes.js";

const app = express();
app.use(express.json());

// Routes
app.use("/api/chat", chatRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({ message: "CodeBase AI running!" });
});

export default app;
