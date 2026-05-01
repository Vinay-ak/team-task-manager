import Project from "../models/Project.js";

export async function loadProjectMembership(req, res, next) {
  try {
    const project = await Project.findOne({
      _id: req.params.projectId,
      "members.user": req.user._id
    }).populate("members.user", "name email");

    if (!project) {
      res.status(404);
      throw new Error("Project not found");
    }

    const membership = project.members.find(
      (member) => member.user._id.toString() === req.user._id.toString()
    );

    req.project = project;
    req.projectMembership = membership;
    next();
  } catch (error) {
    next(error);
  }
}

export function requireProjectAdmin(req, res, next) {
  if (req.projectMembership?.role !== "Admin") {
    res.status(403);
    next(new Error("Project admin access required"));
    return;
  }

  next();
}

export function requireTaskUpdatePermission(task, userId, membership) {
  const isAdmin = membership?.role === "Admin";
  const isAssignee = task.assignedTo?.some(
    (assignee) => assignee.toString() === userId.toString()
  );

  if (!isAdmin && !isAssignee) {
    const error = new Error("You can only update tasks assigned to you");
    error.statusCode = 403;
    throw error;
  }

  return { isAdmin, isAssignee };
}

export function requireMemberStatusOnlyUpdate(body) {
  const requestedFields = Object.keys(body);
  const canOnlyUpdateStatus =
    requestedFields.length === 1 && requestedFields[0] === "status";

  if (!canOnlyUpdateStatus) {
    const error = new Error("Members can only update task status");
    error.statusCode = 403;
    throw error;
  }
}
