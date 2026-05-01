# 🚀 Team Task Manager

A full-stack Team Task Management Web Application built using the MERN stack.
This application allows teams to collaborate by managing projects, assigning tasks, tracking progress, and maintaining activity logs.

---

## 📌 Features

### 🔐 Authentication

* User signup & login with secure JWT authentication
* Protected API routes
* Persistent session handling

---

### 📁 Project Management

* Create and manage projects
* Project creator becomes **Admin**
* Admin can:

  * Add/remove members
  * Assign roles
* Members can view assigned projects

---

### 📝 Task Management

* Create tasks with:

  * Title, Description
  * Due Date
  * Priority
* Assign tasks to team members
* Update task status:

  * To Do
  * In Progress
  * Done

---

### 📊 Dashboard

* Total number of tasks
* Tasks grouped by status
* Tasks per user
* Overdue tasks tracking

---

### 🔒 Role-Based Access Control

| Action                      | Admin | Member |
| --------------------------- | ----- | ------ |
| View project                | ✅     | ✅      |
| Add/remove members          | ✅     | ❌      |
| Create tasks                | ✅     | ❌      |
| Assign tasks                | ✅     | ❌      |
| Update assigned task status | ✅     | ✅      |
| Update task details         | ✅     | ❌      |
| Delete tasks                | ✅     | ❌      |

---

### 🧠 Activity Log (Standout Feature)

Tracks important actions within a project:

* Task created, updated, assigned, deleted
* Member added/removed
* Comments added

---

### 💬 Comments System (Standout Feature)

* Add comments to tasks
* Each comment stores:

  * User
  * Message
  * Timestamp

---

## 🏗️ Tech Stack

* **Frontend:** Next.js + Tailwind CSS
* **Backend:** Node.js + Express.js
* **Database:** MongoDB (Mongoose)
* **Authentication:** JWT
* **Deployment:** Railway

---

## 📂 Project Structure

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

---

## ⚙️ Setup Instructions

### 1️⃣ Clone Repository

```bash
git clone <your-repo-url>
cd team-task-manager
```

---

### 2️⃣ Backend Setup

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Update `.env`:

```env
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_secret
```

---

### 3️⃣ Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Default API URL:

```
http://localhost:5000/api
```

---

## 🔗 API Documentation

### 🔐 Auth Routes

**POST** `/api/auth/signup`

```json
{
  "name": "Ada Lovelace",
  "email": "ada@example.com",
  "password": "password123"
}
```

**POST** `/api/auth/login`

**GET** `/api/auth/me`
Requires:

```
Authorization: Bearer <token>
```

---

### 📁 Project Routes

**GET** `/api/projects`
→ Fetch user projects

**POST** `/api/projects`
→ Create project

**POST** `/api/projects/:projectId/members`
→ Add member (Admin only)

**DELETE** `/api/projects/:projectId/members/:memberId`
→ Remove member (Admin only)

---

### 📝 Task Routes

**GET** `/api/projects/:projectId/tasks`

**POST** `/api/projects/:projectId/tasks`
→ Admin only

**PATCH** `/api/projects/:projectId/tasks/:taskId`
→ Members can update only assigned task status

**DELETE** `/api/projects/:projectId/tasks/:taskId`
→ Admin only

---

### 💬 Comments

**GET** `/api/projects/:projectId/comments`

**POST** `/api/projects/:projectId/comments/tasks/:taskId`

```json
{
  "message": "I pushed the first draft for review."
}
```

---

### 🧠 Activity Logs

**GET** `/api/projects/:projectId/activity`

Returns latest activity including:

```
task_created
task_updated
task_assigned
task_deleted
comment_added
member_added
member_removed
```

---

### 📊 Dashboard

**GET** `/api/dashboard`

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

---

## 🚀 Deployment (Railway)

### Backend Environment Variables

```env
MONGODB_URI=<MongoDB URI>
JWT_SECRET=<secret>
CLIENT_URL=<frontend URL>
NODE_ENV=production
```

### Frontend Environment Variables

```env
NEXT_PUBLIC_API_URL=<backend URL>/api
```

---

## 🧪 Future Improvements

* Real-time updates (WebSockets)
* Notifications system
* Drag-and-drop task board (Kanban)
* File attachments for tasks

---

## 📜 Commit History (Development Flow)

* feat: implement authentication with JWT
* feat: implement project management features
* feat: implement task management system
* feat: build dashboard analytics
* feat: add role-based access control
* feat: implement activity log system
* feat: add task comments feature

---

## 🎥 Demo

👉 *(Add your demo video link here)*

---

## 🌐 Live Application

👉 *(Add your deployed Railway link here)*

---

## 👨‍💻 Author

Developed as part of a full-stack assessment project.
