import express from "express";

import {
  addProjectMember,
  createProject,
  getMyProjects,
  getProjectById,
  removeProjectMember
} from "../controllers/projectController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.route("/").get(getMyProjects).post(createProject);
router.route("/:projectId").get(getProjectById);
router.route("/:projectId/members").post(addProjectMember);
router.route("/:projectId/members/:memberId").delete(removeProjectMember);

export default router;
