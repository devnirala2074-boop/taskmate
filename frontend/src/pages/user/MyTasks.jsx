import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import API from "../../services/api";
import "../../styles/myTasks.css";

const MyTasks = () => {
    const { token } = useAuth();
    const navigate = useNavigate();

    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await API.get("/tasks/my-tasks", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                setTasks(response.data.tasks || response.data);
            } catch (err) {
                console.error(err);
                setError("Unable to load your tasks.");
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchTasks();
        }
    }, [token]);

    const totalTasks = tasks.length;
    const inProgressTasks = tasks.filter((t) => t.status === "In Progress").length;
    const completedTasks = tasks.filter((t) => t.status === "Completed").length;
    const pendingTasks = tasks.filter((t) => t.status === "Pending").length;

    const filteredTasks = tasks.filter((task) => {
        if (filterStatus === "all") return true;
        return task.status === filterStatus;
    });

    if (loading) {
        return (
            <div className="page-loading">
                Loading your tasks...
            </div>
        );
    }

    if (error) {
        return (
            <div className="page-error">
                {error}
            </div>
        );
    }

    return (
        <div className="my-tasks-page">
            {/* PAGE HEADER */}
            <div className="page-header">
                <span className="page-badge">
                    ✦ MY TASKS
                </span>

                <h1>My Tasks</h1>
                <p>View, track, and update all work assigned directly to you.</p>
            </div>

            {/* FILTER TABS */}
            <div className="user-filter-tabs" style={{ margin: "14px 0 20px" }}>
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

            {/* TASK LIST */}
            <div className="my-tasks-list">
                {filteredTasks.length === 0 ? (
                    <div className="empty-tasks glass-panel">
                        <div className="empty-icon">✓</div>
                        <h2>No tasks found</h2>
                        <p>
                            {totalTasks === 0
                                ? "You currently don't have any tasks assigned to you."
                                : `There are no ${filterStatus.toLowerCase()} tasks right now.`}
                        </p>
                    </div>
                ) : (
                    filteredTasks.map((task) => (
                        <div
                            className="task-row glass-panel"
                            key={task._id}
                            style={{ cursor: "pointer" }}
                            onClick={() => navigate(`/user/tasks/${task._id}`)}
                        >
                            {/* TASK INFORMATION */}
                            <div className="task-main">
                                <div className="task-icon">
                                    ✓
                                </div>

                                <div>
                                    <h3>{task.title}</h3>
                                    <p>
                                        {task.description || "No description provided."}
                                    </p>
                                </div>
                            </div>

                            {/* TASK META */}
                            <div className="task-meta">
                                <span className={`priority-pill ${task.priority?.toLowerCase() || "medium"}`}>
                                    {task.priority || "Medium"}
                                </span>

                                <span
                                    className={`status-pill ${task.status
                                        ?.toLowerCase()
                                        .replace(" ", "-")}`}
                                >
                                    {task.status}
                                </span>

                                <div className="progress-info">
                                    <span>{task.progress ?? 0}%</span>
                                    <div className="progress-bar">
                                        <div
                                            className="progress-fill"
                                            style={{
                                                width: `${task.progress ?? 0}%`
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            </div>

                            {/* VIEW TASK BUTTON */}
                            <button
                                className="view-task-button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/user/tasks/${task._id}`);
                                }}
                            >
                                View Task
                                <span>→</span>
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default MyTasks;