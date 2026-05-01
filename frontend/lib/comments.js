import { authenticatedRequest } from "./auth";

export async function getComments(projectId) {
  const data = await authenticatedRequest(`/projects/${projectId}/comments`);
  return data.comments;
}

export async function addComment(projectId, taskId, message) {
  const data = await authenticatedRequest(`/projects/${projectId}/comments/tasks/${taskId}`, {
    method: "POST",
    body: JSON.stringify({ message })
  });

  return data.comment;
}
