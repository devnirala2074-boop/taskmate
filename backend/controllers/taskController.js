const mongoose = require("mongoose");
const Task = require("../models/Task");
const User = require("../models/User");

// ==========================================
// Helper: Normalize Priority
// ==========================================
const normalizePriority = (priority) => {
    if (!priority) return "Medium";
    const map = {
        low: "Low",
        medium: "Medium",
        high: "High",
        urgent: "Urgent"
    };
    return map[String(priority).trim().toLowerCase()] || null;
};

// ==========================================
// Helper: Validate & Resolve Assignees
// ==========================================
const validateAndResolveAssignees = async (rawAssignedTo) => {
    if (
        rawAssignedTo === undefined ||
        rawAssignedTo === null ||
        rawAssignedTo === "" ||
        (Array.isArray(rawAssignedTo) && rawAssignedTo.length === 0)
    ) {
        return {
            error: "At least one assigned user is required",
            statusCode: 400
        };
    }

    const rawList = Array.isArray(rawAssignedTo)
        ? rawAssignedTo
        : [rawAssignedTo];

    const ids = rawList
        .map((item) => {
            if (!item) return "";
            if (typeof item === "object" && item._id) {
                return String(item._id).trim();
            }
            return String(item).trim();
        })
        .filter(Boolean);

    if (ids.length === 0) {
        return {
            error: "At least one assigned user is required",
            statusCode: 400
        };
    }

    // Check for malformed MongoDB ObjectIds
    for (const id of ids) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return {
                error: `Invalid user ID format: ${id}`,
                statusCode: 400
            };
        }
    }

    // Check for duplicate IDs
    const uniqueIds = [...new Set(ids)];
    if (uniqueIds.length !== ids.length) {
        return {
            error: "Duplicate user assignment is not allowed",
            statusCode: 400
        };
    }

    // Verify all users exist in database
    const users = await User.find({
        _id: { $in: uniqueIds }
    }).select("_id name email role");

    if (users.length !== uniqueIds.length) {
        return {
            error: "One or more selected users do not exist",
            statusCode: 404
        };
    }

    // Ensure all selected users have standard 'user' role (not admin)
    const nonStandardUser = users.find((u) => u.role !== "user");
    if (nonStandardUser) {
        return {
            error: "Tasks can only be assigned to standard user accounts",
            statusCode: 400
        };
    }

    return {
        assigneeIds: uniqueIds,
        users
    };
};

// ==========================================
// Helper: Extract ID String
// ==========================================
const toIdString = (val) => {
    if (!val) return "";
    if (typeof val === "object" && val._id) {
        return String(val._id);
    }
    return String(val);
};

// ==========================================
// Helper: Check if User is Assigned to Task
// ==========================================
const isUserAssignedToTask = (task, userId) => {
    const targetId = toIdString(userId);
    if (!targetId || !task || !task.assignedTo) return false;

    const assignedList = Array.isArray(task.assignedTo)
        ? task.assignedTo
        : [task.assignedTo];

    return assignedList.some((u) => toIdString(u) === targetId);
};

// ==========================================
// Helper: Ensure memberProgress & Sync Aggregate
// ==========================================
const ensureMemberProgressInitialized = (task) => {
    const assignedList = Array.isArray(task.assignedTo)
        ? task.assignedTo
        : task.assignedTo
        ? [task.assignedTo]
        : [];

    const assignedIdStrings = assignedList
        .map((u) => toIdString(u))
        .filter(Boolean);

    if (!Array.isArray(task.memberProgress)) {
        task.memberProgress = [];
    }

    const existingMap = new Map();
    for (const mp of task.memberProgress) {
        const uid = toIdString(mp.user);
        if (uid) {
            existingMap.set(uid, mp);
        }
    }

    const fallbackStatus = task.status || "Pending";
    const fallbackProgress = task.progress ?? 0;

    const updatedMemberProgress = assignedIdStrings.map((uid) => {
        if (existingMap.has(uid)) {
            return existingMap.get(uid);
        }
        return {
            user: uid,
            status: fallbackStatus,
            progress: fallbackProgress,
            updatedAt: new Date()
        };
    });

    task.memberProgress = updatedMemberProgress;
};

