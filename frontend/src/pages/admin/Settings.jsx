import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import userService from "../../services/userService";
import "../../styles/settings.css";

const AdminSettings = () => {
    const { user, token, logout, login } = useAuth();
    const navigate = useNavigate();

    // Profile form state
    const [profileForm, setProfileForm] = useState({
        name: user?.name || "",
        email: user?.email || ""
    });
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileSuccess, setProfileSuccess] = useState("");
    const [profileError, setProfileError] = useState("");

    // Password form state
    const [passwordForm, setPasswordForm] = useState({
        newPassword: "",
        confirmPassword: ""
    });
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordSuccess, setPasswordSuccess] = useState("");
    const [passwordError, setPasswordError] = useState("");

    // Preferences (saved in localStorage)
    const [preferences, setPreferences] = useState(() => {
        const saved = localStorage.getItem("taskmate_admin_prefs");
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {}
        }
        return {
            desktopNotifications: true,
            autoRefresh: true,
            taskSound: false,
            compactMode: false
        };
    });

    const togglePref = (key) => {
        setPreferences((prev) => {
            const updated = { ...prev, [key]: !prev[key] };
            localStorage.setItem("taskmate_admin_prefs", JSON.stringify(updated));
            return updated;
        });
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setProfileError("");
        setProfileSuccess("");

        if (!profileForm.name.trim() || !profileForm.email.trim()) {
            setProfileError("Name and email are required.");
            return;
        }

        try {
            setProfileLoading(true);
            const response = await userService.updateUser(
                user.id,
                {
                    name: profileForm.name.trim(),
                    email: profileForm.email.trim()
                },
                token
            );

            // Update AuthContext & localStorage with new user data
            login(token, response.user);
            setProfileSuccess("Administrator profile updated successfully.");
        } catch (err) {
            console.error("Profile update error:", err);
            setProfileError(
                err.response?.data?.message || "Failed to update profile."
            );
        } finally {
            setProfileLoading(false);
        }
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
                user.id,
                passwordForm.newPassword,
                token
            );
            setPasswordSuccess(
                response.message || "Password changed successfully."
            );
            setPasswordForm({ newPassword: "", confirmPassword: "" });
        } catch (err) {
            console.error("Password reset error:", err);
            setPasswordError(
                err.response?.data?.message || "Failed to reset password."
            );
        } finally {
            setPasswordLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

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
                    <button
                        className="sidebar-item"
                        onClick={() => navigate("/admin/activity")}
                    >
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
                    <button className="sidebar-item active">
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
                <main className="dashboard-content settings-page">
                    <div className="settings-title-section">
                        <span className="dashboard-badge">✦ PREFERENCES & CONFIGURATION</span>
                        <h1>
                            Admin <span>Settings.</span>
                        </h1>
                        <p>Manage your account credentials, workspace preferences, and system parameters.</p>
                    </div>

                    <div className="settings-grid">
                        {/* Left Column: Profile & Security */}
                        <div className="settings-col">
                            {/* Profile Card */}
                            <section className="settings-card glass-panel">
                                <div className="settings-card-header">
                                    <div className="settings-card-icon">✎</div>
                                    <div>
                                        <h2>Administrator Profile</h2>
                                        <p>Update your display name and login email address</p>
                                    </div>
                                </div>

                                {profileSuccess && (
                                    <div className="admin-user-alert success">
                                        <span>✓</span>
                                        <span>{profileSuccess}</span>
                                    </div>
                                )}
                                {profileError && (
                                    <div className="admin-user-alert error">
                                        <span>⚠</span>
                                        <span>{profileError}</span>
                                    </div>
                                )}

                                <form onSubmit={handleProfileSubmit}>
                                    <div className="admin-user-form-group">
                                        <label>Full Name</label>
                                        <input
                                            type="text"
                                            value={profileForm.name}
                                            onChange={(e) =>
                                                setProfileForm((prev) => ({
                                                    ...prev,
                                                    name: e.target.value
                                                }))
                                            }
                                            placeholder="Admin full name"
                                            required
                                            disabled={profileLoading}
                                        />
                                    </div>

                                    <div className="admin-user-form-group">
                                        <label>Email Address</label>
                                        <input
                                            type="email"
                                            value={profileForm.email}
                                            onChange={(e) =>
                                                setProfileForm((prev) => ({
                                                    ...prev,
                                                    email: e.target.value
                                                }))
                                            }
                                            placeholder="admin@example.com"
                                            required
                                            disabled={profileLoading}
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="admin-user-btn-primary"
                                        disabled={profileLoading}
                                    >
                                        {profileLoading ? "Updating Profile..." : "Save Profile Details"}
                                    </button>
                                </form>
                            </section>

                            {/* Password Reset Card */}
                            <section className="settings-card glass-panel">
                                <div className="settings-card-header">
                                    <div className="settings-card-icon purple">🔒</div>
                                    <div>
                                        <h2>Change Password</h2>
                                        <p>Secure your administrator account with a new password</p>
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
                                        <label>New Password</label>
                                        <input
                                            type="password"
                                            value={passwordForm.newPassword}
                                            onChange={(e) =>
                                                setPasswordForm((prev) => ({
                                                    ...prev,
                                                    newPassword: e.target.value
                                                }))
                                            }
                                            placeholder="Minimum 6 characters"
                                            required
                                            disabled={passwordLoading}
                                        />
                                    </div>

                                    <div className="admin-user-form-group">
                                        <label>Confirm New Password</label>
                                        <input
                                            type="password"
                                            value={passwordForm.confirmPassword}
                                            onChange={(e) =>
                                                setPasswordForm((prev) => ({
                                                    ...prev,
                                                    confirmPassword: e.target.value
                                                }))
                                            }
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
                                        {passwordLoading ? "Updating Password..." : "Update Password"}
                                    </button>
                                </form>
                            </section>
                        </div>

                        {/* Right Column: Preferences & System Info */}
                        <div className="settings-col">
                            {/* Preferences Card */}
                            <section className="settings-card glass-panel">
                                <div className="settings-card-header">
                                    <div className="settings-card-icon green">⚙</div>
                                    <div>
                                        <h2>Workspace Preferences</h2>
                                        <p>Tailor your administrative experience</p>
                                    </div>
                                </div>

                                <div className="settings-toggle-list">
                                    <div className="settings-toggle-row">
                                        <div className="settings-toggle-label">
                                            <strong>Desktop Notifications</strong>
                                            <span>Display alerts on task status changes</span>
                                        </div>
                                        <label className="settings-switch">
                                            <input
                                                type="checkbox"
                                                checked={preferences.desktopNotifications}
                                                onChange={() =>
                                                    togglePref("desktopNotifications")
                                                }
                                            />
                                            <span className="settings-slider"></span>
                                        </label>
                                    </div>

                                    <div className="settings-toggle-row">
                                        <div className="settings-toggle-label">
                                            <strong>Auto-Refresh Feeds</strong>
                                            <span>Periodically poll for background updates</span>
                                        </div>
                                        <label className="settings-switch">
                                            <input
                                                type="checkbox"
                                                checked={preferences.autoRefresh}
                                                onChange={() => togglePref("autoRefresh")}
                                            />
                                            <span className="settings-slider"></span>
                                        </label>
                                    </div>

                                    <div className="settings-toggle-row">
                                        <div className="settings-toggle-label">
                                            <strong>Completion Sound</strong>
                                            <span>Play audio cue when a task is completed</span>
                                        </div>
                                        <label className="settings-switch">
                                            <input
                                                type="checkbox"
                                                checked={preferences.taskSound}
                                                onChange={() => togglePref("taskSound")}
                                            />
                                            <span className="settings-slider"></span>
                                        </label>
                                    </div>
                                </div>
                            </section>

                            {/* System Status Card */}
                            <section className="settings-card glass-panel">
                                <div className="settings-card-header">
                                    <div className="settings-card-icon">⚡</div>
                                    <div>
                                        <h2>System Environment</h2>
                                        <p>Connected platform health and runtime status</p>
                                    </div>
                                </div>

                                <div className="settings-sys-list">
                                    <div className="settings-sys-item">
                                        <span>TaskMate Version</span>
                                        <strong>v1.2.0 (Stable)</strong>
                                    </div>
                                    <div className="settings-sys-item">
                                        <span>Backend API Status</span>
                                        <span className="settings-badge-ok">Online (Port 5000)</span>
                                    </div>
                                    <div className="settings-sys-item">
                                        <span>Database Connection</span>
                                        <span className="settings-badge-ok">MongoDB Active</span>
                                    </div>
                                    <div className="settings-sys-item">
                                        <span>Active Session User</span>
                                        <strong>{user?.name} ({user?.email})</strong>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    className="admin-user-btn-danger"
                                    style={{ marginTop: "20px" }}
                                    onClick={handleLogout}
                                >
                                    <span>↪</span> Sign Out of Workspace
                                </button>
                            </section>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminSettings;
