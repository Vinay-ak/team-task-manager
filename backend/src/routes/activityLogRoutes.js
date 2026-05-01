import express from "express";

import { getProjectActivityLogs } from "../controllers/activityLogController.js";
import { protect } from "../middleware/authMiddleware.js";
import { loadProjectMembership } from "../middleware/rbacMiddleware.js";

const router = express.Router({ mergeParams: true });

router.use(protect);
router.use(loadProjectMembership);

router.get("/", getProjectActivityLogs);

export default router;
