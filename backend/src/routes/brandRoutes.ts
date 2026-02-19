import express from "express";
import {
  createBrand,
  disconnectPlatform,
} from "../controllers/brandController.js";
import { protectRoute } from "../middlewares/authMiddlewares.js";


const router = express.Router();

router.post("/", protectRoute, createBrand);
router.delete("/:brandId/disconnect/:provider", protectRoute, disconnectPlatform);

export default router;
