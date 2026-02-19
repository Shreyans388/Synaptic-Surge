import express from "express";
import { linkedinAuth, linkedinCallback } from "../controllers/oauthController.js";
import { protectRoute } from "../middlewares/authMiddlewares.js";


const router = express.Router();

router.get("/linkedin", protectRoute, linkedinAuth);
router.get("/linkedin/callback", linkedinCallback);

export default router;
