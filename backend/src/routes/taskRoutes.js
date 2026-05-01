import express from "express";

import {
  createTask,
  deleteTask,
  getProjectTasks,
  updateTask
} from "../controllers/taskController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router({ mergeParams: true });

router.use(protect);

router.route("/").get(getProjectTasks).post(createTask);
router.route("/:taskId").patch(updateTask).delete(deleteTask);

export default router;