const syncTaskAggregateFromMembers = (task) => {
    ensureMemberProgressInitialized(task);

    if (task.memberProgress.length === 0) return;

    const totalProgress = task.memberProgress.reduce(
        (sum, mp) => sum + (Number(mp.progress) || 0),
        0
    );
    const avgProgress = Math.round(
        totalProgress / task.memberProgress.length
    );

    const allCompleted = task.memberProgress.every(
        (mp) => mp.status === "Completed" || Number(mp.progress) === 100
    );
    const allPending = task.memberProgress.every(
        (mp) => mp.status === "Pending" && (Number(mp.progress) || 0) === 0
    );

    if (allCompleted) {
        task.status = "Completed";
        task.progress = 100;
    } else if (allPending) {
        task.status = "Pending";
        task.progress = 0;
    } else {
        task.status = "In Progress";
        task.progress = avgProgress > 0 ? avgProgress : 10;
    }
};

// ==========================================
// Helper: Format Task Document for Response
// ==========================================
const formatTaskForUser = (taskDoc, requestingUser) => {
    if (!taskDoc) return null;

    const taskObj = taskDoc.toObject
        ? taskDoc.toObject()
        : { ...taskDoc };

    // Normalize assignedTo into an array
    if (!Array.isArray(taskObj.assignedTo)) {
        taskObj.assignedTo = taskObj.assignedTo
            ? [taskObj.assignedTo]
            : [];
    }

    // Ensure memberProgress entries exist for every assignee in the response
    const existingMpMap = new Map();
    if (Array.isArray(taskObj.memberProgress)) {
        for (const mp of taskObj.memberProgress) {
            const uid = toIdString(mp.user);
            if (uid) existingMpMap.set(uid, mp);
        }
    }

    taskObj.memberProgress = taskObj.assignedTo.map((assignee) => {
        const uid = toIdString(assignee);
        const existing = existingMpMap.get(uid);
        const userRef =
            typeof assignee === "object" && assignee !== null && assignee.name
                ? {
                      _id: assignee._id,
                      name: assignee.name,
                      email: assignee.email
                  }
                : existing?.user || assignee;

        if (existing) {
            return {
                user: userRef,
                status: existing.status || "Pending",
                progress: existing.progress ?? 0,
                updatedAt: existing.updatedAt
            };
        }

        return {
            user: userRef,
            status: taskObj.status || "Pending",
            progress: taskObj.progress ?? 0,
            updatedAt: taskObj.updatedAt || taskObj.createdAt
        };
    });

    taskObj.overallStatus = taskObj.status;
    taskObj.overallProgress = taskObj.progress ?? 0;

    // If requester is a standard user, surface their individual status & progress
    if (requestingUser && requestingUser.role === "user") {
        const reqUserId = toIdString(requestingUser.id || requestingUser._id);
        const myEntry = taskObj.memberProgress.find(
            (mp) => toIdString(mp.user) === reqUserId
        );
        if (myEntry) {
            taskObj.status = myEntry.status;
            taskObj.progress = myEntry.progress ?? 0;
        }
    }

    return taskObj;
};

// ==========================================
// Safe Non-Destructive Legacy Task Normalization
// ==========================================
const normalizeLegacyTasksInDb = async () => {
    try {
        const rawTasks = await Task.collection.find({}).toArray();
        for (const raw of rawTasks) {
            let needsUpdate = false;
            const updateFields = {};

            let assignedArray = [];
            if (Array.isArray(raw.assignedTo)) {
                assignedArray = raw.assignedTo;
            } else if (raw.assignedTo) {
                assignedArray = [raw.assignedTo];
                updateFields.assignedTo = assignedArray;
                needsUpdate = true;
            }

            if (
                assignedArray.length > 0 &&
                (!Array.isArray(raw.memberProgress) ||
                    raw.memberProgress.length === 0)
            ) {
                updateFields.memberProgress = assignedArray.map((uid) => ({
                    user: uid,
                    status: raw.status || "Pending",
                    progress: raw.progress ?? 0,
                    updatedAt: raw.updatedAt || new Date()
                }));
                needsUpdate = true;
            }

            if (needsUpdate) {
                await Task.collection.updateOne(
                    { _id: raw._id },
                    { $set: updateFields }
                );
            }
        }
    } catch (err) {
        console.error("Legacy task normalization warning:", err.message);
    }
};

