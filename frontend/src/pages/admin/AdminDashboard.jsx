import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import API from "../../services/api";
import "../../styles/adminDashboard.css";

const AdminDashboard = () => {
    const { user, token, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                setError("");

                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                };

                const [tasksResponse, usersResponse] = await Promise.all([
                    API.get("/tasks/all", config),
                    API.get("/users", config)
                ]);

                setTasks(tasksResponse.data.tasks || []);
                setUsers(usersResponse.data.users || []);

            } catch (err) {
                console.error("Dashboard data error:", err);
                setError(
                    err.response?.data?.message ||
                    "Failed to load dashboard data."
                );
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchDashboardData();
        }
    }, [token]);

    /* =========================================
       STATISTICS CALCULATIONS
    ========================================= */

    const totalTasks = tasks.length;

    const inProgressTasks = tasks.filter(
        (task) => task.status === "In Progress"
    ).length;

    const completedTasks = tasks.filter(
        (task) => task.status === "Completed"
    ).length;

    const pendingTasks = tasks.filter(
        (task) => task.status === "Pending"
    ).length;

    const teamMembers = users.filter(
        (member) => member.role === "user"
    ).length;

    const completionRate = totalTasks > 0
        ? Math.round((completedTasks / totalTasks) * 100)
        : 0;

    const completedRate = completionRate;

    const inProgressRate = totalTasks > 0
        ? Math.round((inProgressTasks / totalTasks) * 100)
        : 0;

    const pendingRate = totalTasks > 0
        ? Math.round((pendingTasks / totalTasks) * 100)
        : 0;

    /* Donut Chart SVG calculations */
    const radius = 38;
    const circumference = 2 * Math.PI * radius; // ~238.76

    const completedDash = totalTasks > 0 ? (completedTasks / totalTasks) * circumference : 0;
    const inProgressDash = totalTasks > 0 ? (inProgressTasks / totalTasks) * circumference : 0;
    const pendingDash = totalTasks > 0 ? (pendingTasks / totalTasks) * circumference : 0;

    const completedOffset = 0;
    const inProgressOffset = -completedDash;
    const pendingOffset = -(completedDash + inProgressDash);

    /* =========================================
       FILTERED RECENT TASKS
    ========================================= */

    const sortedTasks = [...tasks].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    const getAssignedNames = (assignedTo) => {
        if (!assignedTo) return "";
        const list = Array.isArray(assignedTo) ? assignedTo : [assignedTo];
        return list.map((u) => u?.name).filter(Boolean).join(", ");
    };

    const filteredTasks = sortedTasks.filter((task) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
            task.title?.toLowerCase().includes(q) ||
            getAssignedNames(task.assignedTo).toLowerCase().includes(q) ||
            task.status?.toLowerCase().includes(q)
        );
    });

    const recentTasks = filteredTasks.slice(0, 6);

    return (
        <div className="admin-dashboard">
            {/* Ambient Background Glows */}
            <div className="dashboard-orb orb-one"></div>
            <div className="dashboard-orb orb-two"></div>

            {/* =========================================
                HEADER
            ========================================= */}
            <header className="dashboard-header glass-panel">
                <div className="dashboard-brand">
                    <div className="dashboard-logo">
                        ✓
                    </div>
                    <div>
                        <h2>TaskMate</h2>
                        <span>Admin Workspace</span>
                    </div>
                </div>

                {/* Center Search Bar */}
                <div className="header-search-bar">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="Search tasks, team members..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Header Actions */}
                <div className="header-right-actions">
                    <button
                        className="header-notification-btn"
                        title="Notifications"
                        onClick={() => navigate("/admin/activity")}
                    >
                        <span>🔔</span>
                        <span className="header-notification-dot"></span>
                    </button>

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
                </div>
            </header>

            {/* =========================================
                LAYOUT
            ========================================= */}
            <div className="dashboard-layout">
                {/* =========================================
                    SIDEBAR
                ========================================= */}
                <aside className="dashboard-sidebar glass-panel">
                    <div className="sidebar-label">WORKSPACE</div>

                    <button className="sidebar-item active">
                        <span>⌂</span>
                        Dashboard
                    </button>

                    <button
                        className="sidebar-item"
                        onClick={() => navigate("/admin/tasks")}
                    >
                        <span>✓</span>
                        Tasks
                    </button>

                    <button
                        className="sidebar-item"
                        onClick={() => navigate("/admin/users")}
                    >
                        <span>♟</span>
                        Users
                    </button>

                    <button
                        className="sidebar-item"
                        onClick={() => navigate("/admin/activity")}
                    >
                        <span>◷</span>
                        Activity
                    </button>

                    <div className="sidebar-divider"></div>

                    <div className="sidebar-label">MANAGEMENT</div>

                    <button
                        className="sidebar-item"
                        onClick={() => navigate("/admin/create-task")}
                    >
                        <span>＋</span>
                        Create Task
                    </button>

                    <button
                        className="sidebar-item"
                        onClick={() => navigate("/admin/settings")}
                    >
                        <span>⚙</span>
                        Settings
                    </button>

                    <button
                        className="sidebar-item logout-btn"
                        onClick={handleLogout}
                    >
                        <span>↪</span>
                        Logout
                    </button>

                    {/* Sidebar Profile Card */}
                    <div className="sidebar-profile-card">
                        <div className="sidebar-profile-avatar">
                            {user?.name?.charAt(0).toUpperCase() || "A"}
                        </div>
                        <div className="sidebar-profile-info">
                            <strong>{user?.name || "Admin"}</strong>
                            <span>Administrator</span>
                        </div>
                    </div>
                </aside>

                {/* =========================================
                    MAIN CONTENT
                ========================================= */}
                <main className="dashboard-content">
                    {/* Welcome Section */}
                    <div className="welcome-section">
                        <div>
                            <span className="dashboard-badge">
                                ✦ ADMIN CONTROL CENTER
                            </span>
                            <h1>
                                Good to see you,{" "}
                                <span>
                                    {user?.name?.split(" ")[0] || "Admin"}.
                                </span>
                            </h1>
                            <p>
                                Manage your team, assign tasks, and monitor completion velocity from one unified dashboard.
                            </p>
                        </div>

                        <button
                            className="create-task-button"
                            onClick={() => navigate("/admin/create-task")}
                        >
                            <span>＋</span>
                            Create Task
                        </button>
                    </div>

                    {/* Error Notice */}
                    {error && (
                        <div className="dashboard-error">
                            {error}
                        </div>
                    )}

                    {/* =========================================
                        STATISTICS (4 Cards with Colored Accents)
                    ========================================= */}
                    <section className="stats-grid">
                        {/* Total Users / Team Members */}
                        <div className="stat-card glass-panel">
                            <div className="stat-top-meta">
                                <div className="stat-icon blue">
                                    ♟
                                </div>
                                <span className="stat-trend-badge blue">
                                    +12% active
                                </span>
                            </div>
                            <div>
                                <span>Team Members</span>
                                <strong>{loading ? "—" : teamMembers}</strong>
                            </div>
                            <small>Registered team members</small>
                        </div>

                        {/* Total Tasks */}
                        <div className="stat-card glass-panel">
                            <div className="stat-top-meta">
                                <div className="stat-icon purple">
                                    ✓
                                </div>
                                <span className="stat-trend-badge purple">
                                    All projects
                                </span>
                            </div>
                            <div>
                                <span>Total Tasks</span>
                                <strong>{loading ? "—" : totalTasks}</strong>
                            </div>
                            <small>Assigned across workspace</small>
                        </div>

                        {/* Completed Tasks */}
                        <div className="stat-card glass-panel">
                            <div className="stat-top-meta">
                                <div className="stat-icon green">
                                    ✓
                                </div>
                                <span className="stat-trend-badge green">
                                    {completionRate}% rate
                                </span>
                            </div>
                            <div>
                                <span>Completed</span>
                                <strong>{loading ? "—" : completedTasks}</strong>
                            </div>
                            <small>Successfully delivered</small>
                        </div>

                        {/* Pending & In Progress */}
                        <div className="stat-card glass-panel">
                            <div className="stat-top-meta">
                                <div className="stat-icon orange">
                                    ◷
                                </div>
                                <span className="stat-trend-badge orange">
                                    {pendingTasks} waiting
                                </span>
                            </div>
                            <div>
                                <span>In Pipeline</span>
                                <strong>{loading ? "—" : inProgressTasks + pendingTasks}</strong>
                            </div>
                            <small>{inProgressTasks} active, {pendingTasks} pending</small>
                        </div>
                    </section>

                    {/* =========================================
                        MIDDLE SECTION: DONUT CHART & QUICK ACTIONS
                    ========================================= */}
                    <section className="middle-section-grid">
                        {/* Task Overview SVG Donut Chart */}
                        <div className="task-overview-card glass-panel">
                            <div className="section-heading">
                                <div>
                                    <h2>Task Overview</h2>
                                    <p>Live status distribution & completion rate</p>
                                </div>
                                <span className="dashboard-badge">
                                    {completionRate}% DELIVERED
                                </span>
                            </div>

                            <div className="overview-content-split">
                                <div className="donut-chart-container">
                                    <svg viewBox="0 0 100 100" width="170" height="170">
                                        {/* Background Track */}
                                        <circle
                                            cx="50"
                                            cy="50"
                                            r={radius}
                                            fill="transparent"
                                            stroke="rgba(255, 255, 255, 0.06)"
                                            strokeWidth="11"
                                        />

                                        {totalTasks > 0 ? (
                                            <>
                                                {/* Completed Segment (Green) */}
                                                <circle
                                                    cx="50"
                                                    cy="50"
                                                    r={radius}
                                                    fill="transparent"
                                                    stroke="#10b981"
                                                    strokeWidth="11"
                                                    strokeDasharray={`${completedDash} ${circumference}`}
                                                    strokeDashoffset={completedOffset}
                                                    strokeLinecap="round"
                                                />
                                                {/* In Progress Segment (Blue) */}
                                                <circle
                                                    cx="50"
                                                    cy="50"
                                                    r={radius}
                                                    fill="transparent"
                                                    stroke="#3b82f6"
                                                    strokeWidth="11"
                                                    strokeDasharray={`${inProgressDash} ${circumference}`}
                                                    strokeDashoffset={inProgressOffset}
                                                    strokeLinecap="round"
                                                />
                                                {/* Pending Segment (Amber) */}
                                                <circle
                                                    cx="50"
                                                    cy="50"
                                                    r={radius}
                                                    fill="transparent"
                                                    stroke="#f59e0b"
                                                    strokeWidth="11"
                                                    strokeDasharray={`${pendingDash} ${circumference}`}
                                                    strokeDashoffset={pendingOffset}
                                                    strokeLinecap="round"
                                                />
                                            </>
                                        ) : (
                                            <circle
                                                cx="50"
                                                cy="50"
                                                r={radius}
                                                fill="transparent"
                                                stroke="rgba(59, 130, 246, 0.2)"
                                                strokeWidth="11"
                                            />
                                        )}
                                    </svg>

                                    <div className="donut-center-text">
                                        <span className="donut-center-number">
                                            {loading ? "…" : totalTasks}
                                        </span>
                                        <span className="donut-center-label">
                                            TOTAL TASKS
                                        </span>
                                    </div>
                                </div>

                                <div className="overview-legend-list">
                                    <div className="overview-legend-item">
                                        <div className="legend-item-left">
                                            <span className="legend-dot completed"></span>
                                            <span className="legend-label">Completed</span>
                                        </div>
                                        <div>
                                            <span className="legend-count">{completedTasks}</span>
                                            <span className="legend-pct">({completedRate}%)</span>
                                        </div>
                                    </div>

                                    <div className="overview-legend-item">
                                        <div className="legend-item-left">
                                            <span className="legend-dot in-progress"></span>
                                            <span className="legend-label">In Progress</span>
                                        </div>
                                        <div>
                                            <span className="legend-count">{inProgressTasks}</span>
                                            <span className="legend-pct">({inProgressRate}%)</span>
                                        </div>
                                    </div>

                                    <div className="overview-legend-item">
                                        <div className="legend-item-left">
                                            <span className="legend-dot pending"></span>
                                            <span className="legend-label">Pending</span>
                                        </div>
                                        <div>
                                            <span className="legend-count">{pendingTasks}</span>
                                            <span className="legend-pct">({pendingRate}%)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions Card */}
                        <div className="quick-actions-card glass-panel">
                            <div className="section-heading">
                                <div>
                                    <h2>Quick Actions</h2>
                                    <p>Frequent admin workspace shortcuts</p>
                                </div>
                            </div>

                            <div className="quick-actions-grid">
                                <button
                                    className="quick-action-btn primary"
                                    onClick={() => navigate("/admin/create-task")}
                                >
                                    <div className="quick-action-icon">＋</div>
                                    <span>Create New Task</span>
                                </button>

                                <button
                                    className="quick-action-btn"
                                    onClick={() => navigate("/admin/users")}
                                >
                                    <div className="quick-action-icon">♟</div>
                                    <span>Manage Users</span>
                                </button>

                                <button
                                    className="quick-action-btn"
                                    onClick={() => navigate("/admin/tasks")}
                                >
                                    <div className="quick-action-icon">✓</div>
                                    <span>View All Tasks</span>
                                </button>

                                <button
                                    className="quick-action-btn"
                                    onClick={() => navigate("/admin/settings")}
                                >
                                    <div className="quick-action-icon">⚙</div>
                                    <span>Settings</span>
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* =========================================
                        LOWER DASHBOARD (Recent Tasks & Team Overview)
                    ========================================= */}
                    <section className="dashboard-grid">
                        {/* Recent Tasks */}
                        <div className="activity-card glass-panel">
                            <div className="section-heading">
                                <div>
                                    <h2>Recent Tasks</h2>
                                    <p>
                                        {searchQuery ? `Filtered by "${searchQuery}"` : "Latest assigned work"}
                                    </p>
                                </div>

                                <button
                                    className="view-all-button"
                                    onClick={() => navigate("/admin/tasks")}
                                >
                                    View All →
                                </button>
                            </div>

                            {loading ? (
                                <div className="empty-state">
                                    <div className="empty-icon">◷</div>
                                    <h3>Loading tasks...</h3>
                                    <p>Fetching your latest workspace activity.</p>
                                </div>
                            ) : recentTasks.length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-icon">✓</div>
                                    <h3>No tasks found</h3>
                                    <p>
                                        {searchQuery
                                            ? "Try adjusting your search criteria."
                                            : "Create your first task to get started."}
                                    </p>
                                    <button
                                        className="empty-action"
                                        onClick={() => navigate("/admin/create-task")}
                                    >
                                        Create Task
                                    </button>
                                </div>
                            ) : (
                                <div className="recent-task-list">
                                    {recentTasks.map((task) => {
                                        const statusClass =
                                            task.status === "Completed"
                                                ? "completed"
                                                : task.status === "In Progress"
                                                ? "in-progress"
                                                : "pending";

                                        const priorityClass = (task.priority || "medium").toLowerCase();

                                        return (
                                            <div
                                                className="recent-task"
                                                key={task._id}
                                                style={{ cursor: "pointer" }}
                                                onClick={() => navigate(`/admin/tasks/${task._id}`)}
                                            >
                                                <div className="recent-task-icon">
                                                    ✓
                                                </div>

                                                <div className="recent-task-info">
                                                    <strong>{task.title}</strong>
                                                    <span>
                                                        Assigned to: {getAssignedNames(task.assignedTo) || "Unassigned"}
                                                    </span>
                                                </div>

                                                <span className={`priority-badge ${priorityClass}`}>
                                                    {task.priority || "Medium"}
                                                </span>

                                                <div className={`recent-task-status ${statusClass}`}>
                                                    {task.status}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Team Overview */}
                        <div className="activity-card glass-panel">
                            <div className="section-heading">
                                <div>
                                    <h2>Team Overview</h2>
                                    <p>Active workspace members</p>
                                </div>

                                <button
                                    className="view-all-button"
                                    onClick={() => navigate("/admin/users")}
                                >
                                    View All →
                                </button>
                            </div>

                            {loading ? (
                                <div className="empty-state">
                                    <div className="empty-icon">◷</div>
                                    <h3>Loading members...</h3>
                                </div>
                            ) : users.length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-icon">♟</div>
                                    <h3>No team members</h3>
                                </div>
                            ) : (
                                <div className="team-list">
                                    {users
                                        .filter((member) => member.role === "user")
                                        .slice(0, 6)
                                        .map((member) => (
                                            <div
                                                className="team-member"
                                                key={member._id}
                                                style={{ cursor: "pointer" }}
                                                onClick={() => navigate(`/admin/users/${member._id}`)}
                                            >
                                                <div className="team-avatar">
                                                    {member.name?.charAt(0).toUpperCase()}
                                                </div>

                                                <div>
                                                    <strong>{member.name}</strong>
                                                    <span>{member.email}</span>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            )}
                        </div>
                    </section>
                </main>
            </div>

            {/* Footer */}
            <footer className="dashboard-footer">
                <span>© 2026 TaskMate</span>
                <span>Admin Workspace</span>
                <span>Build Better. Together.</span>
            </footer>
        </div>
    );
};

export default AdminDashboard;