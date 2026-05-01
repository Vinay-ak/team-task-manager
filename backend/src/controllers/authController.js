import bcrypt from "bcryptjs";

import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";

function sanitizeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt
  };
}

export async function signup(req, res, next) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400);
      throw new Error("Name, email, and password are required");
    }

    if (password.length < 8) {
      res.status(400);
      throw new Error("Password must be at least 8 characters");
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      res.status(409);
      throw new Error("An account with this email already exists");
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash
    });

    res.status(201).json({
      user: sanitizeUser(user),
      token: generateToken(user._id)
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error("Email and password are required");
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    const passwordsMatch = user
      ? await bcrypt.compare(password, user.passwordHash)
      : false;

    if (!user || !passwordsMatch) {
      res.status(401);
      throw new Error("Invalid email or password");
    }

    res.json({
      user: sanitizeUser(user),
      token: generateToken(user._id)
    });
  } catch (error) {
    next(error);
  }
}

export async function me(req, res) {
  res.json({ user: sanitizeUser(req.user) });
}
