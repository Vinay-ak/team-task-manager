import express from "express";

import {
  addTaskComment,
  getProjectComments
} from "../controllers/commentController.js";
import { protect } from "../middleware/authMiddleware.js";
import { loadProjectMembership } from "../middleware/rbacMiddleware.js";

const router = express.Router({ mergeParams: true });

router.use(protect);
router.use(loadProjectMembership);

router.get("/", getProjectComments);
router.post("/tasks/:taskId", addTaskComment);

export default router;