// ===============================
// Create Task - Admin Only
// ===============================
const createTask = async (req, res) => {
    try {
        const {
            title,
            description,
            assignedTo,
            priority,
            dueDate
        } = req.body;

        if (!title || !String(title).trim() || !description || !String(description).trim()) {
            return res.status(400).json({
                message: "Title, description, assigned user and due date are required"
            });
        }

        const validation = await validateAndResolveAssignees(assignedTo);
        if (validation.error) {
            return res.status(validation.statusCode).json({
                message: validation.error
            });
        }

        const normalizedPriority = normalizePriority(priority);
        if (!normalizedPriority) {
            return res.status(400).json({
                message: "Invalid priority value. Allowed: Low, Medium, High, Urgent"
            });
        }

        const resolvedDueDate = dueDate
            ? new Date(dueDate)
            : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        if (isNaN(resolvedDueDate.getTime())) {
            return res.status(400).json({
                message: "Invalid due date format"
            });
        }

        const initialMemberProgress = validation.assigneeIds.map((uid) => ({
            user: uid,
            status: "Pending",
            progress: 0,
            updatedAt: new Date()
        }));

        const task = await Task.create({
            title: String(title).trim(),
            description: String(description).trim(),
            assignedTo: validation.assigneeIds,
            memberProgress: initialMemberProgress,
            assignedBy: req.user.id,
            priority: normalizedPriority,
            dueDate: resolvedDueDate
        });

        const populatedTask = await Task.findById(task._id)
            .populate("assignedTo", "name email role")
            .populate("assignedBy", "name email")
            .populate("memberProgress.user", "name email");

        res.status(201).json({
            message: "Task assigned successfully",
            task: formatTaskForUser(populatedTask, req.user)
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to create task",
            error: error.message
        });
    }
};


// ===============================
// Get All Tasks - Admin
// ===============================
const getAllTasks = async (req, res) => {
    try {
        await normalizeLegacyTasksInDb();

        const tasks = await Task.find()
            .populate("assignedTo", "name email role")
            .populate("assignedBy", "name email")
            .populate("memberProgress.user", "name email")
            .sort({ createdAt: -1 });

        const formattedTasks = tasks.map((t) =>
            formatTaskForUser(t, req.user)
        );

        res.status(200).json({
            count: formattedTasks.length,
            tasks: formattedTasks
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch tasks",
            error: error.message
        });
    }
};


// ===============================
// Get My Tasks - User
// ===============================
const getMyTasks = async (req, res) => {
    try {
        await normalizeLegacyTasksInDb();

        const tasks = await Task.find({
            assignedTo: req.user.id
        })
            .populate("assignedTo", "name email")
            .populate("assignedBy", "name email")
            .populate("memberProgress.user", "name email")
            .sort({ createdAt: -1 });

        const formattedTasks = tasks.map((t) =>
            formatTaskForUser(t, req.user)
        );

        res.status(200).json({
            count: formattedTasks.length,
            tasks: formattedTasks
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch your tasks",
            error: error.message
        });
    }
};


// ===============================
// Get Single Task
// ===============================
const getTaskById = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid task ID"
            });
        }

        const task = await Task.findById(req.params.id)
            .populate("assignedTo", "name email role")
            .populate("assignedBy", "name email")
            .populate("memberProgress.user", "name email")
            .populate("comments.user", "name email");

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        // Standard users can only view tasks assigned to them
        if (
            req.user.role === "user" &&
            !isUserAssignedToTask(task, req.user.id)
        ) {
            return res.status(403).json({
                message: "You are not authorized to view this task"
            });
        }

        res.status(200).json({
            task: formatTaskForUser(task, req.user)
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch task",
            error: error.message
        });
    }
};


