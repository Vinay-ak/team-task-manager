import { authenticatedRequest } from "./auth";

export async function getTasks(projectId) {
  const data = await authenticatedRequest(`/projects/${projectId}/tasks`);
  return data.tasks;
}

export async function createTask(projectId, payload) {
  const data = await authenticatedRequest(`/projects/${projectId}/tasks`, {
    method: "POST",
    body: JSON.stringify(payload)
  });

  return data.task;
}

export async function updateTask(projectId, taskId, payload) {
  const data = await authenticatedRequest(`/projects/${projectId}/tasks/${taskId}`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });

  return data.task;
}

export async function deleteTask(projectId, taskId) {
  return authenticatedRequest(`/projects/${projectId}/tasks/${taskId}`, {
    method: "DELETE"
  });
}
