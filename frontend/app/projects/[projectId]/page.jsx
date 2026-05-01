"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { getCurrentUser, logout } from "../../../lib/auth";
import { getActivityLogs } from "../../../lib/activity";
import { addComment, getComments } from "../../../lib/comments";
import {
  addProjectMember,
  getProject,
  removeProjectMember
} from "../../../lib/projects";
import { createTask, deleteTask, getTasks, updateTask } from "../../../lib/tasks";

const statuses = ["To Do", "In Progress", "Done"];
const priorities = ["Low", "Medium", "High"];

const emptyTaskForm = {
  title: "",
  description: "",
  dueDate: "",
  priority: "Medium",
  assignedTo: []
};

function formatAction(action) {
  return action
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function ProjectDetailsPage() {
  const { projectId } = useParams();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [comments, setComments] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [memberForm, setMemberForm] = useState({ email: "", role: "Member" });
  const [taskForm, setTaskForm] = useState(emptyTaskForm);
  const [commentForms, setCommentForms] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTaskSaving, setIsTaskSaving] = useState(false);
  const [isCommentSaving, setIsCommentSaving] = useState(false);
  const [error, setError] = useState("");
  const [taskError, setTaskError] = useState("");
  const [commentError, setCommentError] = useState("");

  const currentMembership = useMemo(() => {
    return project?.members.find(
      (member) => member.user.id === user?.id || member.user._id === user?.id
    );
  }, [project, user]);

  const isAdmin = currentMembership?.role === "Admin";

  useEffect(() => {
    async function loadProject() {
      try {
        const [currentUser, currentProject, currentTasks, logs, currentComments] = await Promise.all([
          getCurrentUser(),
          getProject(projectId),
          getTasks(projectId),
          getActivityLogs(projectId),
          getComments(projectId)
        ]);
        setUser(currentUser);
        setProject(currentProject);
        setTasks(currentTasks);
        setActivityLogs(logs);
        setComments(currentComments);
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

  function updateTaskField(event) {
    const { name, value } = event.target;
    setTaskForm((current) => ({ ...current, [name]: value }));
  }

  function toggleAssignee(userId) {
    setTaskForm((current) => {
      const hasAssignee = current.assignedTo.includes(userId);
      return {
        ...current,
        assignedTo: hasAssignee
          ? current.assignedTo.filter((id) => id !== userId)
          : [...current.assignedTo, userId]
      };
    });
  }

  function updateCommentField(taskId, value) {
    setCommentForms((current) => ({ ...current, [taskId]: value }));
  }

  async function refreshActivity() {
    const logs = await getActivityLogs(projectId);
    setActivityLogs(logs);
  }

  async function handleAddMember(event) {
    event.preventDefault();
    setError("");
    setIsSaving(true);

    try {
      const updatedProject = await addProjectMember(projectId, memberForm);
      setProject(updatedProject);
      setMemberForm({ email: "", role: "Member" });
      await refreshActivity();
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
      setTasks((current) =>
        current.map((task) => ({
          ...task,
          assignedTo: task.assignedTo.filter(
            (assignee) => (assignee.id || assignee._id) !== memberId
          )
        }))
      );
      await refreshActivity();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleCreateTask(event) {
    event.preventDefault();
    setTaskError("");
    setIsTaskSaving(true);

    try {
      const task = await createTask(projectId, taskForm);
      setTasks((current) => [task, ...current]);
      setTaskForm(emptyTaskForm);
      await refreshActivity();
    } catch (err) {
      setTaskError(err.message);
    } finally {
      setIsTaskSaving(false);
    }
  }

  async function handleStatusChange(task, status) {
    setTaskError("");
    setIsTaskSaving(true);

    try {
      const updatedTask = await updateTask(projectId, task.id, { status });
      setTasks((current) =>
        current.map((item) => (item.id === updatedTask.id ? updatedTask : item))
      );
      await refreshActivity();
    } catch (err) {
      setTaskError(err.message);
    } finally {
      setIsTaskSaving(false);
    }
  }

  async function handlePriorityChange(task, priority) {
    setTaskError("");
    setIsTaskSaving(true);

    try {
      const updatedTask = await updateTask(projectId, task.id, { priority });
      setTasks((current) =>
        current.map((item) => (item.id === updatedTask.id ? updatedTask : item))
      );
      await refreshActivity();
    } catch (err) {
      setTaskError(err.message);
    } finally {
      setIsTaskSaving(false);
    }
  }

  async function handleTaskAssigneeToggle(task, memberId) {
    setTaskError("");
    setIsTaskSaving(true);

    const currentAssigneeIds = task.assignedTo.map((assignee) => assignee.id || assignee._id);
    const nextAssigneeIds = currentAssigneeIds.includes(memberId)
      ? currentAssigneeIds.filter((id) => id !== memberId)
      : [...currentAssigneeIds, memberId];

    try {
      const updatedTask = await updateTask(projectId, task.id, {
        assignedTo: nextAssigneeIds
      });
      setTasks((current) =>
        current.map((item) => (item.id === updatedTask.id ? updatedTask : item))
      );
      await refreshActivity();
    } catch (err) {
      setTaskError(err.message);
    } finally {
      setIsTaskSaving(false);
    }
  }

  async function handleDeleteTask(taskId) {
    setTaskError("");
    setIsTaskSaving(true);

    try {
      await deleteTask(projectId, taskId);
      setTasks((current) => current.filter((task) => task.id !== taskId));
      setComments((current) => current.filter((comment) => comment.task !== taskId));
      await refreshActivity();
    } catch (err) {
      setTaskError(err.message);
    } finally {
      setIsTaskSaving(false);
    }
  }

  async function handleAddComment(event, taskId) {
    event.preventDefault();
    setCommentError("");
    setIsCommentSaving(true);

    try {
      const comment = await addComment(projectId, taskId, commentForms[taskId] || "");
      setComments((current) => [...current, comment]);
      setCommentForms((current) => ({ ...current, [taskId]: "" }));
      await refreshActivity();
    } catch (err) {
      setCommentError(err.message);
    } finally {
      setIsCommentSaving(false);
    }
  }

  const memberOptions =
    project?.members.map((member) => ({
      id: member.user.id || member.user._id,
      name: member.user.name,
      email: member.user.email
    })) || [];

  const groupedTasks = statuses.map((status) => ({
    status,
    tasks: tasks.filter((task) => task.status === status)
  }));

  const commentsByTask = comments.reduce((groups, comment) => {
    const taskId = comment.task?.id || comment.task?._id || comment.task;
    groups[taskId] = [...(groups[taskId] || []), comment];
    return groups;
  }, {});

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

        <div className="grid gap-8 py-8 xl:grid-cols-[minmax(0,1fr)_360px]">
          <section className="space-y-8">
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-950">Tasks</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Create, assign, and move work through the team flow.
                  </p>
                </div>
                <span className="text-sm font-medium text-slate-500">
                  {tasks.length} total
                </span>
              </div>

              {taskError ? (
                <div className="mt-5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {taskError}
                </div>
              ) : null}

              <div className="mt-6 grid gap-4 lg:grid-cols-3">
                {groupedTasks.map((group) => (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3" key={group.status}>
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-slate-800">{group.status}</h3>
                      <span className="rounded bg-white px-2 py-1 text-xs font-medium text-slate-600">
                        {group.tasks.length}
                      </span>
                    </div>
                    <div className="mt-3 space-y-3">
                      {group.tasks.length === 0 ? (
                        <p className="rounded-md border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500">
                          No tasks
                        </p>
                      ) : (
                        group.tasks.map((task) => {
                          const canUpdateStatus =
                            isAdmin ||
                            task.assignedTo.some(
                              (assignee) => (assignee.id || assignee._id) === user?.id
                            );

                          return (
                            <article
                              className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
                              key={task.id}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <h4 className="font-medium text-slate-950">{task.title}</h4>
                                  <p className="mt-2 text-sm leading-5 text-slate-600">
                                    {task.description || "No description."}
                                  </p>
                                </div>
                                <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                                  {task.priority}
                                </span>
                              </div>

                              <div className="mt-4 space-y-2 text-xs text-slate-500">
                                <p>Due {new Date(task.dueDate).toLocaleDateString()}</p>
                                <p>
                                  Assigned to{" "}
                                  {task.assignedTo.length
                                    ? task.assignedTo.map((assignee) => assignee.name).join(", ")
                                    : "no one"}
                                </p>
                              </div>

                              <div className="mt-4 grid gap-2">
                                <select
                                  className="text-input mt-0"
                                  disabled={!canUpdateStatus || isTaskSaving}
                                  onChange={(event) => handleStatusChange(task, event.target.value)}
                                  value={task.status}
                                >
                                  {statuses.map((status) => (
                                    <option key={status} value={status}>
                                      {status}
                                    </option>
                                  ))}
                                </select>

                                {isAdmin ? (
                                  <select
                                    className="text-input mt-0"
                                    disabled={isTaskSaving}
                                    onChange={(event) =>
                                      handlePriorityChange(task, event.target.value)
                                    }
                                    value={task.priority}
                                  >
                                    {priorities.map((priority) => (
                                      <option key={priority} value={priority}>
                                        {priority}
                                      </option>
                                    ))}
                                  </select>
                                ) : null}

                                {isAdmin ? (
                                  <div className="rounded-md border border-slate-200 p-2">
                                    <p className="text-xs font-medium text-slate-600">Assign</p>
                                    <div className="mt-2 space-y-2">
                                      {memberOptions.map((member) => {
                                        const checked = task.assignedTo.some(
                                          (assignee) =>
                                            (assignee.id || assignee._id) === member.id
                                        );

                                        return (
                                          <label
                                            className="flex items-center gap-2 text-xs text-slate-700"
                                            key={member.id}
                                          >
                                            <input
                                              checked={checked}
                                              disabled={isTaskSaving}
                                              onChange={() =>
                                                handleTaskAssigneeToggle(task, member.id)
                                              }
                                              type="checkbox"
                                            />
                                            <span>{member.name}</span>
                                          </label>
                                        );
                                      })}
                                    </div>
                                  </div>
                                ) : null}

                                {isAdmin ? (
                                  <button
                                    className="justify-self-start text-sm font-medium text-red-600 disabled:text-slate-400"
                                    disabled={isTaskSaving}
                                    onClick={() => handleDeleteTask(task.id)}
                                    type="button"
                                  >
                                    Delete
                                  </button>
                                ) : null}
                              </div>

                              <div className="mt-5 border-t border-slate-200 pt-4">
                                <div className="flex items-center justify-between gap-3">
                                  <p className="text-xs font-semibold text-slate-700">
                                    Comments
                                  </p>
                                  <span className="text-xs text-slate-500">
                                    {(commentsByTask[task.id] || []).length}
                                  </span>
                                </div>

                                <div className="mt-3 space-y-3">
                                  {(commentsByTask[task.id] || []).length ? (
                                    commentsByTask[task.id].map((comment) => (
                                      <div
                                        className="rounded-md bg-slate-50 p-3"
                                        key={comment.id}
                                      >
                                        <div className="flex items-start justify-between gap-2">
                                          <p className="text-xs font-medium text-slate-800">
                                            {comment.user?.name || "Someone"}
                                          </p>
                                          <span className="text-[11px] text-slate-500">
                                            {new Date(comment.timestamp).toLocaleDateString()}
                                          </span>
                                        </div>
                                        <p className="mt-2 text-xs leading-5 text-slate-600">
                                          {comment.message}
                                        </p>
                                      </div>
                                    ))
                                  ) : (
                                    <p className="text-xs text-slate-500">No comments yet.</p>
                                  )}
                                </div>

                                <form
                                  className="mt-3 space-y-2"
                                  onSubmit={(event) => handleAddComment(event, task.id)}
                                >
                                  <textarea
                                    className="text-input mt-0 min-h-20 resize-y text-xs"
                                    onChange={(event) =>
                                      updateCommentField(task.id, event.target.value)
                                    }
                                    placeholder="Add a comment"
                                    value={commentForms[task.id] || ""}
                                  />
                                  <button
                                    className="btn-secondary h-9 w-full"
                                    disabled={isCommentSaving}
                                    type="submit"
                                  >
                                    {isCommentSaving ? "Adding..." : "Add comment"}
                                  </button>
                                </form>
                              </div>
                            </article>
                          );
                        })
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {commentError ? (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {commentError}
              </div>
            ) : null}

            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
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
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-950">Activity</h2>
              <div className="mt-5 divide-y divide-slate-200">
                {activityLogs.length ? (
                  activityLogs.map((log) => (
                    <div className="py-4 first:pt-0 last:pb-0" key={log.id}>
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="font-medium text-slate-950">
                            {formatAction(log.action)}
                          </p>
                          <p className="mt-1 text-sm text-slate-600">
                            {log.user?.name || "Someone"}{" "}
                            {log.metadata?.title ? `on "${log.metadata.title}"` : ""}
                            {log.metadata?.memberName ? `: ${log.metadata.memberName}` : ""}
                          </p>
                        </div>
                        <span className="text-xs text-slate-500">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-600">No activity yet.</p>
                )}
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-950">Create task</h2>
              {isAdmin ? (
                <form className="mt-5 space-y-4" onSubmit={handleCreateTask}>
                  <label className="block">
                    <span className="input-label">Title</span>
                    <input
                      className="text-input"
                      name="title"
                      onChange={updateTaskField}
                      required
                      type="text"
                      value={taskForm.title}
                    />
                  </label>
                  <label className="block">
                    <span className="input-label">Description</span>
                    <textarea
                      className="text-input min-h-24 resize-y"
                      name="description"
                      onChange={updateTaskField}
                      value={taskForm.description}
                    />
                  </label>
                  <label className="block">
                    <span className="input-label">Due date</span>
                    <input
                      className="text-input"
                      name="dueDate"
                      onChange={updateTaskField}
                      required
                      type="date"
                      value={taskForm.dueDate}
                    />
                  </label>
                  <label className="block">
                    <span className="input-label">Priority</span>
                    <select
                      className="text-input"
                      name="priority"
                      onChange={updateTaskField}
                      value={taskForm.priority}
                    >
                      {priorities.map((priority) => (
                        <option key={priority} value={priority}>
                          {priority}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div>
                    <p className="input-label">Assign to</p>
                    <div className="mt-2 space-y-2">
                      {memberOptions.map((member) => (
                        <label
                          className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700"
                          key={member.id}
                        >
                          <input
                            checked={taskForm.assignedTo.includes(member.id)}
                            onChange={() => toggleAssignee(member.id)}
                            type="checkbox"
                          />
                          <span>{member.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  {taskError ? (
                    <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                      {taskError}
                    </div>
                  ) : null}
                  <button className="btn-primary w-full" disabled={isTaskSaving} type="submit">
                    {isTaskSaving ? "Creating..." : "Create task"}
                  </button>
                </form>
              ) : (
                <p className="mt-4 text-sm leading-6 text-slate-600">
                  Only project admins can create and assign tasks.
                </p>
              )}
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
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
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
