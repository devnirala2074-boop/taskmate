import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import API from "../../services/api";
import "../../styles/adminTaskDetails.css";
import "../../styles/taskDetails.css";
import "../../styles/createTask.css";

const AdminTaskDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user: currentUser, token } = useAuth();

    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // Modal state for Admin editing status/progress
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [status, setStatus] = useState("Pending");
    const [progress, setProgress] = useState(0);
    const [updating, setUpdating] = useState(false);

    // Modal state for Admin editing/reassigning members
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [allUsers, setAllUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [selectedAssignees, setSelectedAssignees] = useState([]);
    const [assigneeSearch, setAssigneeSearch] = useState("");
    const [savingAssignees, setSavingAssignees] = useState(false);

    const normalizeAssignees = (assignedTo) => {
        if (!assignedTo) return [];
        return Array.isArray(assignedTo) ? assignedTo : [assignedTo];
    };

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

                const t = response.data.task;
                setTask(t);
                setStatus(t.status || "Pending");
                setProgress(t.progress ?? 0);

                const assignees = normalizeAssignees(t.assignedTo);
                setSelectedAssignees(
                    assignees.map((u) => (typeof u === "object" ? u._id : u)).filter(Boolean)
                );
            } catch (err) {
                console.error("Admin task details error:", err);
                setError(
                    err.response?.data?.message ||
                    "Failed to load task details."
                );
            } finally {
                setLoading(false);
            }
        };

        if (token && id) {
            fetchTask();
        }
    }, [token, id]);

    const openAssignModal = async () => {
        const assignees = normalizeAssignees(task?.assignedTo);
        setSelectedAssignees(
            assignees.map((u) => (typeof u === "object" ? u._id : u)).filter(Boolean)
        );
        setAssigneeSearch("");
        setIsAssignModalOpen(true);

        if (allUsers.length === 0) {
            try {
                setLoadingUsers(true);
                const res = await API.get("/users", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const eligible = (res.data.users || []).filter(
                    (u) =>
                        u.role === "user" &&
                        u._id !== currentUser?._id &&
                        u.email !== currentUser?.email
                );
                setAllUsers(eligible);
            } catch (err) {
                console.error("Load users error:", err);
            } finally {
                setLoadingUsers(false);
            }
        }
    };

    const toggleAssignee = (userId) => {
        setSelectedAssignees((prev) =>
            prev.includes(userId)
                ? prev.filter((id) => id !== userId)
                : [...new Set([...prev, userId])]
        );
    };

    const handleSaveAssignees = async () => {
        if (selectedAssignees.length === 0) {
            setError("Please select at least one member for the task.");
            return;
        }

        try {
            setSavingAssignees(true);
            setError("");
            setSuccessMessage("");

            const res = await API.patch(
                `/tasks/${id}/assign`,
                { assignedTo: [...new Set(selectedAssignees)] },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            const updatedTask = res.data.task;
            setTask(updatedTask);
            setStatus(updatedTask.status || "Pending");
            setProgress(updatedTask.progress ?? 0);
            setIsAssignModalOpen(false);
            setSuccessMessage("Assigned members updated successfully!");
            setTimeout(() => setSuccessMessage(""), 4000);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to update assigned members."
            );
        } finally {
            setSavingAssignees(false);
        }
    };

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

            setSuccessMessage("Task updated successfully!");
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

    const handleDelete = async () => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this task? This action cannot be undone."
        );

        if (!confirmed) return;

        try {
            await API.delete(`/tasks/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            navigate("/admin/tasks");
        } catch (err) {
            console.error("Delete task error:", err);
            setError(
                err.response?.data?.message ||
                "Failed to delete task."
            );
        }
    };

    if (loading) {
        return (
            <div className="admin-task-details-page">
                <div className="admin-task-details-loading">
                    Loading task details...
                </div>
            </div>
        );
    }

    if (error && !task) {
        return (
            <div className="admin-task-details-page">
                <div className="admin-task-details-error">
                    <h2>Unable to load task</h2>
                    <p>{error || "Task not found."}</p>
                    <button onClick={() => navigate("/admin/tasks")}>
                        ← Back to All Tasks
                    </button>
                </div>
            </div>
        );
    }

    const assignees = normalizeAssignees(task?.assignedTo);
    const assigneeNamesText =
        assignees
            .map((u) => (typeof u === "object" ? u.name : ""))
            .filter(Boolean)
            .join(", ") || "Unassigned";

    const memberProgressList = Array.isArray(task?.memberProgress)
        ? task.memberProgress
        : [];

    const getMemberProgressInfo = (member) => {
        const memberId = typeof member === "object" ? member._id : member;
        const found = memberProgressList.find((mp) => {
            const mpUserId =
                typeof mp.user === "object" ? mp.user?._id : mp.user;
            return String(mpUserId) === String(memberId);
        });
        return {
            status: found?.status || task?.status || "Pending",
            progress: found?.progress ?? task?.progress ?? 0
        };
    };

    const currentStatusClass =
        task.status === "Completed"
            ? "completed"
            : task.status === "In Progress"
            ? "in-progress"
            : "pending";

    const priorityClass = (task.priority || "medium").toLowerCase();

    const filteredModalUsers = allUsers.filter((u) => {
        if (!assigneeSearch.trim()) return true;
        const q = assigneeSearch.toLowerCase().trim();
        return (
            u.name?.toLowerCase().includes(q) ||
            u.email?.toLowerCase().includes(q)
        );
    });

    return (
        <div className="admin-task-details-page">
            <button
                className="admin-task-back-button"
                onClick={() => navigate("/admin/tasks")}
            >
                ← Back to All Tasks
            </button>

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
                <div className="admin-task-message">
                    {error}
                </div>
            )}

            {/* Hero Card */}
            <div className="task-hero-card glass-panel" style={{ marginTop: "22px" }}>
                <div className={`task-large-icon ${currentStatusClass}`}>
                    ✓
                </div>

                <div className="task-hero-details">
                    <div className="task-hero-badges">
                        <span className={`status-pill ${currentStatusClass}`}>
                            {task.status || "Pending"}
                        </span>
                        <span className={`priority-pill ${priorityClass}`}>
                            {task.priority || "Medium"} Priority
                        </span>
                    </div>

                    <h1 className="task-hero-title">
                        {task.title}
                    </h1>

                    <div className="task-metadata-list">
                        <div className="task-metadata-item">
                            <span className="icon">👤</span>
                            <span>
                                Assigned to: <strong>{assigneeNamesText}</strong>
                            </span>
                        </div>

                        <div className="task-metadata-item">
                            <span className="icon">📅</span>
                            <span>
                                Due Date:{" "}
                                <strong>
                                    {task.dueDate
                                        ? new Date(task.dueDate).toLocaleDateString("en-IN", {
                                              day: "2-digit",
                                              month: "short",
                                              year: "numeric"
                                          })
                                        : "No deadline"}
                                </strong>
                            </span>
                        </div>

                        <div className="task-metadata-item">
                            <span className="icon">⏱</span>
                            <span>
                                Overall Progress: <strong>{progress}%</strong>
                            </span>
                        </div>
                    </div>
                </div>

                <div style={{ display: "flex", gap: "10px", alignSelf: "center", flexShrink: 0, flexWrap: "wrap" }}>
                    <button
                        className="create-task-button"
                        onClick={openAssignModal}
                        style={{ background: "rgba(59, 130, 246, 0.16)", border: "1px solid rgba(96, 165, 250, 0.35)" }}
                    >
                        <span>♟</span>
                        Manage Members ({assignees.length})
                    </button>

                    <button
                        className="create-task-button"
                        onClick={() => setIsModalOpen(true)}
                    >
                        <span>⚙</span>
                        Update Status
                    </button>

                    <button
                        className="admin-logout-btn"
                        style={{ height: "42px", padding: "0 18px", borderRadius: "14px" }}
                        onClick={handleDelete}
                    >
                        <span>✕</span>
                        Delete
                    </button>
                </div>
            </div>

            {/* Grid */}
            <div className="admin-task-details-grid">
                {/* Task Information */}
                <div className="admin-task-card glass-panel">
                    <h2>Task Information</h2>

                    <div className="admin-task-description">
                        <span>Description</span>
                        <p style={{ whiteSpace: "pre-wrap" }}>
                            {task.description || "No description provided."}
                        </p>
                    </div>

                    <div className="admin-task-progress-section" style={{ marginTop: "24px" }}>
                        <div className="admin-task-progress-header">
                            <span>Overall Team Progress</span>
                            <strong style={{ color: "#60a5fa" }}>{progress}%</strong>
                        </div>

                        <div className="admin-task-progress-bar" style={{ height: "10px" }}>
                            <div
                                className="admin-task-progress-fill"
                                style={{
                                    width: `${progress}%`,
                                    background: "linear-gradient(90deg, #3b82f6, #10b981)",
                                    boxShadow: "0 0 12px rgba(59, 130, 246, 0.5)"
                                }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Assigned Members & Individual Progress */}
                <div className="admin-task-card glass-panel">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                        <h2 style={{ margin: 0 }}>
                            Assigned Members ({assignees.length})
                        </h2>
                        <button
                            type="button"
                            className="member-quick-btn"
                            onClick={openAssignModal}
                        >
                            + Add / Edit
                        </button>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {assignees.length === 0 ? (
                            <p style={{ color: "#94a3b8", fontSize: "13px" }}>
                                No members assigned.
                            </p>
                        ) : (
                            assignees.map((member, idx) => {
                                const mName =
                                    typeof member === "object"
                                        ? member.name || "Unknown User"
                                        : "Assigned User";
                                const mEmail =
                                    typeof member === "object"
                                        ? member.email || ""
                                        : "";
                                const mId =
                                    typeof member === "object"
                                        ? member._id
                                        : member || idx;
                                const mpInfo = getMemberProgressInfo(member);
                                const mStatusClass =
                                    mpInfo.status === "Completed"
                                        ? "completed"
                                        : mpInfo.status === "In Progress"
                                        ? "in-progress"
                                        : "pending";

                                return (
                                    <div
                                        key={mId}
                                        style={{
                                            padding: "12px 14px",
                                            borderRadius: "14px",
                                            background: "rgba(255, 255, 255, 0.03)",
                                            border: "1px solid rgba(255, 255, 255, 0.07)",
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: "10px"
                                        }}
                                    >
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
                                            <div className="admin-assigned-user" style={{ margin: 0 }}>
                                                <div className="admin-assigned-avatar">
                                                    {mName.charAt(0).toUpperCase() || "U"}
                                                </div>
                                                <div>
                                                    <strong>{mName}</strong>
                                                    <span>{mEmail}</span>
                                                </div>
                                            </div>

                                            <span className={`status-pill ${mStatusClass}`} style={{ fontSize: "11px", padding: "4px 10px" }}>
                                                {mpInfo.status} — {mpInfo.progress}%
                                            </span>
                                        </div>

                                        <div className="admin-task-progress-bar" style={{ height: "6px" }}>
                                            <div
                                                className="admin-task-progress-fill"
                                                style={{
                                                    width: `${mpInfo.progress}%`,
                                                    background:
                                                        mpInfo.progress === 100
                                                            ? "#10b981"
                                                            : "linear-gradient(90deg, #3b82f6, #60a5fa)"
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    <div className="admin-task-meta" style={{ marginTop: "18px" }}>
                        <div>
                            <span>Assigned By</span>
                            <strong>
                                {task.assignedBy?.name || "Administrator"}
                            </strong>
                        </div>

                        <div>
                            <span>Created</span>
                            <strong>
                                {task.createdAt
                                    ? new Date(task.createdAt).toLocaleDateString("en-IN", {
                                          day: "2-digit",
                                          month: "short",
                                          year: "numeric"
                                      })
                                    : "—"}
                            </strong>
                        </div>
                    </div>
                </div>
            </div>

            {/* Manage Assignees Modal */}
            {isAssignModalOpen && (
                <div className="update-task-modal-overlay" onClick={() => setIsAssignModalOpen(false)}>
                    <div
                        className="update-task-modal-card"
                        style={{ maxWidth: "540px", width: "92%" }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-header-row">
                            <div>
                                <h3>Manage Assigned Members</h3>
                                <p style={{ fontSize: "12px", color: "#94a3b8", margin: "3px 0 0" }}>
                                    Add or remove members for "{task.title}"
                                </p>
                            </div>
                            <button
                                className="modal-close-btn"
                                onClick={() => setIsAssignModalOpen(false)}
                            >
                                ✕
                            </button>
                        </div>

                        <div className="member-selector-panel" style={{ marginBottom: "18px" }}>
                            <div className="member-selector-top">
                                <div className="member-search-wrapper">
                                    <span className="member-search-icon">🔍</span>
                                    <input
                                        type="text"
                                        className="member-search-input"
                                        placeholder="Search members..."
                                        value={assigneeSearch}
                                        onChange={(e) => setAssigneeSearch(e.target.value)}
                                    />
                                </div>
                                <span className="selected-count-badge">
                                    Selected: {selectedAssignees.length}
                                </span>
                            </div>

                            <div className="member-list-box">
                                {loadingUsers ? (
                                    <div className="member-empty-state">Loading members...</div>
                                ) : filteredModalUsers.length === 0 ? (
                                    <div className="member-empty-state">No matching members found.</div>
                                ) : (
                                    filteredModalUsers.map((u) => {
                                        const isChecked = selectedAssignees.includes(u._id);
                                        return (
                                            <div
                                                key={u._id}
                                                className={`member-option-row ${isChecked ? "selected" : ""}`}
                                                onClick={() => toggleAssignee(u._id)}
                                            >
                                                <div className="member-option-left">
                                                    <input
                                                        type="checkbox"
                                                        className="member-checkbox"
                                                        checked={isChecked}
                                                        onChange={() => {}}
                                                    />
                                                    <div className="member-avatar-mini">
                                                        {u.name?.charAt(0).toUpperCase() || "U"}
                                                    </div>
                                                    <div className="member-option-info">
                                                        <span className="member-option-name">{u.name}</span>
                                                        <span className="member-option-email">{u.email}</span>
                                                    </div>
                                                </div>
                                                {isChecked && (
                                                    <span className="member-selected-indicator">✓ Selected</span>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {selectedAssignees.length > 0 && (
                                <div className="selected-chips-section">
                                    <div className="selected-chips-wrap">
                                        {selectedAssignees.map((uid) => {
                                            const foundUser =
                                                allUsers.find((u) => u._id === uid) ||
                                                assignees.find((a) => (a?._id || a) === uid);
                                            const label = foundUser?.name || "Member";
                                            return (
                                                <span key={uid} className="member-chip">
                                                    <span>{label}</span>
                                                    <button
                                                        type="button"
                                                        className="member-chip-remove"
                                                        onClick={() => toggleAssignee(uid)}
                                                    >
                                                        ×
                                                    </button>
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="modal-footer-actions">
                            <button
                                type="button"
                                className="modal-btn-cancel"
                                onClick={() => setIsAssignModalOpen(false)}
                                disabled={savingAssignees}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="create-task-button"
                                onClick={handleSaveAssignees}
                                disabled={savingAssignees || selectedAssignees.length === 0}
                            >
                                {savingAssignees ? "Saving..." : "Save Assignees"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Update Modal */}
            {isModalOpen && (
                <div className="update-task-modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div
                        className="update-task-modal-card"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-header-row">
                            <div>
                                <h3>Update Task Progress</h3>
                                <p style={{ fontSize: "12px", color: "#94a3b8", margin: "3px 0 0" }}>
                                    {task.title}
                                </p>
                            </div>
                            <button
                                className="modal-close-btn"
                                onClick={() => setIsModalOpen(false)}
                            >
                                ✕
                            </button>
                        </div>

                        <div style={{ marginBottom: "18px" }}>
                            <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#cbd5e1", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
                                Status
                            </label>
                            <select
                                value={status}
                                onChange={(e) => {
                                    const next = e.target.value;
                                    setStatus(next);
                                    if (next === "Completed") setProgress(100);
                                    else if (next === "In Progress" && progress === 0) setProgress(25);
                                    else if (next === "Pending") setProgress(0);
                                }}
                            >
                                <option value="Pending">Pending</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                            </select>
                        </div>

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

export default AdminTaskDetails;