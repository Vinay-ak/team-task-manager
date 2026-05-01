import express from "express";

import {
  createTask,
  deleteTask,
  getProjectTasks,
  updateTask
} from "../controllers/taskController.js";
import { protect } from "../middleware/authMiddleware.js";
import {
  loadProjectMembership,
  requireProjectAdmin
} from "../middleware/rbacMiddleware.js";

const router = express.Router({ mergeParams: true });

router.use(protect);
router.use(loadProjectMembership);

router.route("/").get(getProjectTasks).post(requireProjectAdmin, createTask);
router.route("/:taskId").patch(updateTask).delete(requireProjectAdmin, deleteTask);

export default router;
