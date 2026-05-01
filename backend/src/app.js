import cors from "cors";
import express from "express";
import morgan from "morgan";

import authRoutes from "./routes/authRoutes.js";
import activityLogRoutes from "./routes/activityLogRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";

const app = express();
const clientUrl = (process.env.CLIENT_URL || "http://localhost:3000").replace(/\/$/, "");

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || origin.replace(/\/$/, "") === clientUrl) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true
  })
);
app.use(express.json());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/projects/:projectId/activity", activityLogRoutes);
app.use("/api/projects/:projectId/comments", commentRoutes);
app.use("/api/projects/:projectId/tasks", taskRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
