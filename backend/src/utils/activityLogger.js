import ActivityLog from "../models/ActivityLog.js";

export async function logActivity({
  project,
  user,
  action,
  referenceId,
  referenceType,
  metadata = {}
}) {
  await ActivityLog.create({
    project,
    user,
    action,
    referenceId,
    referenceType,
    metadata,
    timestamp: new Date()
  });
}
