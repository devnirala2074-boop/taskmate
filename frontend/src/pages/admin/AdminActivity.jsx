import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import API from "../../services/api";
import "../../styles/activity.css";

const AdminActivity = () => {
    const { user, token, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");

    const fetchData = async () => {
        try {
            setLoading(true);
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const [tasksRes, usersRes] = await Promise.all([
                API.get("/tasks/all", config).catch(() => ({ data: { tasks: [] } })),
                API.get("/users", config).catch(() => ({ data: { users: [] } }))
            ]);

            setTasks(tasksRes.data.tasks || []);
            setUsers(usersRes.data.users || []);
        } catch (err) {
            console.error("Activity load error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchData();
        }
    }, [token]);

    // Build timeline events from tasks & users
    const buildTimeline = () => {
        const events = [];

        const getAssigneeNames = (assignedTo, fallback = "Team Member") => {
            if (!assignedTo) return fallback;
            const list = Array.isArray(assignedTo) ? assignedTo : [assignedTo];
            const names = list.map((u) => u?.name).filter(Boolean).join(", ");
            return names || fallback;
        };

        // Tasks events
        tasks.forEach((t) => {
            const assigneeLabel = getAssigneeNames(t.assignedTo, "Team Member");
            // Task creation event
            events.push({
                id: `create-${t._id}`,
                type: "task-create",
                category: "tasks",
                icon: "＋",
                iconClass: "task",
                title: t.title,
                message: (
                    <>
                        Task <strong>"{t.title}"</strong> was assigned to{" "}
                        <strong>{assigneeLabel}</strong> with{" "}
                        <span className={`priority-pill ${t.priority?.toLowerCase()}`}>
                            {t.priority}
                        </span>{" "}
                        priority.
                    </>
                ),
                timestamp: new Date(t.createdAt || Date.now()),
                status: t.status
            });

            // If task is in-progress or completed
            if (t.status === "Completed") {
                events.push({
                    id: `comp-${t._id}`,
                    type: "completed",
                    category: "milestones",
                    icon: "✓",
                    iconClass: "completed",
                    title: t.title,
                    message: (
                        <>
                            <strong>{getAssigneeNames(t.assignedTo, "User")}</strong> completed task{" "}
                            <strong>"{t.title}"</strong> (100% progress).
                        </>
                    ),
                    timestamp: new Date(t.updatedAt || t.createdAt),
                    status: "Completed"
                });
            } else if (t.status === "In Progress" || t.progress > 0) {
                events.push({
                    id: `prog-${t._id}`,
                    type: "progress",
                    category: "tasks",
                    icon: "◐",
                    iconClass: "progress",
                    title: t.title,
                    message: (
                        <>
                            Task <strong>"{t.title}"</strong> is currently in progress at{" "}
                            <strong>{t.progress}%</strong> by{" "}
                            <strong>{getAssigneeNames(t.assignedTo, "User")}</strong>.
                        </>
                    ),
                    timestamp: new Date(t.updatedAt || t.createdAt),
                    status: "In Progress"
                });
            }
        });

        // User join events
        users.forEach((u) => {
            events.push({
                id: `user-${u._id}`,
                type: "user-joined",
                category: "team",
                icon: "♟",
                iconClass: "user",
                title: u.name,
                message: (
                    <>
                        <strong>{u.name}</strong> joined TaskMate as a{" "}
                        <span style={{ textTransform: "capitalize", color: "#93c5fd" }}>
                            {u.role}
                        </span>
                        .
                    </>
                ),
                timestamp: new Date(u.createdAt || Date.now()),
                status: u.role
            });
        });

        // Sort descending by timestamp
        return events.sort((a, b) => b.timestamp - a.timestamp);
    };

    const allEvents = buildTimeline();

    const filteredEvents = allEvents.filter((item) => {
        if (filter === "all") return true;
        return item.category === filter;
    });

    const formatTimeAgo = (date) => {
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;

        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    };

    const completedCount = tasks.filter((t) => t.status === "Completed").length;
    const inProgressCount = tasks.filter((t) => t.status === "In Progress").length;

    return (
        <div className="admin-dashboard">
            {/* Header */}
            <header className="dashboard-header glass-panel">
                <div className="dashboard-brand">
                    <div className="dashboard-logo">✓</div>
                    <div>
                        <h2>TaskMate</h2>
                        <span>Admin Workspace</span>
                    </div>
                </div>

                <div className="dashboard-user">
                    <div className="user-avatar">
                        {user?.name?.charAt(0).toUpperCase() || "A"}
                    </div>
                    <div className="user-info">
                        <strong>{user?.name || "Admin"}</strong>
                        <span>Administrator</span>
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
            <div className="dashboard-layout">
                {/* Sidebar */}
                <aside className="dashboard-sidebar glass-panel">
                    <div className="sidebar-label">WORKSPACE</div>
                    <button
                        className="sidebar-item"
                        onClick={() => navigate("/admin/dashboard")}
                    >
                        <span>⌂</span> Dashboard
                    </button>
                    <button
                        className="sidebar-item"
                        onClick={() => navigate("/admin/tasks")}
                    >
                        <span>✓</span> Tasks
                    </button>
                    <button
                        className="sidebar-item"
                        onClick={() => navigate("/admin/users")}
                    >
                        <span>♟</span> Users
                    </button>
                    <button className="sidebar-item active">
                        <span>◷</span> Activity
                    </button>

                    <div className="sidebar-divider"></div>
                    <div className="sidebar-label">MANAGEMENT</div>
                    <button
                        className="sidebar-item"
                        onClick={() => navigate("/admin/create-task")}
                    >
                        <span>＋</span> Create Task
                    </button>
                    <button
                        className="sidebar-item"
                        onClick={() => navigate("/admin/settings")}
                    >
                        <span>⚙</span> Settings
                    </button>
                    <button
                        className="sidebar-item logout-btn"
                        onClick={handleLogout}
                    >
                        <span>↪</span>
                        Logout
                    </button>
                </aside>

                {/* Main Content */}
                <main className="dashboard-content activity-page">
                    <div className="activity-title-section">
                        <div>
                            <span className="dashboard-badge">✦ SYSTEM AUDIT LOG</span>
                            <h1>
                                Activity <span>Timeline.</span>
                            </h1>
                            <p>
                                Real-time audit trail and event tracking across all workspaces.
                            </p>
                        </div>

                        <button
                            className="all-tasks-create-button"
                            style={{ padding: "10px 18px", width: "auto" }}
                            onClick={fetchData}
                        >
                            <span>↻</span> Refresh Log
                        </button>
                    </div>

                    {/* Stats Strip */}
                    <div className="activity-stats-grid">
                        <div className="activity-stat-card">
                            <div className="activity-stat-icon blue">◷</div>
                            <div className="activity-stat-info">
                                <span>Total Events</span>
                                <strong>{allEvents.length}</strong>
                            </div>
                        </div>

                        <div className="activity-stat-card">
                            <div className="activity-stat-icon green">✓</div>
                            <div className="activity-stat-info">
                                <span>Completed</span>
                                <strong>{completedCount}</strong>
                            </div>
                        </div>

                        <div className="activity-stat-card">
                            <div className="activity-stat-icon orange">◐</div>
                            <div className="activity-stat-info">
                                <span>In Progress</span>
                                <strong>{inProgressCount}</strong>
                            </div>
                        </div>

                        <div className="activity-stat-card">
                            <div className="activity-stat-icon purple">♟</div>
                            <div className="activity-stat-info">
                                <span>Team Members</span>
                                <strong>{users.length}</strong>
                            </div>
                        </div>
                    </div>

                    {/* Timeline Feed Card */}
                    <div className="activity-card glass-panel">
                        <div className="activity-card-header">
                            <div>
                                <h2>Recent System Activity</h2>
                                <p>Showing latest events in chronological order</p>
                            </div>

                            <div className="activity-filter-tabs">
                                <button
                                    className={`activity-filter-btn ${
                                        filter === "all" ? "active" : ""
                                    }`}
                                    onClick={() => setFilter("all")}
                                >
                                    All ({allEvents.length})
                                </button>
                                <button
                                    className={`activity-filter-btn ${
                                        filter === "tasks" ? "active" : ""
                                    }`}
                                    onClick={() => setFilter("tasks")}
                                >
                                    Tasks
                                </button>
                                <button
                                    className={`activity-filter-btn ${
                                        filter === "milestones" ? "active" : ""
                                    }`}
                                    onClick={() => setFilter("milestones")}
                                >
                                    Milestones
                                </button>
                                <button
                                    className={`activity-filter-btn ${
                                        filter === "team" ? "active" : ""
                                    }`}
                                    onClick={() => setFilter("team")}
                                >
                                    Team
                                </button>
                            </div>
                        </div>

                        {loading ? (
                            <div className="activity-empty">
                                <div className="activity-empty-icon">◷</div>
                                <h3>Loading activity stream...</h3>
                                <p>Compiling real-time system logs.</p>
                            </div>
                        ) : filteredEvents.length === 0 ? (
                            <div className="activity-empty">
                                <div className="activity-empty-icon">✓</div>
                                <h3>No activity logged yet</h3>
                                <p>Events will appear here as tasks and users are updated.</p>
                            </div>
                        ) : (
                            <div className="activity-timeline">
                                {filteredEvents.map((evt) => (
                                    <div className="activity-item" key={evt.id}>
                                        <div
                                            className={`activity-icon-badge ${evt.iconClass}`}
                                        >
                                            {evt.icon}
                                        </div>
                                        <div className="activity-content">
                                            <div className="activity-message">
                                                {evt.message}
                                            </div>
                                            <div className="activity-time">
                                                <span>◷ {formatTimeAgo(evt.timestamp)}</span>
                                                <span>•</span>
                                                <span>
                                                    {evt.timestamp.toLocaleDateString("en-IN", {
                                                        day: "2-digit",
                                                        month: "short",
                                                        hour: "2-digit",
                                                        minute: "2-digit"
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminActivity;
