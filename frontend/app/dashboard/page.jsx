"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getCurrentUser, logout } from "../../lib/auth";
import { getDashboardAnalytics } from "../../lib/dashboard";
import { createProject, getProjects } from "../../lib/projects";

const statusLabels = ["To Do", "In Progress", "Done"];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadUser() {
      try {
        const currentUser = await getCurrentUser();
        const [projectList, dashboardAnalytics] = await Promise.all([
          getProjects(),
          getDashboardAnalytics()
        ]);
        setUser(currentUser);
        setProjects(projectList);
        setAnalytics(dashboardAnalytics);
      } catch (err) {
        setError(err.message);
        logout();
        router.replace("/login");
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, [router]);

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleCreateProject(event) {
    event.preventDefault();
    setError("");
    setIsCreating(true);

    try {
      const project = await createProject(form);
      setProjects((current) => [project, ...current]);
      setAnalytics((current) =>
        current
          ? {
              ...current,
              totalProjects: current.totalProjects + 1,
              tasksPerUser: [
                ...current.tasksPerUser.filter((item) => item.userId !== user.id),
                {
                  userId: user.id,
                  name: user.name,
                  email: user.email,
                  total: 0,
                  todo: 0,
                  inProgress: 0,
                  done: 0
                }
              ].sort((a, b) => a.name.localeCompare(b.name))
            }
          : current
      );
      setForm({ name: "", description: "" });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsCreating(false);
    }
  }

  if (isLoading) {
    return <main className="center-shell">Loading your workspace...</main>;
  }

  if (error) {
    return <main className="center-shell text-red-600">{error}</main>;
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-6 py-8">
        <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Team Task Manager</p>
            <h1 className="mt-1 text-3xl font-semibold text-slate-950">
              Welcome, {user?.name}
            </h1>
          </div>
          <button className="btn-secondary w-full sm:w-auto" onClick={handleLogout}>
            Log out
          </button>
        </header>

        <div className="grid gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="space-y-8">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-medium text-slate-500">Projects</p>
                <p className="mt-3 text-3xl font-semibold text-slate-950">
                  {analytics?.totalProjects ?? 0}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-medium text-slate-500">Total tasks</p>
                <p className="mt-3 text-3xl font-semibold text-slate-950">
                  {analytics?.totalTasks ?? 0}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-medium text-slate-500">In progress</p>
                <p className="mt-3 text-3xl font-semibold text-slate-950">
                  {analytics?.tasksByStatus?.["In Progress"] ?? 0}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-medium text-slate-500">Overdue</p>
                <p className="mt-3 text-3xl font-semibold text-red-600">
                  {analytics?.overdueTasks?.length ?? 0}
                </p>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-950">Tasks by status</h2>
                <div className="mt-5 space-y-4">
                  {statusLabels.map((status) => {
                    const count = analytics?.tasksByStatus?.[status] ?? 0;
                    const total = analytics?.totalTasks || 0;
                    const percent = total ? Math.round((count / total) * 100) : 0;

                    return (
                      <div key={status}>
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-slate-700">{status}</span>
                          <span className="text-slate-500">{count}</span>
                        </div>
                        <div className="mt-2 h-2 rounded-full bg-slate-100">
                          <div
                            className="h-2 rounded-full bg-slate-950"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-950">Tasks per user</h2>
                <div className="mt-5 divide-y divide-slate-200">
                  {analytics?.tasksPerUser?.length ? (
                    analytics.tasksPerUser.map((item) => (
                      <div
                        className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                        key={item.userId}
                      >
                        <div>
                          <p className="font-medium text-slate-950">{item.name}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            {item.todo} to do, {item.inProgress} in progress, {item.done} done
                          </p>
                        </div>
                        <span className="rounded-md bg-slate-100 px-2 py-1 text-sm font-medium text-slate-700">
                          {item.total}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-600">No team workload yet.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-950">Overdue tasks</h2>
              <div className="mt-5 divide-y divide-slate-200">
                {analytics?.overdueTasks?.length ? (
                  analytics.overdueTasks.map((task) => (
                    <Link
                      className="block py-4 first:pt-0 last:pb-0"
                      href={`/projects/${task.project?.id}`}
                      key={task.id}
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="font-medium text-slate-950">{task.title}</p>
                          <p className="mt-1 text-sm text-slate-600">
                            {task.project?.name || "Project"} · {task.status} ·{" "}
                            {task.priority}
                          </p>
                        </div>
                        <span className="text-sm font-medium text-red-600">
                          Due {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-slate-600">No overdue tasks.</p>
                )}
              </div>
            </div>

            <div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">Projects</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Workspaces where you are a member.
                </p>
              </div>
            </div>

            {projects.length === 0 ? (
              <div className="mt-6 rounded-lg border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-600">
                No projects yet. Create one to invite your team.
              </div>
            ) : (
              <div className="mt-6 grid gap-4">
                {projects.map((project) => {
                  const myMembership = project.members.find(
                    (member) => member.user.id === user?.id || member.user._id === user?.id
                  );

                  return (
                    <Link
                      className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow"
                      href={`/projects/${project.id}`}
                      key={project.id}
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-950">
                            {project.name}
                          </h3>
                          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                            {project.description || "No description yet."}
                          </p>
                        </div>
                        <span className="inline-flex w-fit rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                          {myMembership?.role || "Member"}
                        </span>
                      </div>
                      <p className="mt-4 text-xs text-slate-500">
                        {project.members.length} member{project.members.length === 1 ? "" : "s"}
                      </p>
                    </Link>
                  );
                })}
              </div>
            )}
            </div>
          </section>

          <aside className="h-fit rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">Create project</h2>
            <form className="mt-5 space-y-4" onSubmit={handleCreateProject}>
              <label className="block">
                <span className="input-label">Name</span>
                <input
                  className="text-input"
                  name="name"
                  onChange={updateField}
                  required
                  type="text"
                  value={form.name}
                />
              </label>
              <label className="block">
                <span className="input-label">Description</span>
                <textarea
                  className="text-input min-h-28 resize-y"
                  name="description"
                  onChange={updateField}
                  value={form.description}
                />
              </label>
              {error ? (
                <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </div>
              ) : null}
              <button className="btn-primary w-full" disabled={isCreating} type="submit">
                {isCreating ? "Creating..." : "Create project"}
              </button>
            </form>
          </aside>
        </div>
      </section>
    </main>
  );
}
