import Project from "../models/Project.js";
import User from "../models/User.js";
import { logActivity } from "../utils/activityLogger.js";

function serializeProject(project) {
  return {
    id: project._id,
    name: project.name,
    description: project.description,
    createdBy: project.createdBy,
    members: project.members,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt
  };
}

export async function createProject(req, res, next) {
  try {
    const { name, description = "" } = req.body;

    if (!name?.trim()) {
      res.status(400);
      throw new Error("Project name is required");
    }

    const project = await Project.create({
      name: name.trim(),
      description: description.trim(),
      createdBy: req.user._id,
      members: [{ user: req.user._id, role: "Admin" }]
    });

    const populatedProject = await project.populate("members.user", "name email");
    res.status(201).json({ project: serializeProject(populatedProject) });
  } catch (error) {
    next(error);
  }
}

export async function getMyProjects(req, res, next) {
  try {
    const projects = await Project.find({ "members.user": req.user._id })
      .populate("members.user", "name email")
      .sort({ updatedAt: -1 });

    res.json({ projects: projects.map(serializeProject) });
  } catch (error) {
    next(error);
  }
}

export async function getProjectById(req, res, next) {
  try {
    res.json({ project: serializeProject(req.project) });
  } catch (error) {
    next(error);
  }
}

export async function addProjectMember(req, res, next) {
  try {
    const { email, role = "Member" } = req.body;

    if (!email) {
      res.status(400);
      throw new Error("Member email is required");
    }

    if (!["Admin", "Member"].includes(role)) {
      res.status(400);
      throw new Error("Role must be Admin or Member");
    }

    const project = req.project;

    const userToAdd = await User.findOne({ email: email.toLowerCase().trim() });

    if (!userToAdd) {
      res.status(404);
      throw new Error("No user found with that email");
    }

    const alreadyMember = project.members.some(
      (member) => member.user._id.toString() === userToAdd._id.toString()
    );

    if (alreadyMember) {
      res.status(409);
      throw new Error("User is already a project member");
    }

    project.members.push({ user: userToAdd._id, role });
    await project.save();

    await logActivity({
      project: project._id,
      user: req.user._id,
      action: "member_added",
      referenceId: userToAdd._id,
      referenceType: "User",
      metadata: {
        memberName: userToAdd.name,
        memberEmail: userToAdd.email,
        role
      }
    });

    const populatedProject = await project.populate("members.user", "name email");
    res.json({ project: serializeProject(populatedProject) });
  } catch (error) {
    next(error);
  }
}

export async function removeProjectMember(req, res, next) {
  try {
    const { memberId } = req.params;
    const project = req.project;

    if (project.createdBy.toString() === memberId) {
      res.status(400);
      throw new Error("The project creator cannot be removed");
    }

    const memberToRemove = project.members.find(
      (member) => member.user._id.toString() === memberId
    );

    if (!memberToRemove) {
      res.status(404);
      throw new Error("Member not found on this project");
    }

    project.members = project.members.filter(
      (member) => member.user._id.toString() !== memberId
    );
    await project.save();

    await logActivity({
      project: project._id,
      user: req.user._id,
      action: "member_removed",
      referenceId: memberToRemove.user._id,
      referenceType: "User",
      metadata: {
        memberName: memberToRemove.user.name,
        memberEmail: memberToRemove.user.email,
        role: memberToRemove.role
      }
    });

    const populatedProject = await project.populate("members.user", "name email");
    res.json({ project: serializeProject(populatedProject) });
  } catch (error) {
    next(error);
  }
}
