import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js"
import oauthRoutes from "./routes/oauthRoutes.js"
import brandRoutes from "./routes/brandRoutes.js"
import devRoutes from "./routes/devRoutes.js"
import cookieParser from "cookie-parser"
const app = express();


app.use(cors());
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