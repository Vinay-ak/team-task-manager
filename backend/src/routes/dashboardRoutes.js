import express from "express";

import { getDashboardAnalytics } from "../controllers/dashboardController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/", getDashboardAnalytics);

export default router;
