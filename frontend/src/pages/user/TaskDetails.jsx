import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import API from "../../services/api";
import "../../styles/taskDetails.css";

const TaskDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token } = useAuth();

    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // Update modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [status, setStatus] = useState("Pending");
    const [progress, setProgress] = useState(0);
    const [note, setNote] = useState("");
    const [updating, setUpdating] = useState(false);

    // ==========================================
    // FETCH TASK
    // ==========================================
    useEffect(() => {
        const fetchTask = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await API.get(`/tasks/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                const taskData = response.data.task;
                setTask(taskData);
                setStatus(taskData.status || "Pending");
                setProgress(taskData.progress ?? 0);

            } catch (err) {
                console.error("Fetch task error:", err);
                setError(
                    err.response?.data?.message ||
                    "Failed to load task."
                );
            } finally {
                setLoading(false);
            }
        };

        if (token && id) {
            fetchTask();
        }
    }, [id, token]);

    // ==========================================
    // SAVE COMBINED STATUS & PROGRESS (Modal)
    // ==========================================
    const handleSaveTaskUpdates = async (e) => {
        if (e) e.preventDefault();

        try {
            setUpdating(true);
            setError("");
            setSuccessMessage("");

            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };

            // Execute status and progress updates sequentially to avoid document race conditions
            await API.patch(`/tasks/${id}/status`, { status }, config);
            const progressRes = await API.patch(
                `/tasks/${id}/progress`,
                { progress: Number(progress) },
                config
            );

            const updatedTask = progressRes.data.task;
            setTask(updatedTask);
            setStatus(updatedTask.status);
            setProgress(updatedTask.progress ?? 0);

            setSuccessMessage("Task progress updated successfully!");
            setIsModalOpen(false);

            setTimeout(() => setSuccessMessage(""), 4000);

        } catch (err) {
            console.error("Task update error:", err);
            setError(
                err.response?.data?.message ||
                "Failed to update task progress."
            );
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="task-details-page">
                <div className="task-details-loading">
                    Loading task details...
                </div>
            </div>
        );
    }

    if (error && !task) {
        return (
            <div className="task-details-page">
                <div className="task-details-error">
                    <h2>Unable to load task</h2>
                    <p>{error}</p>
                    <button onClick={() => navigate("/user/tasks")}>
                        ← Back to My Tasks
                    </button>
                </div>
            </div>
        );
    }

    const currentStatusClass =
        task?.status === "Completed"
            ? "completed"
            : task?.status === "In Progress"
            ? "in-progress"
            : "pending";

    const priorityClass = (task?.priority || "medium").toLowerCase();

    return (
        <div className="task-details-page">
            {/* BACK BUTTON */}
            <button
                className="task-back-button"
                onClick={() => navigate("/user/tasks")}
            >
                ← Back to My Tasks
            </button>

            {/* NOTIFICATIONS / MESSAGES */}
            {successMessage && (
                <div
                    style={{
                        margin: "18px 0",
                        padding: "12px 18px",
                        borderRadius: "14px",
                        background: "rgba(16, 185, 129, 0.15)",
                        border: "1px solid rgba(52, 211, 153, 0.35)",
                        color: "#6ee7b7",
                        fontSize: "13.5px",
                        fontWeight: "600",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px"
                    }}
                >
                    <span>✓</span> {successMessage}
                </div>
            )}

            {error && (
                <div className="task-details-message">
                    {error}
                </div>
            )}

            {/* =========================================
                HERO CARD (Reference Image Bottom-Center)
            ========================================= */}
            <div className="task-hero-card glass-panel" style={{ marginTop: "22px" }}>
                <div className={`task-large-icon ${currentStatusClass}`}>
                    ✓
                </div>

                <div className="task-hero-details">
                    <div className="task-hero-badges">
                        <span className={`status-pill ${currentStatusClass}`}>
                            {task?.status || "Pending"}
                        </span>
                        <span className={`priority-pill ${priorityClass}`}>
                            {task?.priority || "Medium"} Priority
                        </span>
                    </div>

                    <h1 className="task-hero-title">
                        {task?.title || "Untitled Task"}
                    </h1>

                    <div className="task-metadata-list">
                        <div className="task-metadata-item">
                            <span className="icon">👤</span>
                            <span>
                                Assigned to:{" "}
                                <strong>
                                    {(Array.isArray(task?.assignedTo)
                                        ? task.assignedTo.map((u) => u?.name).filter(Boolean).join(", ")
                                        : task?.assignedTo?.name) || "You"}
                                </strong>
                            </span>
                        </div>

                        <div className="task-metadata-item">
                            <span className="icon">📅</span>
                            <span>Due Date: <strong>
                                {task?.dueDate
                                    ? new Date(task.dueDate).toLocaleDateString("en-IN", {
                                          day: "2-digit",
                                          month: "short",
                                          year: "numeric"
                                      })
                                    : "No deadline"}
                            </strong></span>
                        </div>

                        <div className="task-metadata-item">
                            <span className="icon">⏱</span>
                            <span>Progress: <strong>{task?.progress ?? 0}%</strong></span>
                        </div>
                    </div>
                </div>

                <button
                    className="create-task-button"
                    style={{ flexShrink: 0, alignSelf: "center" }}
                    onClick={() => setIsModalOpen(true)}
                >
                    <span>⚙</span>
                    Update Task
                </button>
            </div>

            {/* =========================================
                TASK DETAILS GRID
            ========================================= */}
            <div className="task-details-grid">
                {/* Description & Overview */}
                <div className="task-details-card glass-panel">
                    <h2>Task Overview & Scope</h2>
                    <div className="task-info-item" style={{ marginBottom: "18px" }}>
                        <span>Description</span>
                        <p style={{ whiteSpace: "pre-wrap" }}>
                            {task?.description || "No description provided for this task."}
                        </p>
                    </div>

                    {/* Glowing Progress Section */}
                    <div className="task-progress-section" style={{ marginTop: "20px" }}>
                        <div className="task-progress-header">
                            <span>Execution Progress</span>
                            <strong style={{ fontSize: "16px", color: "#60a5fa" }}>
                                {task?.progress ?? 0}% Completed
                            </strong>
                        </div>

                        <div className="task-progress-bar" style={{ height: "10px" }}>
                            <div
                                className="task-progress-fill"
                                style={{
                                    width: `${task?.progress ?? 0}%`,
                                    background: "linear-gradient(90deg, #3b82f6, #10b981)",
                                    boxShadow: "0 0 12px rgba(59, 130, 246, 0.5)"
                                }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Quick Info & Action Panel */}
                <div className="task-details-card glass-panel">
                    <h2>Status & Actions</h2>
                    <p className="task-card-description">
                        Keep your team aligned by reporting progress accurately.
                    </p>

                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", margin: "16px 0" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", padding: "10px 14px", borderRadius: "12px", background: "rgba(255, 255, 255, 0.03)" }}>
                            <span style={{ color: "#94a3b8" }}>Current State</span>
                            <span style={{ fontWeight: "700", color: "#f8fafc" }}>{task?.status}</span>
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", padding: "10px 14px", borderRadius: "12px", background: "rgba(255, 255, 255, 0.03)" }}>
                            <span style={{ color: "#94a3b8" }}>Completion Metric</span>
                            <span style={{ fontWeight: "700", color: "#60a5fa" }}>{task?.progress ?? 0}%</span>
                        </div>
                    </div>

                    <button
                        className="create-task-button"
                        style={{ width: "100%", justifyContent: "center", marginTop: "10px" }}
                        onClick={() => setIsModalOpen(true)}
                    >
                        <span>⚙</span>
                        Edit Progress / Status
                    </button>
                </div>
            </div>

            {/* =========================================
                UPDATE TASK MODAL (Reference Image Bottom-Right)
            ========================================= */}
            {isModalOpen && (
                <div className="update-task-modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div
                        className="update-task-modal-card"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="modal-header-row">
                            <div>
                                <h3>Update Task Progress</h3>
                                <p style={{ fontSize: "12px", color: "#94a3b8", margin: "3px 0 0" }}>
                                    {task?.title}
                                </p>
                            </div>
                            <button
                                className="modal-close-btn"
                                onClick={() => setIsModalOpen(false)}
                            >
                                ✕
                            </button>
                        </div>

                        {/* Status Selection */}
                        <div style={{ marginBottom: "18px" }}>
                            <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#cbd5e1", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
                                Status
                            </label>
                            <select
                                value={status}
                                onChange={(e) => {
                                    const nextStatus = e.target.value;
                                    setStatus(nextStatus);
                                    if (nextStatus === "Completed") setProgress(100);
                                    else if (nextStatus === "In Progress" && progress === 0) setProgress(25);
                                    else if (nextStatus === "Pending") setProgress(0);
                                }}
                            >
                                <option value="Pending">Pending</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                            </select>
                        </div>

                        {/* Interactive Progress Slider with Value Pill & Scale Ticks */}
                        <div className="modal-slider-box">
                            <div className="modal-slider-top">
                                <span className="modal-slider-label">Completion Percentage</span>
                                <span className="modal-slider-pill">{progress}%</span>
                            </div>

                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={progress}
                                onChange={(e) => {
                                    const val = Number(e.target.value);
                                    setProgress(val);
                                    if (val === 100) setStatus("Completed");
                                    else if (val === 0) setStatus("Pending");
                                    else setStatus("In Progress");
                                }}
                                style={{ width: "100%", accentColor: "#3b82f6" }}
                            />

                            {/* Scale Ticks (Clickable!) */}
                            <div className="scale-ticks-row">
                                {[0, 25, 50, 75, 100].map((tick) => (
                                    <button
                                        key={tick}
                                        type="button"
                                        className={`scale-tick-btn ${progress === tick ? "active" : ""}`}
                                        onClick={() => {
                                            setProgress(tick);
                                            if (tick === 100) setStatus("Completed");
                                            else if (tick === 0) setStatus("Pending");
                                            else setStatus("In Progress");
                                        }}
                                    >
                                        {tick}%
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Optional Progress Note */}
                        <div style={{ marginBottom: "18px" }}>
                            <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#cbd5e1", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
                                Note / Comments (Optional)
                            </label>
                            <textarea
                                rows="3"
                                placeholder="Add notes regarding current blockers, milestones completed, etc."
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                            />
                        </div>

                        {/* Modal Footer Actions */}
                        <div className="modal-footer-actions">
                            <button
                                type="button"
                                className="modal-btn-cancel"
                                onClick={() => setIsModalOpen(false)}
                                disabled={updating}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="create-task-button"
                                onClick={handleSaveTaskUpdates}
                                disabled={updating}
                            >
                                {updating ? "Saving Changes..." : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TaskDetails;