import Task from "../models/Task.js";
import {
  requireMemberStatusOnlyUpdate,
  requireTaskUpdatePermission
} from "../middleware/rbacMiddleware.js";

const allowedStatuses = ["To Do", "In Progress", "Done"];
const allowedPriorities = ["Low", "Medium", "High"];

function assertAssigneesAreProjectMembers(project, assignedTo = []) {
  const memberIds = new Set(project.members.map((member) => member.user._id.toString()));
  const invalidAssignee = assignedTo.find((userId) => !memberIds.has(userId));

  if (invalidAssignee) {
    throw new Error("Tasks can only be assigned to project members");
  }
}

function serializeTask(task) {
  return {
    id: task._id,
    project: task.project,
    title: task.title,
    description: task.description,
    dueDate: task.dueDate,
    priority: task.priority,
    status: task.status,
    assignedTo: task.assignedTo,
    createdBy: task.createdBy,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt
  };
}

export async function getProjectTasks(req, res, next) {
  try {
    const project = req.project;

    const tasks = await Task.find({ project: project._id })
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.json({ tasks: tasks.map(serializeTask) });
  } catch (error) {
    next(error);
  }
}

export async function createTask(req, res, next) {
  try {
    const { title, description = "", dueDate, priority = "Medium", assignedTo = [] } = req.body;
    const project = req.project;

    if (!title?.trim()) {
      res.status(400);
      throw new Error("Task title is required");
    }

    if (!dueDate) {
      res.status(400);
      throw new Error("Due date is required");
    }

    if (!allowedPriorities.includes(priority)) {
      res.status(400);
      throw new Error("Priority must be Low, Medium, or High");
    }

    assertAssigneesAreProjectMembers(project, assignedTo);

    const task = await Task.create({
      project: project._id,
      title: title.trim(),
      description: description.trim(),
      dueDate,
      priority,
      assignedTo,
      createdBy: req.user._id
    });

    const populatedTask = await task.populate([
      { path: "assignedTo", select: "name email" },
      { path: "createdBy", select: "name email" }
    ]);

    res.status(201).json({ task: serializeTask(populatedTask) });
  } catch (error) {
    if (error.message === "Tasks can only be assigned to project members") {
      res.status(400);
    }
    next(error);
  }
}

export async function updateTask(req, res, next) {
  try {
    const project = req.project;

    const task = await Task.findOne({
      _id: req.params.taskId,
      project: project._id
    });

    if (!task) {
      res.status(404);
      throw new Error("Task not found");
    }

    const { isAdmin } = requireTaskUpdatePermission(
      task,
      req.user._id,
      req.projectMembership
    );

    if (!isAdmin) {
      requireMemberStatusOnlyUpdate(req.body);
    }

    const { title, description, dueDate, priority, status, assignedTo } = req.body;

    if (title !== undefined) {
      if (!title?.trim()) {
        res.status(400);
        throw new Error("Task title is required");
      }
      task.title = title.trim();
    }

    if (description !== undefined) {
      task.description = description.trim();
    }

    if (dueDate !== undefined) {
      task.dueDate = dueDate;
    }

    if (priority !== undefined) {
      if (!allowedPriorities.includes(priority)) {
        res.status(400);
        throw new Error("Priority must be Low, Medium, or High");
      }
      task.priority = priority;
    }

    if (status !== undefined) {
      if (!allowedStatuses.includes(status)) {
        res.status(400);
        throw new Error("Status must be To Do, In Progress, or Done");
      }
      task.status = status;
    }

    if (assignedTo !== undefined) {
      assertAssigneesAreProjectMembers(project, assignedTo);
      task.assignedTo = assignedTo;
    }

    await task.save();

    const populatedTask = await task.populate([
      { path: "assignedTo", select: "name email" },
      { path: "createdBy", select: "name email" }
    ]);

    res.json({ task: serializeTask(populatedTask) });
  } catch (error) {
    if (error.message === "Tasks can only be assigned to project members") {
      res.status(400);
    }
    next(error);
  }
}

export async function deleteTask(req, res, next) {
  try {
    const project = req.project;

    const task = await Task.findOneAndDelete({
      _id: req.params.taskId,
      project: project._id
    });

    if (!task) {
      res.status(404);
      throw new Error("Task not found");
    }

    res.json({ message: "Task deleted" });
  } catch (error) {
    next(error);
  }
}
