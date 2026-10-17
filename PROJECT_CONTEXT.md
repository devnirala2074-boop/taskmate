# TaskMate - Project Context

## Project
TaskMate is a MERN-based Task Management System.

## Current Status

The project is already partially implemented and working.

DO NOT rebuild the project from scratch.

DO NOT replace existing architecture unnecessarily.

First inspect the complete existing project before making changes.

---

## Backend

Technology:
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs

Backend runs with:

npm start

Backend URL:

http://localhost:5000

MongoDB database:

taskmanagement

---

## Frontend

Technology:
- React
- Vite
- React Router
- Axios
- CSS

Frontend runs with:

npm run dev

Frontend URL:

http://localhost:5173

---

## Authentication

Implemented:

- Admin login
- User login
- JWT authentication
- Protected routes
- Role-based authorization
- LocalStorage authentication state

Roles:

admin
user

---

## Admin Features Already Implemented

- Admin login
- Admin dashboard
- Create task
- Assign task to user
- Task priority
- Task due date
- View all tasks
- User management APIs
- Password reset API

---

## User Features Already Implemented

- User login
- User dashboard
- My Tasks
- Task details
- View Task navigation
- Task status update
- Task progress update API
- Protected user routes

---

## Current User Flow

Login

↓

User Dashboard

↓

My Tasks

↓

View Task

↓

Task Details

↓

Update Status / Progress

↓

Backend

↓

MongoDB

---

## Current UI

The UI uses a premium Apple-inspired glassmorphism style.

Design characteristics:

- Dark navy background
- Blue accent
- Frosted glass cards
- Rounded corners
- Minimal typography
- Subtle glow
- Responsive layout
- Professional SaaS appearance

Do not replace this design system with a completely different UI.

---

## Important Frontend Files

frontend/src/

components/
- ProtectedRoute.jsx

context/
- AuthContext.jsx

layouts/
- UserLayout.jsx
- AdminLayout.jsx

pages/
- Login.jsx

pages/admin/
- AdminDashboard.jsx
- CreateTask.jsx

pages/user/
- UserDashboard.jsx
- MyTasks.jsx
- TaskDetails.jsx

services/
- api.js
- authService.js
- taskService.js
- userService.js

styles/
- global.css
- glass.css
- animations.css
- adminDashboard.css
- createTask.css
- userDashboard.css
- userLayout.css
- myTasks.css
- taskDetails.css

---

## Important Routing

Current user routes include:

/user/dashboard

/user/tasks

/user/tasks/:id

Admin routes include:

/admin/dashboard

/admin/create-task

---

## Important Rule

Before modifying any file:

1. Inspect the existing file.
2. Understand existing functionality.
3. Preserve working functionality.
4. Make the smallest necessary change.
5. Do not duplicate components.
6. Do not create duplicate routers.
7. Do not change API contracts without checking backend.
8. Do not rewrite the project unnecessarily.

---

## Current Development Goal

Continue the project from its current state.

Priority order:

1. Finish User Task Details
2. Verify status update
3. Verify progress update
4. Synchronize progress/status correctly
5. Improve task history/comments
6. Complete Admin task monitoring
7. Complete Admin user management UI
8. Add task filtering/search
9. Add activity/history
10. Add notifications
11. Improve responsive/mobile UI
12. Final testing
13. Production deployment

---

## Development Method

Work incrementally.

Only modify the files necessary for the current task.

After each major change:

- verify frontend
- verify backend
- verify API
- verify UI
- verify existing functionality

Never assume a feature works without testing it.