// ===============================
// Update Task Status
// ===============================
const updateTaskStatus = async (req, res) => {
    try {
        const { status, userId } = req.body;

        const allowedStatus = [
            "Pending",
            "In Progress",
            "Completed"
        ];

        if (!allowedStatus.includes(status)) {
            return res.status(400).json({
                message: "Invalid task status"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid task ID"
            });
        }

        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        // User can update only their own task
        if (
            req.user.role === "user" &&
            !isUserAssignedToTask(task, req.user.id)
        ) {
            return res.status(403).json({
                message: "You can update only your own tasks"
            });
        }

        ensureMemberProgressInitialized(task);

        if (req.user.role === "user") {
            const targetUserId = toIdString(req.user.id);
            const memberEntry = task.memberProgress.find(
                (mp) => toIdString(mp.user) === targetUserId
            );

            if (memberEntry) {
                memberEntry.status = status;
                if (status === "Pending") {
                    memberEntry.progress = 0;
                } else if (status === "In Progress" && memberEntry.progress === 0) {
                    memberEntry.progress = 10;
                } else if (status === "Completed") {
                    memberEntry.progress = 100;
                }
                memberEntry.updatedAt = new Date();
            }

            syncTaskAggregateFromMembers(task);
        } else {
            // Admin update
            if (userId) {
                const targetUserId = toIdString(userId);
                const memberEntry = task.memberProgress.find(
                    (mp) => toIdString(mp.user) === targetUserId
                );
                if (!memberEntry) {
                    return res.status(404).json({
                        message: "Specified user is not assigned to this task"
                    });
                }
                memberEntry.status = status;
                if (status === "Pending") {
                    memberEntry.progress = 0;
                } else if (status === "In Progress" && memberEntry.progress === 0) {
                    memberEntry.progress = 10;
                } else if (status === "Completed") {
                    memberEntry.progress = 100;
                }
                memberEntry.updatedAt = new Date();
                syncTaskAggregateFromMembers(task);
            } else {
                task.status = status;
                if (status === "Pending") {
                    task.progress = 0;
                    task.memberProgress.forEach((mp) => {
                        mp.status = "Pending";
                        mp.progress = 0;
                        mp.updatedAt = new Date();
                    });
                } else if (status === "In Progress" && task.progress === 0) {
                    task.progress = 10;
                } else if (status === "Completed") {
                    task.progress = 100;
                    task.memberProgress.forEach((mp) => {
                        mp.status = "Completed";
                        mp.progress = 100;
                        mp.updatedAt = new Date();
                    });
                }
            }
        }

        await task.save();

        const populatedTask = await Task.findById(task._id)
            .populate("assignedTo", "name email role")
            .populate("assignedBy", "name email")
            .populate("memberProgress.user", "name email");

        res.status(200).json({
            message: "Task status updated successfully",
            task: formatTaskForUser(populatedTask, req.user)
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to update task status",
            error: error.message
        });
    }
};


// ===============================
// Update Task Progress
// ===============================
const updateTaskProgress = async (req, res) => {
    try {
        const { progress, userId } = req.body;
        const numProgress = Number(progress);

        if (
            progress === undefined ||
            progress === null ||
            isNaN(numProgress) ||
            numProgress < 0 ||
            numProgress > 100
        ) {
            return res.status(400).json({
                message: "Progress must be between 0 and 100"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid task ID"
            });
        }

        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        // User can update only their own task
        if (
            req.user.role === "user" &&
            !isUserAssignedToTask(task, req.user.id)
        ) {
            return res.status(403).json({
                message: "You can update only your own tasks"
            });
        }

        ensureMemberProgressInitialized(task);

        const deriveStatus = (p) => {
            if (p === 0) return "Pending";
            if (p === 100) return "Completed";
            return "In Progress";
        };

        if (req.user.role === "user") {
            const targetUserId = toIdString(req.user.id);
            const memberEntry = task.memberProgress.find(
                (mp) => toIdString(mp.user) === targetUserId
            );

            if (memberEntry) {
                memberEntry.progress = numProgress;
                memberEntry.status = deriveStatus(numProgress);
                memberEntry.updatedAt = new Date();
            }

            syncTaskAggregateFromMembers(task);
        } else {
            // Admin update
            if (userId) {
                const targetUserId = toIdString(userId);
                const memberEntry = task.memberProgress.find(
                    (mp) => toIdString(mp.user) === targetUserId
                );
                if (!memberEntry) {
                    return res.status(404).json({
                        message: "Specified user is not assigned to this task"
                    });
                }
                memberEntry.progress = numProgress;
                memberEntry.status = deriveStatus(numProgress);
                memberEntry.updatedAt = new Date();
                syncTaskAggregateFromMembers(task);
            } else {
                task.progress = numProgress;
                task.status = deriveStatus(numProgress);
                if (task.assignedTo.length === 1 && task.memberProgress.length === 1) {
                    task.memberProgress[0].progress = numProgress;
                    task.memberProgress[0].status = deriveStatus(numProgress);
                    task.memberProgress[0].updatedAt = new Date();
                } else if (numProgress === 0 || numProgress === 100) {
                    task.memberProgress.forEach((mp) => {
                        mp.progress = numProgress;
                        mp.status = deriveStatus(numProgress);
                        mp.updatedAt = new Date();
                    });
                }
            }
        }

        await task.save();

        const populatedTask = await Task.findById(task._id)
            .populate("assignedTo", "name email role")
            .populate("assignedBy", "name email")
            .populate("memberProgress.user", "name email");

        res.status(200).json({
            message: "Task progress updated successfully",
            task: formatTaskForUser(populatedTask, req.user)
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to update task progress",
            error: error.message
        });
    }
};


