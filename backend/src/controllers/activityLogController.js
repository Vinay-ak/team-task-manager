import ActivityLog from "../models/ActivityLog.js";

function serializeLog(log) {
  return {
    id: log._id,
    project: log.project,
    user: log.user,
    action: log.action,
    referenceId: log.referenceId,
    referenceType: log.referenceType,
    metadata: log.metadata,
    timestamp: log.timestamp,
    createdAt: log.createdAt
  };
}

export async function getProjectActivityLogs(req, res, next) {
  try {
    const logs = await ActivityLog.find({ project: req.project._id })
      .populate("user", "name email")
      .sort({ timestamp: -1 })
      .limit(50);

    res.json({ logs: logs.map(serializeLog) });
  } catch (error) {
    next(error);
  }
}
