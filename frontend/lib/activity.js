import { authenticatedRequest } from "./auth";

export async function getActivityLogs(projectId) {
  const data = await authenticatedRequest(`/projects/${projectId}/activity`);
  return data.logs;
}
