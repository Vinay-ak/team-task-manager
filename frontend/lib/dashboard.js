import { authenticatedRequest } from "./auth";

export async function getDashboardAnalytics() {
  const data = await authenticatedRequest("/dashboard");
  return data.analytics;
}
