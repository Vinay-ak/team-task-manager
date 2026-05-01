import Project from "../models/Project.js";
import Task from "../models/Task.js";

const statuses = ["To Do", "In Progress", "Done"];

export async function getDashboardAnalytics(req, res, next) {
  try {
    const projects = await Project.find({ "members.user": req.user._id }).populate(
      "members.user",
      "name email"
    );
    const projectIds = projects.map((project) => project._id);

    const tasks = await Task.find({ project: { $in: projectIds } })
      .populate("assignedTo", "name email")
      .populate("project", "name")
      .sort({ dueDate: 1 });

    const now = new Date();
    const tasksByStatus = statuses.reduce((summary, status) => {
      summary[status] = tasks.filter((task) => task.status === status).length;
      return summary;
    }, {});

    const userMap = new Map();

    projects.forEach((project) => {
      project.members.forEach((member) => {
        const memberId = member.user._id.toString();
        if (!userMap.has(memberId)) {
          userMap.set(memberId, {
            userId: memberId,
            name: member.user.name,
            email: member.user.email,
            total: 0,
            todo: 0,
            inProgress: 0,
            done: 0
          });
        }
      });
    });

    tasks.forEach((task) => {
      task.assignedTo.forEach((assignee) => {
        const assigneeId = assignee._id.toString();

        if (!userMap.has(assigneeId)) {
          userMap.set(assigneeId, {
            userId: assigneeId,
            name: assignee.name,
            email: assignee.email,
            total: 0,
            todo: 0,
            inProgress: 0,
            done: 0
          });
        }

        const userStats = userMap.get(assigneeId);
        userStats.total += 1;

        if (task.status === "To Do") {
          userStats.todo += 1;
        }

        if (task.status === "In Progress") {
          userStats.inProgress += 1;
        }

        if (task.status === "Done") {
          userStats.done += 1;
        }
      });
    });

    const overdueTasks = tasks
      .filter((task) => task.status !== "Done" && task.dueDate < now)
      .map((task) => ({
        id: task._id,
        title: task.title,
        dueDate: task.dueDate,
        status: task.status,
        priority: task.priority,
        project: task.project
          ? {
              id: task.project._id,
              name: task.project.name
            }
          : null,
        assignedTo: task.assignedTo.map((assignee) => ({
          id: assignee._id,
          name: assignee.name,
          email: assignee.email
        }))
      }));

    res.json({
      analytics: {
        totalProjects: projects.length,
        totalTasks: tasks.length,
        tasksByStatus,
        tasksPerUser: Array.from(userMap.values()).sort((a, b) =>
          a.name.localeCompare(b.name)
        ),
        overdueTasks
      }
    });
  } catch (error) {
    next(error);
  }
}