// ===============================
// Update Task / Reassign Members - Admin Only
// ===============================
const updateTask = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid task ID"
            });
        }

        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        const {
            title,
            description,
            assignedTo,
            priority,
            dueDate
        } = req.body;

        if (title !== undefined) {
            if (!String(title).trim()) {
                return res.status(400).json({
                    message: "Task title cannot be empty"
                });
            }
            task.title = String(title).trim();
        }

        if (description !== undefined) {
            if (!String(description).trim()) {
                return res.status(400).json({
                    message: "Task description cannot be empty"
                });
            }
            task.description = String(description).trim();
        }

        if (priority !== undefined) {
            const normalizedPriority = normalizePriority(priority);
            if (!normalizedPriority) {
                return res.status(400).json({
                    message: "Invalid priority value"
                });
            }
            task.priority = normalizedPriority;
        }

        if (dueDate !== undefined) {
            const parsedDate = new Date(dueDate);
            if (isNaN(parsedDate.getTime())) {
                return res.status(400).json({
                    message: "Invalid due date"
                });
            }
            task.dueDate = parsedDate;
        }

        if (assignedTo !== undefined) {
            const validation = await validateAndResolveAssignees(assignedTo);
            if (validation.error) {
                return res.status(validation.statusCode).json({
                    message: validation.error
                });
            }

            // Ensure existing memberProgress is initialized before updating assignees
            ensureMemberProgressInitialized(task);

            const existingProgressMap = new Map();
            for (const mp of task.memberProgress) {
                existingProgressMap.set(toIdString(mp.user), {
                    user: mp.user,
                    status: mp.status || "Pending",
                    progress: mp.progress ?? 0,
                    updatedAt: mp.updatedAt || new Date()
                });
            }

            task.assignedTo = validation.assigneeIds;
            task.memberProgress = validation.assigneeIds.map((uid) => {
                if (existingProgressMap.has(uid)) {
                    return existingProgressMap.get(uid);
                }
                return {
                    user: uid,
                    status: "Pending",
                    progress: 0,
                    updatedAt: new Date()
                };
            });

            syncTaskAggregateFromMembers(task);
        }

        await task.save();

        const populatedTask = await Task.findById(task._id)
            .populate("assignedTo", "name email role")
            .populate("assignedBy", "name email")
            .populate("memberProgress.user", "name email");

        res.status(200).json({
            message: "Task updated successfully",
            task: formatTaskForUser(populatedTask, req.user)
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to update task",
            error: error.message
        });
    }
};


// ===============================
// Delete Task - Admin
// ===============================
const deleteTask = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid task ID"
            });
        }

        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        await Task.findByIdAndDelete(req.params.id);

        res.status(200).json({
            message: "Task deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to delete task",
            error: error.message
        });
    }
};


module.exports = {
    createTask,
    getAllTasks,
    getMyTasks,
    getTaskById,
    updateTaskStatus,
    updateTaskProgress,
    updateTask,
    deleteTask,
    normalizeLegacyTasksInDb
};