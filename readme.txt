# TEAM TASK MANAGER APPLICATION

A full-stack Team Task Management Web Application built using the MERN stack.
This application allows teams to collaborate by managing projects, assigning tasks,
tracking progress, and maintaining activity logs.

---

FEATURES

1. USER AUTHENTICATION

* User signup and login using JWT authentication
* Secure password hashing
* Protected API routes

2. PROJECT MANAGEMENT

* Create and manage projects
* Project creator becomes Admin
* Admin can add/remove members
* Members can view assigned projects

3. TASK MANAGEMENT

* Create tasks with title, description, due date, and priority
* Assign tasks to users
* Update task status:

  * To Do
  * In Progress
  * Done

4. DASHBOARD

* Total number of tasks
* Tasks grouped by status
* Tasks per user
* Overdue tasks tracking

5. ROLE-BASED ACCESS CONTROL

Admin:

* Full control over projects and tasks

Member:

* Can view projects
* Can update status of assigned tasks only

---

STANDOUT FEATURES

1. ACTIVITY LOG SYSTEM
   Tracks actions within a project:

* Task created, updated, assigned, deleted
* Member added or removed
* Comments added

2. COMMENTS SYSTEM

* Users can add comments on tasks
* Each comment includes:

  * User
  * Message
  * Timestamp

---

TECH STACK

Frontend: Next.js with Tailwind CSS
Backend: Node.js with Express.js
Database: MongoDB (Mongoose)
Authentication: JWT
Deployment: Railway

---

PROJECT STRUCTURE

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

---

SETUP INSTRUCTIONS

1. Clone the repository

2. Backend Setup

* Navigate to backend folder

* Install dependencies:
  npm install

* Copy environment file:
  copy .env.example .env

* Start server:
  npm run dev

* Set environment variables:
  MONGODB_URI = your MongoDB connection string
  JWT_SECRET = your secret key

3. Frontend Setup

* Navigate to frontend folder

* Install dependencies:
  npm install

* Copy environment file:
  copy .env.example .env.local

* Start frontend:
  npm run dev

* Default backend URL:
  http://localhost:5000/api

---

API OVERVIEW

AUTH ROUTES

* POST /api/auth/signup
* POST /api/auth/login
* GET /api/auth/me

PROJECT ROUTES

* GET /api/projects
* POST /api/projects
* POST /api/projects/:projectId/members (Admin only)
* DELETE /api/projects/:projectId/members/:memberId (Admin only)

TASK ROUTES

* GET /api/projects/:projectId/tasks
* POST /api/projects/:projectId/tasks (Admin only)
* PATCH /api/projects/:projectId/tasks/:taskId
* DELETE /api/projects/:projectId/tasks/:taskId (Admin only)

COMMENTS

* GET /api/projects/:projectId/comments
* POST /api/projects/:projectId/comments/tasks/:taskId

ACTIVITY LOGS

* GET /api/projects/:projectId/activity

DASHBOARD

* GET /api/dashboard

---

DEPLOYMENT (RAILWAY)

Backend Environment Variables:

* MONGODB_URI
* JWT_SECRET
* CLIENT_URL
* NODE_ENV=production

Frontend Environment Variables:

* NEXT_PUBLIC_API_URL=<backend-url>/api

---

COMMIT HISTORY (DEVELOPMENT FLOW)

* feat: implement authentication with JWT
* feat: implement project management features
* feat: implement task management system
* feat: build dashboard analytics
* feat: add role-based access control
* feat: implement activity log system
* feat: add task comments feature

---

LIVE APPLICATION
(Add your deployed Railway link here)

DEMO VIDEO
(Add your demo video link here)

---

AUTHOR
Developed as part of a full-stack assessment project.

============================================================
