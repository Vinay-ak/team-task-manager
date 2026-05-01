# Team Task Manager

A MERN stack team task management application built progressively.

## Current Step

Step 1 is implemented: JWT authentication with signup, login, password hashing, a protected `me` endpoint, and frontend login/signup screens.

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
