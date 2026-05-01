import { authenticatedRequest } from "./auth";

export async function getProjects() {
  const data = await authenticatedRequest("/projects");
  return data.projects;
}

export async function getProject(projectId) {
  const data = await authenticatedRequest(`/projects/${projectId}`);
  return data.project;
}

export async function createProject(payload) {
  const data = await authenticatedRequest("/projects", {
    method: "POST",
    body: JSON.stringify(payload)
  });

  return data.project;
}

export async function addProjectMember(projectId, payload) {
  const data = await authenticatedRequest(`/projects/${projectId}/members`, {
    method: "POST",
    body: JSON.stringify(payload)
  });

  return data.project;
}

export async function removeProjectMember(projectId, memberId) {
  const data = await authenticatedRequest(`/projects/${projectId}/members/${memberId}`, {
    method: "DELETE"
  });

  return data.project;
}
