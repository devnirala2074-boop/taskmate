import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import userService from "../../services/userService";
import API from "../../services/api";
import "../../styles/adminUserDetails.css";

const AdminUserDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user: currentAdmin, token } = useAuth();

    // Data states
    const [targetUser, setTargetUser] = useState(null);
    const [userTasks, setUserTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pageError, setPageError] = useState("");

    // Edit form states
    const [editForm, setEditForm] = useState({
        name: "",
        email: "",
        role: "user"
    });
    const [editLoading, setEditLoading] = useState(false);
    const [editSuccess, setEditSuccess] = useState("");
    const [editError, setEditError] = useState("");

    // Reset password states
    const [passwordForm, setPasswordForm] = useState({
        newPassword: "",
        confirmPassword: ""
    });
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordSuccess, setPasswordSuccess] = useState("");
    const [passwordError, setPasswordError] = useState("");

    // Delete states
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteError, setDeleteError] = useState("");

    const isSelf = currentAdmin?.id === targetUser?._id;

    // Load user data and their assigned tasks
    const loadUserData = async () => {
        try {
            setLoading(true);
            setPageError("");

            const [userData, tasksData] = await Promise.all([
                userService.getUserById(id, token),
                API.get("/tasks/all", {
                    headers: { Authorization: `Bearer ${token}` }
                }).catch(() => ({ data: { tasks: [] } }))
            ]);

            const loadedUser = userData.user;
            setTargetUser(loadedUser);
            setEditForm({
                name: loadedUser.name || "",
                email: loadedUser.email || "",
                role: loadedUser.role || "user"
            });

            // Filter tasks assigned to this user (supports single & multi-user tasks)
            const allTasks = tasksData.data?.tasks || [];
            const assigned = allTasks
                .filter((task) => {
                    if (Array.isArray(task.assignedTo)) {
                        return task.assignedTo.some(
                            (u) => String(u?._id || u) === String(loadedUser._id)
                        );
                    }
                    return (
                        String(task.assignedTo?._id || task.assignedTo) ===
                        String(loadedUser._id)
                    );
                })
                .map((task) => {
                    if (Array.isArray(task.memberProgress)) {
                        const mp = task.memberProgress.find(
                            (entry) =>
                                String(entry.user?._id || entry.user) ===
                                String(loadedUser._id)
                        );
                        if (mp) {
                            return {
                                ...task,
                                status: mp.status || task.status,
                                progress: mp.progress ?? task.progress
                            };
                        }
                    }
                    return task;
                });
            setUserTasks(assigned);

        } catch (err) {
            console.error("Failed to load user details:", err);
            setPageError(
                err.response?.data?.message ||
                "Failed to load user details. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token && id) {
            loadUserData();
        }
    }, [id, token]);

    // Handle Edit User Form
    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditForm((prev) => ({ ...prev, [name]: value }));
        setEditError("");
        setEditSuccess("");
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setEditError("");
        setEditSuccess("");

        if (!editForm.name.trim() || !editForm.email.trim()) {
            setEditError("Name and email are required.");
            return;
        }

        try {
            setEditLoading(true);
            const response = await userService.updateUser(
                id,
                {
                    name: editForm.name.trim(),
                    email: editForm.email.trim(),
                    role: editForm.role
                },
                token
            );

            setTargetUser(response.user);
            setEditSuccess("User profile updated successfully.");
        } catch (err) {
            console.error("Update user error:", err);
            setEditError(
                err.response?.data?.message ||
                "Failed to update user profile."
            );
        } finally {
            setEditLoading(false);
        }
    };

    // Handle Reset Password Form
    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordForm((prev) => ({ ...prev, [name]: value }));
        setPasswordError("");
        setPasswordSuccess("");
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setPasswordError("");
        setPasswordSuccess("");

        if (!passwordForm.newPassword) {
            setPasswordError("New password is required.");
            return;
        }

        if (passwordForm.newPassword.length < 6) {
            setPasswordError("Password must be at least 6 characters.");
            return;
        }

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setPasswordError("Passwords do not match.");
            return;
        }

        try {
            setPasswordLoading(true);
            const response = await userService.resetUserPassword(
                id,
                passwordForm.newPassword,
                token
            );

            setPasswordSuccess(
                response.message || "Password reset successfully."
            );
            setPasswordForm({ newPassword: "", confirmPassword: "" });
        } catch (err) {
            console.error("Reset password error:", err);
            setPasswordError(
                err.response?.data?.message ||
                "Failed to reset password."
            );
        } finally {
            setPasswordLoading(false);
        }
    };

    // Handle Delete User
    const handleDeleteUser = async () => {
        if (isSelf) {
            setDeleteError("You cannot delete your own admin account.");
            return;
        }

        try {
            setDeleteLoading(true);
            setDeleteError("");
            await userService.deleteUser(id, token);
            setShowDeleteModal(false);
            navigate("/admin/users", { replace: true });
        } catch (err) {
            console.error("Delete user error:", err);
            setDeleteError(
                err.response?.data?.message ||
                "Failed to delete user."
            );
        } finally {
            setDeleteLoading(false);
        }
    };

    // Helpers
    const getInitial = (name) => {
        return name?.charAt(0).toUpperCase() || "U";
    };

    const formatDate = (date) => {
        if (!date) return "—";
        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    // Task stats for this user
    const pendingTasks = userTasks.filter((t) => t.status === "Pending").length;
    const inProgressTasks = userTasks.filter((t) => t.status === "In Progress").length;
    const completedTasks = userTasks.filter((t) => t.status === "Completed").length;

    // Loading View
    if (loading) {
        return (
            <div className="admin-user-details-page">
                <div className="admin-user-details-orb orb-one"></div>
                <div className="admin-user-details-orb orb-two"></div>
                <div className="admin-user-loading-state">
                    <div className="admin-user-spinner"></div>
                    <h2>Loading user profile...</h2>
                    <p style={{ color: "#71819b" }}>Fetching account details and task statistics.</p>
                </div>
            </div>
        );
    }

    // Error View
    if (pageError && !targetUser) {
        return (
            <div className="admin-user-details-page">
                <div className="admin-user-details-orb orb-one"></div>
                <div className="admin-user-details-orb orb-two"></div>
                <div className="admin-user-error-state">
                    <button
                        className="admin-user-back-btn"
                        onClick={() => navigate("/admin/users")}
                    >
                        ← Back to Users
                    </button>
                    <h2>Unable to Load User</h2>
                    <p style={{ color: "#ff9b9b", margin: "12px 0 24px" }}>{pageError}</p>
                    <button
                        className="admin-user-btn-primary"
                        style={{ width: "auto" }}
                        onClick={loadUserData}
                    >
                        ↻ Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-user-details-page">
            {/* Ambient Background Orbs */}
            <div className="admin-user-details-orb orb-one"></div>
            <div className="admin-user-details-orb orb-two"></div>

            {/* Back Button */}
            <button
                className="admin-user-back-btn"
                onClick={() => navigate("/admin/users")}
            >
                ← Back to Users
            </button>

            {/* Page Header */}
            <header className="admin-user-details-header">
                <div className="admin-user-header-left">
                    <div className="admin-user-avatar-large">
                        {getInitial(targetUser?.name)}
                    </div>
                    <div>
                        <span className="admin-user-details-badge">
                            ✦ USER MANAGEMENT
                        </span>
                        <h1>{targetUser?.name || "User Details"}</h1>
                        <p>{targetUser?.email}</p>
                    </div>
                </div>

                <div className="admin-user-header-right">
                    <span className={`admin-user-role-pill ${targetUser?.role}`}>
                        {targetUser?.role === "admin" ? "★ Administrator" : "Team Member"}
                    </span>
                </div>
            </header>

            {/* Main Content Grid */}
            <main className="admin-user-details-grid">
                {/* Left Column: Information & Task Activity */}
                <div className="admin-user-col">
                    {/* User Profile Card */}
                    <section className="admin-user-card">
                        <div className="admin-user-card-header">
                            <div className="admin-user-card-icon">
                                ♟
                            </div>
                            <div>
                                <h2>Account Information</h2>
                                <p>Basic system identity and access credentials</p>
                            </div>
                        </div>

                        <div className="admin-user-info-list">
                            <div className="admin-user-info-box">
                                <span className="admin-user-info-label">Full Name</span>
                                <span className="admin-user-info-val">{targetUser?.name}</span>
                            </div>

                            <div className="admin-user-info-box">
                                <span className="admin-user-info-label">Email Address</span>
                                <span className="admin-user-info-val">{targetUser?.email}</span>
                            </div>

                            <div className="admin-user-info-box">
                                <span className="admin-user-info-label">System Role</span>
                                <span className="admin-user-info-val" style={{ textTransform: "capitalize" }}>
                                    {targetUser?.role}
                                </span>
                            </div>

                            <div className="admin-user-info-box">
                                <span className="admin-user-info-label">User ID</span>
                                <span className="admin-user-id-code">{targetUser?._id}</span>
                            </div>

                            <div className="admin-user-info-box">
                                <span className="admin-user-info-label">Joined On</span>
                                <span className="admin-user-info-val">{formatDate(targetUser?.createdAt)}</span>
                            </div>

                            <div className="admin-user-info-box">
                                <span className="admin-user-info-label">Last Profile Update</span>
                                <span className="admin-user-info-val">{formatDate(targetUser?.updatedAt)}</span>
                            </div>
                        </div>
                    </section>

                    {/* Assigned Tasks Summary Card */}
                    <section className="admin-user-card">
                        <div className="admin-user-card-header">
                            <div className="admin-user-card-icon green">
                                ✓
                            </div>
                            <div>
                                <h2>Assigned Tasks Activity</h2>
                                <p>Overview of workload assigned to this user</p>
                            </div>
                        </div>

                        <div className="admin-user-tasks-summary">
                            <div className="admin-user-task-stat">
                                <span>Total</span>
                                <strong>{userTasks.length}</strong>
                            </div>
                            <div className="admin-user-task-stat pending">
                                <span>Pending</span>
                                <strong>{pendingTasks}</strong>
                            </div>
                            <div className="admin-user-task-stat in-progress">
                                <span>In Progress</span>
                                <strong>{inProgressTasks}</strong>
                            </div>
                            <div className="admin-user-task-stat completed">
                                <span>Completed</span>
                                <strong>{completedTasks}</strong>
                            </div>
                        </div>
                    </section>

                    {/* Edit User Form Card */}
                    <section className="admin-user-card">
                        <div className="admin-user-card-header">
                            <div className="admin-user-card-icon purple">
                                ✎
                            </div>
                            <div>
                                <h2>Edit Profile</h2>
                                <p>Update name, registered email address or assigned role</p>
                            </div>
                        </div>

                        {editSuccess && (
                            <div className="admin-user-alert success">
                                <span>✓</span>
                                <span>{editSuccess}</span>
                            </div>
                        )}

                        {editError && (
                            <div className="admin-user-alert error">
                                <span>⚠</span>
                                <span>{editError}</span>
                            </div>
                        )}

                        <form onSubmit={handleEditSubmit}>
                            <div className="admin-user-form-group">
                                <label htmlFor="edit-name">Full Name</label>
                                <input
                                    id="edit-name"
                                    name="name"
                                    type="text"
                                    value={editForm.name}
                                    onChange={handleEditChange}
                                    placeholder="Enter full name"
                                    required
                                    disabled={editLoading}
                                />
                            </div>

                            <div className="admin-user-form-group">
                                <label htmlFor="edit-email">Email Address</label>
                                <input
                                    id="edit-email"
                                    name="email"
                                    type="email"
                                    value={editForm.email}
                                    onChange={handleEditChange}
                                    placeholder="user@example.com"
                                    required
                                    disabled={editLoading}
                                />
                            </div>

                            <div className="admin-user-form-group">
                                <label htmlFor="edit-role">Role</label>
                                <select
                                    id="edit-role"
                                    name="role"
                                    value={editForm.role}
                                    onChange={handleEditChange}
                                    disabled={editLoading || isSelf}
                                >
                                    <option value="user">User (Team Member)</option>
                                    <option value="admin">Admin (Full Access)</option>
                                </select>
                                {isSelf && (
                                    <div className="admin-user-field-hint">
                                        ℹ Administrators cannot modify their own system role.
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit"
                                className="admin-user-btn-primary"
                                disabled={editLoading}
                            >
                                {editLoading ? "Saving Changes..." : "Save Profile Changes"}
                            </button>
                        </form>
                    </section>
                </div>

                {/* Right Column: Password Management & Danger Zone */}
                <div className="admin-user-col">
                    {/* Reset Password Card */}
                    <section className="admin-user-card">
                        <div className="admin-user-card-header">
                            <div className="admin-user-card-icon">
                                🔒
                            </div>
                            <div>
                                <h2>Reset Password</h2>
                                <p>Set a new password for this user account</p>
                            </div>
                        </div>

                        {passwordSuccess && (
                            <div className="admin-user-alert success">
                                <span>✓</span>
                                <span>{passwordSuccess}</span>
                            </div>
                        )}

                        {passwordError && (
                            <div className="admin-user-alert error">
                                <span>⚠</span>
                                <span>{passwordError}</span>
                            </div>
                        )}

                        <form onSubmit={handlePasswordSubmit}>
                            <div className="admin-user-form-group">
                                <label htmlFor="newPassword">New Password</label>
                                <input
                                    id="newPassword"
                                    name="newPassword"
                                    type="password"
                                    value={passwordForm.newPassword}
                                    onChange={handlePasswordChange}
                                    placeholder="Minimum 6 characters"
                                    required
                                    disabled={passwordLoading}
                                />
                            </div>

                            <div className="admin-user-form-group">
                                <label htmlFor="confirmPassword">Confirm New Password</label>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    value={passwordForm.confirmPassword}
                                    onChange={handlePasswordChange}
                                    placeholder="Re-type new password"
                                    required
                                    disabled={passwordLoading}
                                />
                            </div>

                            <button
                                type="submit"
                                className="admin-user-btn-primary"
                                disabled={passwordLoading}
                            >
                                {passwordLoading ? "Resetting..." : "Reset Password"}
                            </button>
                        </form>
                    </section>

                    {/* Danger Zone Card */}
                    <section className="admin-user-card">
                        <div className="admin-user-card-header">
                            <div className="admin-user-card-icon red">
                                ⚠
                            </div>
                            <div>
                                <h2>Danger Zone</h2>
                                <p>Irreversible destructive actions</p>
                            </div>
                        </div>

                        {deleteError && (
                            <div className="admin-user-alert error">
                                <span>⚠</span>
                                <span>{deleteError}</span>
                            </div>
                        )}

                        {isSelf ? (
                            <div className="admin-user-self-notice">
                                <strong>Self-Account Protection:</strong>
                                <p style={{ margin: "6px 0 0" }}>
                                    You are currently logged in with this account. You cannot delete your own admin account.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="admin-user-danger-notice">
                                    <strong>Caution:</strong> Deleting this user will permanently remove their access to TaskMate.
                                </div>

                                <button
                                    type="button"
                                    className="admin-user-btn-danger"
                                    onClick={() => setShowDeleteModal(true)}
                                >
                                    <span>✕</span> Delete User Account
                                </button>
                            </>
                        )}
                    </section>
                </div>
            </main>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="admin-user-modal-overlay">
                    <div className="admin-user-modal">
                        <div className="admin-user-modal-icon">
                            ⚠
                        </div>
                        <h3>Confirm Account Deletion</h3>
                        <p>
                            Are you sure you want to permanently delete{" "}
                            <span className="admin-user-modal-target">
                                "{targetUser?.name}" ({targetUser?.email})
                            </span>
                            ? This action cannot be undone.
                        </p>

                        <div className="admin-user-modal-actions">
                            <button
                                type="button"
                                className="admin-user-btn-cancel"
                                onClick={() => setShowDeleteModal(false)}
                                disabled={deleteLoading}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="admin-user-btn-confirm-delete"
                                onClick={handleDeleteUser}
                                disabled={deleteLoading}
                            >
                                {deleteLoading ? "Deleting..." : "Delete User"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUserDetails;
