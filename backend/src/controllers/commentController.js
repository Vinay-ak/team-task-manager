import Comment from "../models/Comment.js";
import Task from "../models/Task.js";
import { logActivity } from "../utils/activityLogger.js";

function serializeComment(comment) {
  return {
    id: comment._id,
    project: comment.project,
    task: comment.task,
    user: comment.user,
    message: comment.message,
    timestamp: comment.timestamp,
    createdAt: comment.createdAt
  };
}

export async function getProjectComments(req, res, next) {
  try {
    const comments = await Comment.find({ project: req.project._id })
      .populate("user", "name email")
      .sort({ timestamp: 1 });

    res.json({ comments: comments.map(serializeComment) });
  } catch (error) {
    next(error);
  }
}

export async function addTaskComment(req, res, next) {
  try {
    const { message } = req.body;

    if (!message?.trim()) {
      res.status(400);
      throw new Error("Comment message is required");
    }

    const task = await Task.findOne({
      _id: req.params.taskId,
      project: req.project._id
    });

    if (!task) {
      res.status(404);
      throw new Error("Task not found");
    }

    const comment = await Comment.create({
      project: req.project._id,
      task: task._id,
      user: req.user._id,
      message: message.trim(),
      timestamp: new Date()
    });

    await logActivity({
      project: req.project._id,
      user: req.user._id,
      action: "comment_added",
      referenceId: task._id,
      referenceType: "Task",
      metadata: {
        title: task.title
      }
    });

    const populatedComment = await comment.populate("user", "name email");

    res.status(201).json({ comment: serializeComment(populatedComment) });
  } catch (error) {
    next(error);
  }
}
