import express from "express";
import cors from "cors";


const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "Backend running" });
});

export default app;