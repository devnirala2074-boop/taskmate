import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import API from "../../services/api";
import "../../styles/activity.css";

const UserActivity = () => {
    const { token } = useAuth();
    const navigate = useNavigate();

    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");

    const fetchMyTasks = async () => {
        try {
            setLoading(true);
            const response = await API.get("/tasks/my-tasks", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTasks(response.data.tasks || []);
        } catch (err) {
            console.error("User activity load error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchMyTasks();
        }
    }, [token]);

    // Build timeline for this user
    const buildTimeline = () => {
        const events = [];

        tasks.forEach((t) => {
            // Assigned
            events.push({
                id: `assign-${t._id}`,
                category: "assigned",
                icon: "✓",
                iconClass: "task",
                message: (
                    <>
                        You were assigned task <strong>"{t.title}"</strong> by{" "}
                        <strong>{t.assignedBy?.name || "Admin"}</strong> with{" "}
                        <span className={`priority-pill ${t.priority?.toLowerCase()}`}>
                            {t.priority}
                        </span>{" "}
                        priority.
                    </>
                ),
                timestamp: new Date(t.createdAt || Date.now()),
                taskId: t._id
            });

            // Milestone
            if (t.status === "Completed") {
                events.push({
                    id: `comp-${t._id}`,
                    category: "completed",
                    icon: "✓",
                    iconClass: "completed",
                    message: (
                        <>
                            You completed task <strong>"{t.title}"</strong> (100% progress).
                        </>
                    ),
                    timestamp: new Date(t.updatedAt || t.createdAt),
                    taskId: t._id
                });
            } else if (t.status === "In Progress" || t.progress > 0) {
                events.push({
                    id: `prog-${t._id}`,
                    category: "progress",
                    icon: "◐",
                    iconClass: "progress",
                    message: (
                        <>
                            You reached <strong>{t.progress}%</strong> progress on{" "}
                            <strong>"{t.title}"</strong>.
                        </>
                    ),
                    timestamp: new Date(t.updatedAt || t.createdAt),
                    taskId: t._id
                });
            }
        });

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
        <div className="activity-page">
            <div className="activity-title-section">
                <div>
                    <span className="user-dashboard-badge">✦ MY WORKSPACE TIMELINE</span>
                    <h1>
                        My <span>Activity.</span>
                    </h1>
                    <p>Track your task updates, milestones, and personal productivity history.</p>
                </div>

                <button
                    className="all-tasks-create-button"
                    style={{ padding: "10px 18px", width: "auto" }}
                    onClick={fetchMyTasks}
                >
                    <span>↻</span> Refresh
                </button>
            </div>

            {/* Stats Strip */}
            <div className="activity-stats-grid">
                <div className="activity-stat-card">
                    <div className="activity-stat-icon blue">✓</div>
                    <div className="activity-stat-info">
                        <span>Assigned Tasks</span>
                        <strong>{tasks.length}</strong>
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
                    <div className="activity-stat-icon purple">◷</div>
                    <div className="activity-stat-info">
                        <span>Activity Logs</span>
                        <strong>{allEvents.length}</strong>
                    </div>
                </div>
            </div>

            {/* Activity Stream Card */}
            <div className="activity-card glass-panel">
                <div className="activity-card-header">
                    <div>
                        <h2>Personal Audit Trail</h2>
                        <p>Latest actions and milestone achievements</p>
                    </div>

                    <div className="activity-filter-tabs">
                        <button
                            className={`activity-filter-btn ${filter === "all" ? "active" : ""}`}
                            onClick={() => setFilter("all")}
                        >
                            All ({allEvents.length})
                        </button>
                        <button
                            className={`activity-filter-btn ${filter === "progress" ? "active" : ""}`}
                            onClick={() => setFilter("progress")}
                        >
                            Updates
                        </button>
                        <button
                            className={`activity-filter-btn ${filter === "completed" ? "active" : ""}`}
                            onClick={() => setFilter("completed")}
                        >
                            Completed
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="activity-empty">
                        <div className="activity-empty-icon">◷</div>
                        <h3>Loading your activity...</h3>
                        <p>Fetching your personal log stream.</p>
                    </div>
                ) : filteredEvents.length === 0 ? (
                    <div className="activity-empty">
                        <div className="activity-empty-icon">✓</div>
                        <h3>No activity yet</h3>
                        <p>Work on your assigned tasks to see updates and milestones recorded here.</p>
                    </div>
                ) : (
                    <div className="activity-timeline">
                        {filteredEvents.map((evt) => (
                            <div className="activity-item" key={evt.id}>
                                <div className={`activity-icon-badge ${evt.iconClass}`}>
                                    {evt.icon}
                                </div>
                                <div className="activity-content">
                                    <div className="activity-message">
                                        {evt.message}
                                    </div>
                                    <div className="activity-time">
                                        <span>◷ {formatTimeAgo(evt.timestamp)}</span>
                                        <span>•</span>
                                        <button
                                            style={{
                                                background: "transparent",
                                                border: "none",
                                                color: "#60a5fa",
                                                cursor: "pointer",
                                                padding: 0,
                                                fontSize: "12px",
                                                fontWeight: 600
                                            }}
                                            onClick={() => navigate(`/user/tasks/${evt.taskId}`)}
                                        >
                                            View Task →
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserActivity;
