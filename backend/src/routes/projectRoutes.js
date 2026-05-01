import express from "express";

import {
  addProjectMember,
  createProject,
  getMyProjects,
  getProjectById,
  removeProjectMember
} from "../controllers/projectController.js";
import { protect } from "../middleware/authMiddleware.js";
import {
  loadProjectMembership,
  requireProjectAdmin
} from "../middleware/rbacMiddleware.js";

const router = express.Router();

router.use(protect);

router.route("/").get(getMyProjects).post(createProject);
router.route("/:projectId").get(loadProjectMembership, getProjectById);
router
  .route("/:projectId/members")
  .post(loadProjectMembership, requireProjectAdmin, addProjectMember);
router
  .route("/:projectId/members/:memberId")
  .delete(loadProjectMembership, requireProjectAdmin, removeProjectMember);

export default router;
