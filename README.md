# Team Task Manager

A MERN stack team task management application built progressively.

## Current Step

Step 7 is implemented: JWT authentication, project management, task management, dashboard analytics, backend role-based access control, project activity logs, and task comments.

## Project Structure

```text
team-task-manager/
  backend/
    src/
      config/
      controllers/
      middleware/
      models/
      routes/
      utils/
  frontend/
    app/
    components/
    lib/
```

## Setup

### Backend

```bash
cd backend
npm install
copy .env.example .env
npm run dev
```

Set `MONGODB_URI` and `JWT_SECRET` in `backend/.env`.

### Frontend

```bash
cd frontend
npm install
copy .env.example .env.local
npm run dev
```

By default the frontend expects the backend at `http://localhost:5000/api`.

## API Documentation

## Role-Based Access Control

Project membership is loaded by backend middleware for project and task routes. Admin-only endpoints use a reusable `requireProjectAdmin` guard. Members can read project data and update the status of tasks assigned to them, but cannot create tasks, assign users, delete tasks, or manage project members.

Permission summary:

| Action | Admin | Member |
| --- | --- | --- |
| View project | Yes | Yes |
| Add/remove members | Yes | No |
| Create tasks | Yes | No |
| Assign/reassign tasks | Yes | No |
| Update task status when assigned | Yes | Yes |
| Update task details | Yes | No |
| Delete tasks | Yes | No |

### Activity Logs

`GET /api/projects/:projectId/activity`

Requires project membership.

Returns the latest 50 activity records for a project. Logged actions include:

```text
task_created
task_updated
task_assigned
task_deleted
comment_added
member_added
member_removed
```

### Comments

`GET /api/projects/:projectId/comments`

Requires project membership. Returns all comments for tasks in the project.

`POST /api/projects/:projectId/comments/tasks/:taskId`

Requires project membership. Body:

```json
{
  "message": "I pushed the first draft for review."
}
```

Comments store `user`, `message`, `timestamp`, project, and task references.

### Auth

`POST /api/auth/signup`

Body:

```json
{
  "name": "Ada Lovelace",
  "email": "ada@example.com",
  "password": "password123"
}
```

`POST /api/auth/login`

Body:

```json
{
  "email": "ada@example.com",
  "password": "password123"
}
```

`GET /api/auth/me`

Requires:

```text
Authorization: Bearer <token>
```

### Projects

All project routes require:

```text
Authorization: Bearer <token>
```

`GET /api/projects`

Returns projects where the logged-in user is a member.

`POST /api/projects`

Body:

```json
{
  "name": "Website Launch",
  "description": "Plan and ship the launch work"
}
```

The creator is automatically added as an `Admin`.

`GET /api/projects/:projectId`

Returns one project if the logged-in user is a member.

`POST /api/projects/:projectId/members`

Admin only. Body:

```json
{
  "email": "teammate@example.com",
  "role": "Member"
}
```

`DELETE /api/projects/:projectId/members/:memberId`

Admin only. Removes a member from the project.

### Tasks

All task routes require project membership and:

```text
Authorization: Bearer <token>
```

`GET /api/projects/:projectId/tasks`

Returns tasks for a project.

`POST /api/projects/:projectId/tasks`

Admin only. Body:

```json
{
  "title": "Draft launch plan",
  "description": "Create the initial rollout checklist",
  "dueDate": "2026-05-20",
  "priority": "High",
  "assignedTo": ["userId"]
}
```

`PATCH /api/projects/:projectId/tasks/:taskId`

Admins can update any task fields. Members can only update `status` for tasks assigned to them.

```json
{
  "status": "In Progress"
}
```

`DELETE /api/projects/:projectId/tasks/:taskId`

Admin only.

### Dashboard

`GET /api/dashboard`

Requires:

```text
Authorization: Bearer <token>
```

Returns:

```json
{
  "analytics": {
    "totalProjects": 2,
    "totalTasks": 8,
    "tasksByStatus": {
      "To Do": 3,
      "In Progress": 2,
      "Done": 3
    },
    "tasksPerUser": [],
    "overdueTasks": []
  }
}
```

## Railway Deployment Notes

Create separate Railway services for `backend` and `frontend`.

Backend variables:

```text
MONGODB_URI=<your MongoDB connection string>
JWT_SECRET=<strong secret>
CLIENT_URL=<frontend URL>
NODE_ENV=production
```

Frontend variables:

```text
NEXT_PUBLIC_API_URL=<backend URL>/api
```

## Planned Commit History

1. `implement authentication with JWT`
2. `implement project management features`
3. `implement task management system`
4. `build dashboard analytics`
5. `add role-based access control`
6. `implement activity log system`
7. `add task comments feature`
