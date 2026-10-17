import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import API from "../../services/api";
import "../../styles/createTask.css";

const CreateTask = () => {
    const { user: currentUser, token } = useAuth();
    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        assignedTo: [],
        priority: "Medium",
        dueDate: ""
    });

    const [memberSearch, setMemberSearch] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoadingUsers(true);
                const response = await API.get("/users", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                const normalUsers = (response.data.users || []).filter(
                    (u) =>
                        u.role === "user" &&
                        u._id !== currentUser?._id &&
                        u.email !== currentUser?.email
                );

                setUsers(normalUsers);
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    "Failed to load team members."
                );
            } finally {
                setLoadingUsers(false);
            }
        };

        if (token) {
            fetchUsers();
        }
    }, [token, currentUser]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));

        setError("");
        setSuccess("");
    };

    const toggleMemberSelection = (userId) => {
        setError("");
        setSuccess("");

        setFormData((prev) => {
            const exists = prev.assignedTo.includes(userId);
            const nextAssigned = exists
                ? prev.assignedTo.filter((id) => id !== userId)
                : [...new Set([...prev.assignedTo, userId])];

            return {
                ...prev,
                assignedTo: nextAssigned
            };
        });
    };

    const removeMemberChip = (userId) => {
        setError("");
        setSuccess("");

        setFormData((prev) => ({
            ...prev,
            assignedTo: prev.assignedTo.filter((id) => id !== userId)
        }));
    };

    const filteredUsers = users.filter((u) => {
        if (!memberSearch.trim()) return true;
        const q = memberSearch.toLowerCase().trim();
        return (
            u.name?.toLowerCase().includes(q) ||
            u.email?.toLowerCase().includes(q)
        );
    });

    const handleSelectAllFiltered = () => {
        setError("");
        setSuccess("");
        const filteredIds = filteredUsers.map((u) => u._id);
        setFormData((prev) => ({
            ...prev,
            assignedTo: [...new Set([...prev.assignedTo, ...filteredIds])]
        }));
    };

    const handleClearSelection = () => {
        setError("");
        setSuccess("");
        setFormData((prev) => ({
            ...prev,
            assignedTo: []
        }));
    };

    const selectedUserObjects = formData.assignedTo
        .map((id) => users.find((u) => u._id === id))
        .filter(Boolean);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (!formData.assignedTo || formData.assignedTo.length === 0) {
            setError("Please select at least one team member.");
            return;
        }

        try {
            setSubmitting(true);

            const uniqueAssignees = [...new Set(formData.assignedTo)];

            await API.post(
                "/tasks",
                {
                    title: formData.title,
                    description: formData.description,
                    assignedTo: uniqueAssignees,
                    priority: formData.priority,
                    dueDate: formData.dueDate
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setSuccess(
                uniqueAssignees.length === 1
                    ? "Task created and assigned to 1 member successfully."
                    : `Task created and assigned to ${uniqueAssignees.length} members simultaneously.`
            );

            setFormData({
                title: "",
                description: "",
                assignedTo: [],
                priority: "Medium",
                dueDate: ""
            });
            setMemberSearch("");
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to create task."
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="create-task-page">
            <div className="dashboard-orb orb-one"></div>
            <div className="dashboard-orb orb-two"></div>

            {/* Header */}
            <header className="create-task-header glass-panel">
                <div className="dashboard-brand">
                    <div className="dashboard-logo">
                        ✓
                    </div>

                    <div>
                        <h2>TaskMate</h2>
                        <span>Admin Workspace</span>
                    </div>
                </div>

                <button
                    className="back-button"
                    onClick={() => navigate("/admin/dashboard")}
                >
                    ← Dashboard
                </button>
            </header>

            {/* Main */}
            <main className="create-task-container">
                <div className="create-task-intro">
                    <span className="dashboard-badge">
                        ✦ TASK MANAGEMENT
                    </span>

                    <h1>
                        Create a new
                        <span> task.</span>
                    </h1>

                    <p>
                        Assign a task to one or multiple team members,
                        define its priority and deadline,
                        and track individual member progress.
                    </p>
                </div>

                <section className="create-task-card glass-panel">
                    <div className="form-header">
                        <div className="form-icon">
                            ＋
                        </div>

                        <div>
                            <h2>New Task</h2>
                            <p>Enter the task details and select team members below.</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {/* Title */}
                        <div className="form-group">
                            <label htmlFor="title">
                                Task Title
                            </label>

                            <input
                                id="title"
                                name="title"
                                type="text"
                                placeholder="e.g. Develop College Website"
                                value={formData.title}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* Description */}
                        <div className="form-group">
                            <label htmlFor="description">
                                Description
                            </label>

                            <textarea
                                id="description"
                                name="description"
                                placeholder="Describe what needs to be completed..."
                                value={formData.description}
                                onChange={handleChange}
                                rows="5"
                                required
                            />
                        </div>

                        {/* Searchable Multi-Select Member Selector */}
                        <div className="form-group">
                            <label htmlFor="memberSearch">
                                Assign Members
                            </label>

                            <div className="member-selector-panel">
                                <div className="member-selector-top">
                                    <div className="member-search-wrapper">
                                        <span className="member-search-icon">🔍</span>
                                        <input
                                            id="memberSearch"
                                            type="text"
                                            className="member-search-input"
                                            placeholder="Search members by name or email..."
                                            value={memberSearch}
                                            onChange={(e) => setMemberSearch(e.target.value)}
                                        />
                                    </div>

                                    <div className="member-selector-meta">
                                        <span className="selected-count-badge">
                                            Selected Members: {formData.assignedTo.length}
                                        </span>

                                        {users.length > 0 && (
                                            <>
                                                <button
                                                    type="button"
                                                    className="member-quick-btn"
                                                    onClick={handleSelectAllFiltered}
                                                >
                                                    Select All
                                                </button>
                                                {formData.assignedTo.length > 0 && (
                                                    <button
                                                        type="button"
                                                        className="member-quick-btn"
                                                        onClick={handleClearSelection}
                                                    >
                                                        Clear
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Member Checkbox List */}
                                <div className="member-list-box" role="listbox" aria-multiselectable="true">
                                    {loadingUsers ? (
                                        <div className="member-empty-state">
                                            Loading eligible team members...
                                        </div>
                                    ) : users.length === 0 ? (
                                        <div className="member-empty-state">
                                            No registered standard users available.
                                        </div>
                                    ) : filteredUsers.length === 0 ? (
                                        <div className="member-empty-state">
                                            No members match "{memberSearch}".
                                        </div>
                                    ) : (
                                        filteredUsers.map((member) => {
                                            const isSelected = formData.assignedTo.includes(member._id);
                                            return (
                                                <div
                                                    key={member._id}
                                                    className={`member-option-row ${isSelected ? "selected" : ""}`}
                                                    onClick={() => toggleMemberSelection(member._id)}
                                                    role="option"
                                                    aria-selected={isSelected}
                                                >
                                                    <div className="member-option-left">
                                                        <input
                                                            type="checkbox"
                                                            className="member-checkbox"
                                                            checked={isSelected}
                                                            onChange={() => {}}
                                                            aria-label={`Select ${member.name}`}
                                                        />
                                                        <div className="member-avatar-mini">
                                                            {member.name?.charAt(0).toUpperCase() || "U"}
                                                        </div>
                                                        <div className="member-option-info">
                                                            <span className="member-option-name">
                                                                {member.name}
                                                            </span>
                                                            <span className="member-option-email">
                                                                {member.email}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {isSelected && (
                                                        <span className="member-selected-indicator">
                                                            ✓ Selected
                                                        </span>
                                                    )}
                                                </div>
                                            );
                                        })
                                    )}
                                </div>

                                {/* Removable Selected Member Chips */}
                                {selectedUserObjects.length > 0 && (
                                    <div className="selected-chips-section">
                                        <span className="selected-chips-label">
                                            Selected Members ({selectedUserObjects.length})
                                        </span>
                                        <div className="selected-chips-wrap">
                                            {selectedUserObjects.map((member) => (
                                                <span key={member._id} className="member-chip">
                                                    <span>{member.name}</span>
                                                    <button
                                                        type="button"
                                                        className="member-chip-remove"
                                                        onClick={() => removeMemberChip(member._id)}
                                                        title={`Remove ${member.name}`}
                                                        aria-label={`Remove ${member.name}`}
                                                    >
                                                        ×
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Priority + Due Date */}
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="priority">
                                    Priority
                                </label>

                                <select
                                    id="priority"
                                    name="priority"
                                    value={formData.priority}
                                    onChange={handleChange}
                                >
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                    <option value="Urgent">Urgent</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="dueDate">
                                    Due Date
                                </label>

                                <input
                                    id="dueDate"
                                    name="dueDate"
                                    type="date"
                                    value={formData.dueDate}
                                    onChange={handleChange}
                                    min={
                                        new Date()
                                            .toISOString()
                                            .split("T")[0]
                                    }
                                    required
                                />
                            </div>
                        </div>

                        {/* Messages */}
                        {error && (
                            <div className="form-message error">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="form-message success">
                                {success}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="form-actions">
                            <button
                                type="button"
                                className="cancel-button"
                                onClick={() => navigate("/admin/dashboard")}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="submit-task-button"
                                disabled={submitting}
                            >
                                {submitting ? "Creating..." : "Create Task"}
                                {!submitting && <span>→</span>}
                            </button>
                        </div>
                    </form>
                </section>
            </main>

            <footer className="dashboard-footer">
                <span>© 2026 TaskMate</span>
                <span>Admin Workspace</span>
                <span>Build Better. Together.</span>
            </footer>
        </div>
    );
};

export default CreateTask;