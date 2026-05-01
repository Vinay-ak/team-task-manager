"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { getCurrentUser, logout } from "../../../lib/auth";
import {
  addProjectMember,
  getProject,
  removeProjectMember
} from "../../../lib/projects";

export default function ProjectDetailsPage() {
  const { projectId } = useParams();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [project, setProject] = useState(null);
  const [memberForm, setMemberForm] = useState({ email: "", role: "Member" });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const currentMembership = useMemo(() => {
    return project?.members.find(
      (member) => member.user.id === user?.id || member.user._id === user?.id
    );
  }, [project, user]);

  const isAdmin = currentMembership?.role === "Admin";

  useEffect(() => {
    async function loadProject() {
      try {
        const [currentUser, currentProject] = await Promise.all([
          getCurrentUser(),
          getProject(projectId)
        ]);
        setUser(currentUser);
        setProject(currentProject);
      } catch (err) {
        setError(err.message);
        if (err.message.toLowerCase().includes("log in")) {
          logout();
          router.replace("/login");
        }
      } finally {
        setIsLoading(false);
      }
    }

    if (projectId) {
      loadProject();
    }
  }, [projectId, router]);

  function updateMemberField(event) {
    setMemberForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleAddMember(event) {
    event.preventDefault();
    setError("");
    setIsSaving(true);

    try {
      const updatedProject = await addProjectMember(projectId, memberForm);
      setProject(updatedProject);
      setMemberForm({ email: "", role: "Member" });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleRemoveMember(memberId) {
    setError("");
    setIsSaving(true);

    try {
      const updatedProject = await removeProjectMember(projectId, memberId);
      setProject(updatedProject);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <main className="center-shell">Loading project...</main>;
  }

  if (!project) {
    return (
      <main className="center-shell">
        <div>
          <p className="text-red-600">{error || "Project not found"}</p>
          <Link className="mt-4 inline-flex font-medium text-slate-950" href="/dashboard">
            Back to dashboard
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto w-full max-w-5xl px-6 py-8">
        <header className="border-b border-slate-200 pb-6">
          <Link className="text-sm font-medium text-slate-600" href="/dashboard">
            Back to dashboard
          </Link>
          <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-slate-950">{project.name}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                {project.description || "No description yet."}
              </p>
            </div>
            <span className="inline-flex w-fit rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
              {currentMembership?.role || "Member"}
            </span>
          </div>
        </header>

        <div className="grid gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">Members</h2>
            <div className="mt-5 divide-y divide-slate-200">
              {project.members.map((member) => {
                const memberId = member.user.id || member.user._id;
                const isCreator = project.createdBy === memberId || project.createdBy?._id === memberId;

                return (
                  <div
                    className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                    key={memberId}
                  >
                    <div>
                      <p className="font-medium text-slate-950">{member.user.name}</p>
                      <p className="mt-1 text-sm text-slate-600">{member.user.email}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                        {member.role}
                      </span>
                      {isAdmin && memberId !== user?.id && !isCreator ? (
                        <button
                          className="text-sm font-medium text-red-600 disabled:text-slate-400"
                          disabled={isSaving}
                          onClick={() => handleRemoveMember(memberId)}
                          type="button"
                        >
                          Remove
                        </button>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <aside className="h-fit rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">Add member</h2>
            {isAdmin ? (
              <form className="mt-5 space-y-4" onSubmit={handleAddMember}>
                <label className="block">
                  <span className="input-label">Email</span>
                  <input
                    className="text-input"
                    name="email"
                    onChange={updateMemberField}
                    required
                    type="email"
                    value={memberForm.email}
                  />
                </label>
                <label className="block">
                  <span className="input-label">Role</span>
                  <select
                    className="text-input"
                    name="role"
                    onChange={updateMemberField}
                    value={memberForm.role}
                  >
                    <option value="Member">Member</option>
                    <option value="Admin">Admin</option>
                  </select>
                </label>
                {error ? (
                  <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {error}
                  </div>
                ) : null}
                <button className="btn-primary w-full" disabled={isSaving} type="submit">
                  {isSaving ? "Saving..." : "Add member"}
                </button>
              </form>
            ) : (
              <p className="mt-4 text-sm leading-6 text-slate-600">
                Only project admins can manage members.
              </p>
            )}
          </aside>
        </div>
      </section>
    </main>
  );
}
