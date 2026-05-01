import Task from "../models/Task.js";
import {
  requireMemberStatusOnlyUpdate,
  requireTaskUpdatePermission
} from "../middleware/rbacMiddleware.js";
import { logActivity } from "../utils/activityLogger.js";

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

function stringifyIds(ids = []) {
  return ids.map((id) => id.toString()).sort();
}

function arraysEqual(first, second) {
  return first.length === second.length && first.every((value, index) => value === second[index]);
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

    await logActivity({
      project: project._id,
      user: req.user._id,
      action: "task_created",
      referenceId: task._id,
      referenceType: "Task",
      metadata: {
        title: task.title,
        priority: task.priority,
        status: task.status,
        assignedTo
      }
    });

    if (assignedTo.length > 0) {
      await logActivity({
        project: project._id,
        user: req.user._id,
        action: "task_assigned",
        referenceId: task._id,
        referenceType: "Task",
        metadata: {
          title: task.title,
          assignedTo
        }
      });
    }

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
    const originalAssignedTo = stringifyIds(task.assignedTo);
    const changes = {};

    if (title !== undefined) {
      if (!title?.trim()) {
        res.status(400);
        throw new Error("Task title is required");
      }
      if (task.title !== title.trim()) {
        changes.title = { from: task.title, to: title.trim() };
      }
      task.title = title.trim();
    }

    if (description !== undefined) {
      if (task.description !== description.trim()) {
        changes.description = { from: task.description, to: description.trim() };
      }
      task.description = description.trim();
    }

    if (dueDate !== undefined) {
      const currentDueDate = task.dueDate.toISOString();
      const nextDueDate = new Date(dueDate).toISOString();
      if (currentDueDate !== nextDueDate) {
        changes.dueDate = { from: currentDueDate, to: nextDueDate };
      }
      task.dueDate = dueDate;
    }

    if (priority !== undefined) {
      if (!allowedPriorities.includes(priority)) {
        res.status(400);
        throw new Error("Priority must be Low, Medium, or High");
      }
      if (task.priority !== priority) {
        changes.priority = { from: task.priority, to: priority };
      }
      task.priority = priority;
    }

    if (status !== undefined) {
      if (!allowedStatuses.includes(status)) {
        res.status(400);
        throw new Error("Status must be To Do, In Progress, or Done");
      }
      if (task.status !== status) {
        changes.status = { from: task.status, to: status };
      }
      task.status = status;
    }

    if (assignedTo !== undefined) {
      assertAssigneesAreProjectMembers(project, assignedTo);
      const nextAssignedTo = stringifyIds(assignedTo);
      if (!arraysEqual(originalAssignedTo, nextAssignedTo)) {
        changes.assignedTo = { from: originalAssignedTo, to: nextAssignedTo };
      }
      task.assignedTo = assignedTo;
    }

    await task.save();

    const populatedTask = await task.populate([
      { path: "assignedTo", select: "name email" },
      { path: "createdBy", select: "name email" }
    ]);

    if (Object.keys(changes).length > 0) {
      await logActivity({
        project: project._id,
        user: req.user._id,
        action: "task_updated",
        referenceId: task._id,
        referenceType: "Task",
        metadata: {
          title: task.title,
          changes
        }
      });
    }

    if (changes.assignedTo) {
      await logActivity({
        project: project._id,
        user: req.user._id,
        action: "task_assigned",
        referenceId: task._id,
        referenceType: "Task",
        metadata: {
          title: task.title,
          assignedTo: changes.assignedTo.to
        }
      });
    }

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

    await logActivity({
      project: project._id,
      user: req.user._id,
      action: "task_deleted",
      referenceId: task._id,
      referenceType: "Task",
      metadata: {
        title: task.title
      }
    });

    res.json({ message: "Task deleted" });
  } catch (error) {
    next(error);
  }
}
