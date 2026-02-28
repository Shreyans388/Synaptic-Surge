import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import oauthRoutes from "./routes/oauthRoutes.js";
import brandRoutes from "./routes/brandRoutes.js";
import devRoutes from "./routes/devRoutes.js";
import cookieParser from "cookie-parser";
const app = express();

const CLIENT_ORIGIN =
  process.env.CLIENT_ORIGIN ?? "http://localhost:3000";

const corsOptions: cors.CorsOptions = {
  origin: CLIENT_ORIGIN,
  credentials: true,
};

app.use(cors(corsOptions));
// Preflight requests (avoid "*" which can crash path-to-regexp in some setups)
app.options(/.*/, cors(corsOptions));

app.use(express.json());
app.use(cookieParser());

app.use('/api/auth',authRoutes);
app.use("/api/oauth", oauthRoutes);
app.use("/api/brands", brandRoutes);
app.use("/",devRoutes)
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "Backend running" });
});

export default app;  