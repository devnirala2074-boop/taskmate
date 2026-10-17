import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import API from "../../services/api";
import "../../styles/allTasks.css";

const AllTasks = () => {
    const { user, token, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchTasks = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await API.get("/tasks/all", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setTasks(response.data.tasks || []);
        } catch (err) {
            console.error("Fetch tasks error:", err);

            setError(
                err.response?.data?.message ||
                "Failed to load tasks."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchTasks();
        }
    }, [token]);

    const handleDelete = async (taskId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this task?"
        );

        if (!confirmed) {
            return;
        }

        try {
            await API.delete(`/tasks/${taskId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setTasks((prevTasks) =>
                prevTasks.filter((task) => task._id !== taskId)
            );
        } catch (err) {
            console.error("Delete task error:", err);

            setError(
                err.response?.data?.message ||
                "Failed to delete task."
            );
        }
    };

    const getStatusClass = (status) => {
        return status
            ?.toLowerCase()
            .replace(/\s+/g, "-");
    };

    const getPriorityClass = (priority) => {
        return priority?.toLowerCase();
    };

    return (
        <div className="all-tasks-page">

            <div className="all-tasks-orb orb-one"></div>
            <div className="all-tasks-orb orb-two"></div>

            {/* Header */}
            <header className="all-tasks-header glass-panel">

                <div className="all-tasks-brand">
                    <div className="all-tasks-logo">
                        ✓
                    </div>

                    <div>
                        <h2>TaskMate</h2>
                        <span>Admin Workspace</span>
                    </div>
                </div>

                <div className="all-tasks-user">

                    <div className="all-tasks-avatar">
                        {user?.name
                            ?.charAt(0)
                            .toUpperCase() || "A"}
                    </div>

                    <div>
                        <strong>
                            {user?.name || "Admin"}
                        </strong>

                        <span>
                            Administrator
                        </span>
                    </div>

                    <button
                        className="admin-logout-btn"
                        onClick={handleLogout}
                        title="Sign out of TaskMate"
                    >
                        <span>↪</span>
                        Logout
                    </button>

                </div>

            </header>

            {/* Layout */}
            <div className="all-tasks-layout">

                {/* Sidebar */}
                <aside className="all-tasks-sidebar glass-panel">

                    <div className="all-tasks-label">
                        WORKSPACE
                    </div>

                    <button
                        className="all-tasks-nav-item"
                        onClick={() =>
                            navigate("/admin/dashboard")
                        }
                    >
                        <span>⌂</span>
                        Dashboard
                    </button>

                    <button
                        className="all-tasks-nav-item active"
                    >
                        <span>✓</span>
                        Tasks
                    </button>

                    <button
                        className="all-tasks-nav-item"
                        onClick={() =>
                            navigate("/admin/users")
                        }
                    >
                        <span>♟</span>
                        Users
                    </button>

                    <button
                        className="all-tasks-nav-item"
                        onClick={() =>
                            navigate("/admin/activity")
                        }
                    >
                        <span>◷</span>
                        Activity
                    </button>

                    <div className="all-tasks-divider"></div>

                    <div className="all-tasks-label">
                        MANAGEMENT
                    </div>

                    <button
                        className="all-tasks-nav-item"
                        onClick={() =>
                            navigate("/admin/create-task")
                        }
                    >
                        <span>＋</span>
                        Create Task
                    </button>

                    <button
                        className="all-tasks-nav-item"
                        onClick={() =>
                            navigate("/admin/settings")
                        }
                    >
                        <span>⚙</span>
                        Settings
                    </button>

                    <button
                        className="all-tasks-nav-item logout-btn"
                        onClick={handleLogout}
                    >
                        <span>↪</span>
                        Logout
                    </button>

                </aside>

                {/* Main Content */}
                <main className="all-tasks-content">

                    <div className="all-tasks-title-section">

                        <div>
                            <span className="all-tasks-badge">
                                ✦ TASK MANAGEMENT
                            </span>

                            <h1>
                                All <span>Tasks.</span>
                            </h1>

                            <p>
                                View, monitor and manage all
                                assigned tasks.
                            </p>
                        </div>

                        <button
                            className="all-tasks-create-button"
                            onClick={() =>
                                navigate("/admin/create-task")
                            }
                        >
                            <span>＋</span>
                            Create Task
                        </button>

                    </div>

                    {error && (
                        <div className="all-tasks-error">
                            {error}
                        </div>
                    )}

                    <div className="all-tasks-card glass-panel">

                        <div className="all-tasks-card-header">

                            <div>
                                <h2>Task List</h2>
                                <p>
                                    {tasks.length}{" "}
                                    {tasks.length === 1
                                        ? "task"
                                        : "tasks"}{" "}
                                    total
                                </p>
                            </div>

                            <button
                                className="refresh-button"
                                onClick={fetchTasks}
                            >
                                ↻ Refresh
                            </button>

                        </div>

                        {loading ? (
                            <div className="all-tasks-empty">
                                <div className="all-tasks-empty-icon">
                                    ◷
                                </div>

                                <h3>
                                    Loading tasks...
                                </h3>

                                <p>
                                    Fetching task information.
                                </p>
                            </div>
                        ) : tasks.length === 0 ? (
                            <div className="all-tasks-empty">

                                <div className="all-tasks-empty-icon">
                                    ✓
                                </div>

                                <h3>
                                    No tasks found
                                </h3>

                                <p>
                                    Create a task to get started.
                                </p>

                                <button
                                    onClick={() =>
                                        navigate(
                                            "/admin/create-task"
                                        )
                                    }
                                >
                                    Create Task
                                </button>

                            </div>
                        ) : (
                            <div className="tasks-table-wrapper">

                                <table className="tasks-table">

                                    <thead>
                                        <tr>
                                            <th>Task</th>
                                            <th>Assigned To</th>
                                            <th>Priority</th>
                                            <th>Status</th>
                                            <th>Progress</th>
                                            <th>Due Date</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>

                                    <tbody>

                                        {tasks.map((task) => (

                                            <tr key={task._id}>

                                                <td>
                                                    <div className="task-title-cell">

                                                        <div className="task-table-icon">
                                                            ✓
                                                        </div>

                                                        <div>
                                                            <strong>
                                                                {task.title}
                                                            </strong>

                                                            <span>
                                                                {task.description ||
                                                                    "No description"}
                                                            </span>
                                                        </div>

                                                    </div>
                                                </td>

                                                <td>
                                                    {(() => {
                                                        const assignees = Array.isArray(task.assignedTo)
                                                            ? task.assignedTo
                                                            : task.assignedTo
                                                            ? [task.assignedTo]
                                                            : [];
                                                        const firstUser = assignees[0];
                                                        const names = assignees
                                                            .map((u) => u?.name)
                                                            .filter(Boolean)
                                                            .join(", ");
                                                        const subText =
                                                            assignees.length > 1
                                                                ? `${assignees.length} members assigned`
                                                                : firstUser?.email || "";
                                                        return (
                                                            <div className="assigned-user">
                                                                <div className="assigned-avatar">
                                                                    {firstUser?.name
                                                                        ?.charAt(0)
                                                                        .toUpperCase() || "U"}
                                                                </div>
                                                                <div>
                                                                    <strong>
                                                                        {names || "Unassigned"}
                                                                    </strong>
                                                                    <span>{subText}</span>
                                                                </div>
                                                            </div>
                                                        );
                                                    })()}
                                                </td>

                                                <td>
                                                    <span
                                                        className={`task-priority-badge ${getPriorityClass(
                                                            task.priority
                                                        )}`}
                                                    >
                                                        {task.priority}
                                                    </span>
                                                </td>

                                                <td>
                                                    <span
                                                        className={`task-status-badge ${getStatusClass(
                                                            task.status
                                                        )}`}
                                                    >
                                                        {task.status}
                                                    </span>
                                                </td>

                                                <td>

                                                    <div className="table-progress">

                                                        <div className="table-progress-top">
                                                            <span>
                                                                {task.progress ?? 0}%
                                                            </span>
                                                        </div>

                                                        <div className="table-progress-bar">
                                                            <div
                                                                className="table-progress-fill"
                                                                style={{
                                                                    width: `${task.progress ?? 0}%`
                                                                }}
                                                            ></div>
                                                        </div>

                                                    </div>

                                                </td>

                                                <td>
                                                    <span className="task-due-date">
                                                        {task.dueDate
                                                            ? new Date(
                                                                  task.dueDate
                                                              ).toLocaleDateString(
                                                                  "en-IN",
                                                                  {
                                                                      day: "2-digit",
                                                                      month: "short",
                                                                      year: "numeric"
                                                                  }
                                                              )
                                                            : "—"}
                                                    </span>
                                                </td>

                                                <td>

                                                    <div className="task-actions">

                                                        <button
                                                            className="task-view-button"
                                                            onClick={() =>
                                                                navigate(
                                                                    `/admin/tasks/${task._id}`
                                                                )
                                                            }
                                                        >
                                                            View
                                                        </button>

                                                        <button
                                                            className="task-delete-button"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    task._id
                                                                )
                                                            }
                                                        >
                                                            Delete
                                                        </button>

                                                    </div>

                                                </td>

                                            </tr>

                                        ))}

                                    </tbody>

                                </table>

                            </div>
                        )}

                    </div>

                </main>

            </div>

            <footer className="all-tasks-footer">
                <span>© 2026 TaskMate</span>
                <span>Admin Workspace</span>
                <span>Build Better. Together.</span>
            </footer>

        </div>
    );
};

export default AllTasks;