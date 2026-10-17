const express = require("express");

const {
    createTask,
    getAllTasks,
    getMyTasks,
    getTaskById,
    updateTaskStatus,
    updateTaskProgress,
    updateTask,
    deleteTask
} = require("../controllers/taskController");

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const router = express.Router();


// ==========================================
// ADMIN ROUTES
// ==========================================

// Create and assign task
router.post(
    "/",
    protect,
    adminOnly,
    createTask
);

// Get all tasks
router.get(
    "/all",
    protect,
    adminOnly,
    getAllTasks
);

// Update task details or reassign members
router.put(
    "/:id",
    protect,
    adminOnly,
    updateTask
);

router.patch(
    "/:id/assign",
    protect,
    adminOnly,
    updateTask
);

router.patch(
    "/:id",
    protect,
    adminOnly,
    updateTask
);

// Delete task
router.delete(
    "/:id",
    protect,
    adminOnly,
    deleteTask
);


// ==========================================
// USER ROUTES
// ==========================================

// Get logged-in user's tasks
router.get(
    "/my-tasks",
    protect,
    getMyTasks
);


// ==========================================
// COMMON PROTECTED ROUTES
// ==========================================

// Get single task
router.get(
    "/:id",
    protect,
    getTaskById
);

// Update task status
router.patch(
    "/:id/status",
    protect,
    updateTaskStatus
);

// Update task progress
router.patch(
    "/:id/progress",
    protect,
    updateTaskProgress
);


module.exports = router;