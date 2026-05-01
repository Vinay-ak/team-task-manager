"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getCurrentUser, logout } from "../../lib/auth";
import { createProject, getProjects } from "../../lib/projects";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({ name: "", description: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadUser() {
      try {
        const currentUser = await getCurrentUser();
        const projectList = await getProjects();
        setUser(currentUser);
        setProjects(projectList);
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
          <section>
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
