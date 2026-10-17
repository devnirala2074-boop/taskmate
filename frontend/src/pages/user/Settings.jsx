import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../styles/settings.css";

const UserSettings = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // Preferences stored in localStorage
    const [preferences, setPreferences] = useState(() => {
        const saved = localStorage.getItem("taskmate_user_prefs");
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {}
        }
        return {
            taskAlerts: true,
            dueReminders: true,
            soundEffects: true
        };
    });

    const togglePref = (key) => {
        setPreferences((prev) => {
            const updated = { ...prev, [key]: !prev[key] };
            localStorage.setItem("taskmate_user_prefs", JSON.stringify(updated));
            return updated;
        });
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <div className="settings-page">
            <div className="settings-title-section">
                <span className="user-dashboard-badge">✦ WORKSPACE CONFIGURATION</span>
                <h1>
                    User <span>Settings.</span>
                </h1>
                <p>Customize your personal workspace, alerts, and account view.</p>
            </div>

            <div className="settings-grid">
                {/* Left Column: Account Details */}
                <div className="settings-col">
                    <section className="settings-card glass-panel">
                        <div className="settings-card-header">
                            <div className="settings-card-icon">♟</div>
                            <div>
                                <h2>Account Information</h2>
                                <p>Your registered team profile</p>
                            </div>
                        </div>

                        <div className="admin-user-info-list" style={{ gridTemplateColumns: "1fr" }}>
                            <div className="admin-user-info-box">
                                <span className="admin-user-info-label">Full Name</span>
                                <span className="admin-user-info-val">{user?.name || "User"}</span>
                            </div>

                            <div className="admin-user-info-box">
                                <span className="admin-user-info-label">Email Address</span>
                                <span className="admin-user-info-val">{user?.email}</span>
                            </div>

                            <div className="admin-user-info-box">
                                <span className="admin-user-info-label">Workspace Role</span>
                                <span className="admin-user-info-val" style={{ textTransform: "capitalize" }}>
                                    Team Member ({user?.role || "user"})
                                </span>
                            </div>

                            <div className="admin-user-info-box">
                                <span className="admin-user-info-label">User Account ID</span>
                                <span className="admin-user-id-code">{user?.id || user?._id}</span>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Right Column: Preferences & Sign Out */}
                <div className="settings-col">
                    <section className="settings-card glass-panel">
                        <div className="settings-card-header">
                            <div className="settings-card-icon green">⚙</div>
                            <div>
                                <h2>Notification Alerts</h2>
                                <p>Manage how TaskMate notifies you</p>
                            </div>
                        </div>

                        <div className="settings-toggle-list">
                            <div className="settings-toggle-row">
                                <div className="settings-toggle-label">
                                    <strong>Task Assignment Alerts</strong>
                                    <span>Notify when a new task is assigned</span>
                                </div>
                                <label className="settings-switch">
                                    <input
                                        type="checkbox"
                                        checked={preferences.taskAlerts}
                                        onChange={() => togglePref("taskAlerts")}
                                    />
                                    <span className="settings-slider"></span>
                                </label>
                            </div>

                            <div className="settings-toggle-row">
                                <div className="settings-toggle-label">
                                    <strong>Due Date Reminders</strong>
                                    <span>Highlight tasks approaching deadlines</span>
                                </div>
                                <label className="settings-switch">
                                    <input
                                        type="checkbox"
                                        checked={preferences.dueReminders}
                                        onChange={() => togglePref("dueReminders")}
                                    />
                                    <span className="settings-slider"></span>
                                </label>
                            </div>

                            <div className="settings-toggle-row">
                                <div className="settings-toggle-label">
                                    <strong>Interaction Sounds</strong>
                                    <span>Play feedback sound on status updates</span>
                                </div>
                                <label className="settings-switch">
                                    <input
                                        type="checkbox"
                                        checked={preferences.soundEffects}
                                        onChange={() => togglePref("soundEffects")}
                                    />
                                    <span className="settings-slider"></span>
                                </label>
                            </div>
                        </div>
                    </section>

                    <section className="settings-card glass-panel">
                        <div className="settings-card-header">
                            <div className="settings-card-icon purple">🔒</div>
                            <div>
                                <h2>Session Management</h2>
                                <p>Active session security</p>
                            </div>
                        </div>

                        <p style={{ color: "#94a3b8", fontSize: "14px", lineHeight: "1.6", margin: "0 0 16px" }}>
                            You are signed in as <strong>{user?.name}</strong>. Signing out will clear your session token from this browser.
                        </p>

                        <button
                            type="button"
                            className="admin-user-btn-danger"
                            onClick={handleLogout}
                        >
                            <span>↪</span> Sign Out
                        </button>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default UserSettings;
