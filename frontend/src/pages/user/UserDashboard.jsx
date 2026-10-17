import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import API from "../../services/api";
import "../../styles/userDashboard.css";

const UserDashboard = () => {
    const { user, token } = useAuth();
    const navigate = useNavigate();

    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");

    useEffect(() => {
        const fetchMyTasks = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await API.get("/tasks/my-tasks", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                setTasks(response.data.tasks || []);
            } catch (err) {
                console.error("User dashboard error:", err);
                setError(
                    err.response?.data?.message ||
                    "Failed to load your tasks."
                );
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchMyTasks();
        }
    }, [token]);

    const totalTasks = tasks.length;

    const pendingTasks = tasks.filter(
        (task) => task.status === "Pending"
    ).length;

    const inProgressTasks = tasks.filter(
        (task) => task.status === "In Progress"
    ).length;

    const completedTasks = tasks.filter(
        (task) => task.status === "Completed"
    ).length;

    const completionRate = totalTasks > 0
        ? Math.round((completedTasks / totalTasks) * 100)
        : 0;

    const getProgress = (task) => {
        return task.progress ?? 0;
    };

    const getPriorityClass = (priority) => {
        return priority?.toLowerCase() || "medium";
    };

    const handleViewTask = (taskId) => {
        navigate(`/user/tasks/${taskId}`);
    };

    const todayFormatted = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric"
    });

    const filteredTasks = tasks.filter((task) => {
        if (filterStatus === "all") return true;
        return task.status === filterStatus;
    });

    return (
        <main className="user-dashboard-content">
            {/* WELCOME */}
            <section className="user-welcome">
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                        <span className="user-dashboard-badge">
                            ✦ MY WORKSPACE
                        </span>
                        <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "500" }}>
                            {todayFormatted}
                        </span>
                    </div>

                    <h1>
                        Welcome back,{" "}
                        <span>
                            {user?.name?.split(" ")[0] || "User"}.
                        </span>
                    </h1>

                    <p>
                        Stay focused, track your completion velocity, and build great results together.
                    </p>
                </div>
            </section>

            {/* ERROR */}
            {error && (
                <div className="user-dashboard-error">
                    {error}
                </div>
            )}

            {/* 4 STATS CARDS */}
            <section className="user-stats-grid">
                <div className="user-stat-card glass-panel">
                    <div className="user-stat-icon blue">
                        ✓
                    </div>

                    <div className="user-stat-info">
                        <span>My Tasks</span>
                        <strong>
                            {loading ? "—" : totalTasks}
                        </strong>
                    </div>

                    <small>
                        Assigned to you
                    </small>
                </div>

                <div className="user-stat-card glass-panel">
                    <div className="user-stat-icon orange">
                        ◐
                    </div>

                    <div className="user-stat-info">
                        <span>In Progress</span>
                        <strong>
                            {loading ? "—" : inProgressTasks}
                        </strong>
                    </div>

                    <small>
                        Currently active
                    </small>
                </div>

                <div className="user-stat-card glass-panel">
                    <div className="user-stat-icon green">
                        ✓
                    </div>

                    <div className="user-stat-info">
                        <span>Completed</span>
                        <strong>
                            {loading ? "—" : completedTasks}
                        </strong>
                    </div>

                    <small>
                        {completionRate}% finished
                    </small>
                </div>

                <div className="user-stat-card glass-panel">
                    <div className="user-stat-icon yellow">
                        ◷
                    </div>

                    <div className="user-stat-info">
                        <span>Pending</span>
                        <strong>
                            {loading ? "—" : pendingTasks}
                        </strong>
                    </div>

                    <small>
                        Waiting to start
                    </small>
                </div>
            </section>

            {/* FILTER TABS */}
            <div className="user-filter-tabs">
                <button
                    className={`user-filter-tab ${filterStatus === "all" ? "active" : ""}`}
                    onClick={() => setFilterStatus("all")}
                >
                    All Tasks
                    <span className="user-tab-badge">{totalTasks}</span>
                </button>

                <button
                    className={`user-filter-tab ${filterStatus === "In Progress" ? "active" : ""}`}
                    onClick={() => setFilterStatus("In Progress")}
                >
                    In Progress
                    <span className="user-tab-badge">{inProgressTasks}</span>
                </button>

                <button
                    className={`user-filter-tab ${filterStatus === "Completed" ? "active" : ""}`}
                    onClick={() => setFilterStatus("Completed")}
                >
                    Completed
                    <span className="user-tab-badge">{completedTasks}</span>
                </button>

                <button
                    className={`user-filter-tab ${filterStatus === "Pending" ? "active" : ""}`}
                    onClick={() => setFilterStatus("Pending")}
                >
                    Pending
                    <span className="user-tab-badge">{pendingTasks}</span>
                </button>
            </div>

            {/* SPLIT LAYOUT: TASK LIST + PRODUCTIVITY INSIGHTS */}
            <div className="user-dashboard-split">
                {/* MY TASKS LIST */}
                <section className="my-tasks-card glass-panel">
                    <div className="user-section-heading">
                        <div>
                            <h2>
                                {filterStatus === "all" ? "Assigned Tasks" : `${filterStatus} Tasks`}
                            </h2>
                            <p>
                                Showing {filteredTasks.length} of {totalTasks} total tasks
                            </p>
                        </div>

                        <span className="task-count">
                            {filteredTasks.length} Tasks
                        </span>
                    </div>

                    {/* LOADING */}
                    {loading && (
                        <div className="user-empty-state">
                            <div className="user-empty-icon">◷</div>
                            <h3>Loading your tasks...</h3>
                            <p>Fetching tasks assigned to you.</p>
                        </div>
                    )}

                    {/* EMPTY */}
                    {!loading && !error && filteredTasks.length === 0 && (
                        <div className="user-empty-state">
                            <div className="user-empty-icon">✓</div>
                            <h3>No tasks in this view</h3>
                            <p>
                                {totalTasks === 0
                                    ? "You don't have any tasks assigned to you yet."
                                    : `There are no ${filterStatus.toLowerCase()} tasks right now.`}
                            </p>
                        </div>
                    )}

                    {/* TASK LIST */}
                    {!loading && !error && filteredTasks.length > 0 && (
                        <div className="user-task-list">
                            {filteredTasks.map((task) => (
                                <article
                                    className="user-task-card"
                                    key={task._id}
                                    style={{ cursor: "pointer" }}
                                    onClick={() => handleViewTask(task._id)}
                                >
                                    {/* TOP */}
                                    <div className="user-task-top">
                                        <div className="user-task-title-area">
                                            <div className="user-task-icon">
                                                ✓
                                            </div>

                                            <div>
                                                <h3>{task.title}</h3>
                                                <p>{task.description}</p>
                                            </div>
                                        </div>

                                        <span
                                            className={`priority-badge ${getPriorityClass(
                                                task.priority
                                            )}`}
                                        >
                                            {task.priority || "Medium"}
                                        </span>
                                    </div>

                                    {/* META */}
                                    <div className="user-task-meta">
                                        <div>
                                            <span>STATUS</span>
                                            <strong
                                                className={`status-${task.status
                                                    .toLowerCase()
                                                    .replace(" ", "-")}`}
                                            >
                                                {task.status}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>DUE DATE</span>
                                            <strong>
                                                {task.dueDate
                                                    ? new Date(task.dueDate).toLocaleDateString("en-IN", {
                                                          day: "2-digit",
                                                          month: "short",
                                                          year: "numeric"
                                                      })
                                                    : "No date"}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>PROGRESS</span>
                                            <strong>{getProgress(task)}%</strong>
                                        </div>
                                    </div>

                                    {/* PROGRESS */}
                                    <div className="task-progress-section">
                                        <div className="task-progress-header">
                                            <span>Progress</span>
                                            <strong>{getProgress(task)}%</strong>
                                        </div>

                                        <div className="task-progress-bar">
                                            <div
                                                className="task-progress-fill"
                                                style={{
                                                    width: `${getProgress(task)}%`
                                                }}
                                            ></div>
                                        </div>
                                    </div>

                                    {/* ACTION */}
                                    <div className="user-task-action">
                                        <button
                                            className="view-task-button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleViewTask(task._id);
                                            }}
                                        >
                                            View Task Details
                                            <span>→</span>
                                        </button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>

                {/* PRODUCTIVITY & VELOCITY INSIGHTS */}
                <aside className="user-productivity-card glass-panel">
                    <div className="section-heading">
                        <div>
                            <h2>Velocity & Progress</h2>
                            <p>Your performance summary</p>
                        </div>
                    </div>

                    <div className="velocity-meter-card">
                        <div className="velocity-meter-header">
                            <span>Completion Rate</span>
                            <span style={{ color: "#34d399", fontWeight: "700" }}>{completionRate}%</span>
                        </div>
                        <div className="task-progress-bar" style={{ height: "10px" }}>
                            <div
                                className="task-progress-fill"
                                style={{
                                    width: `${completionRate}%`,
                                    background: "linear-gradient(90deg, #3b82f6, #10b981)"
                                }}
                            ></div>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px", fontSize: "11px", color: "#64748b" }}>
                            <span>{completedTasks} completed</span>
                            <span>{inProgressTasks + pendingTasks} remaining</span>
                        </div>
                    </div>

                    <div className="velocity-quote-box">
                        <p>
                            "Discipline turns plans into reality. Stay focused on your open milestones."
                        </p>
                        <span>— TaskMate Focus</span>
                    </div>

                    <button
                        className="create-task-button"
                        style={{ width: "100%", justifyContent: "center" }}
                        onClick={() => navigate("/user/tasks")}
                    >
                        <span>✓</span>
                        Go to My Tasks
                    </button>
                </aside>
            </div>
        </main>
    );
};

export default UserDashboard;