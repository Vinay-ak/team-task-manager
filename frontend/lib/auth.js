import { apiRequest } from "./api";

const TOKEN_KEY = "team-task-manager-token";

export function getToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(TOKEN_KEY);
}

export function setSession(token) {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function logout() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(TOKEN_KEY);
  }
}

export async function signup(payload) {
  const data = await apiRequest("/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload)
  });

  setSession(data.token);
  return data.user;
}

export async function login(payload) {
  const data = await apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload)
  });

  setSession(data.token);
  return data.user;
}

export async function getCurrentUser() {
  const token = getToken();

  if (!token) {
    throw new Error("Please log in to continue");
  }

  const data = await apiRequest("/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return data.user;
}
