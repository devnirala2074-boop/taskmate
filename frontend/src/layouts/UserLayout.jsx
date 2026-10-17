import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/userLayout.css";

const UserLayout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <div className="user-layout">

            {/* HEADER */}
            <header className="user-layout-header">

                <div className="user-brand">
                    <div className="user-brand-icon">✓</div>

                    <div>
                        <h2>TaskMate</h2>
                        <span>User Workspace</span>
                    </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <div className="user-profile">
                        <div className="user-avatar">
                            {user?.name?.charAt(0).toUpperCase() || "U"}
                        </div>

                        <div>
                            <strong>{user?.name || "User"}</strong>
                            <span>Team Member</span>
                        </div>
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


            {/* MAIN */}
            <div className="user-layout-body">

                {/* SIDEBAR */}
                <aside className="user-layout-sidebar">

                    <div className="user-layout-label">
                        WORKSPACE
                    </div>

                    <button
                        className={`user-layout-item ${
                            location.pathname === "/user/dashboard" ? "active" : ""
                        }`}
                        onClick={() => navigate("/user/dashboard")}
                    >
                        <span>⌂</span>
                        Dashboard
                    </button>

                    <button
                        className={`user-layout-item ${
                            location.pathname.startsWith("/user/tasks") ? "active" : ""
                        }`}
                        onClick={() => navigate("/user/tasks")}
                    >
                        <span>✓</span>
                        My Tasks
                    </button>

                    <button
                        className={`user-layout-item ${
                            location.pathname === "/user/activity" ? "active" : ""
                        }`}
                        onClick={() => navigate("/user/activity")}
                    >
                        <span>◷</span>
                        Activity
                    </button>

                    <div className="user-layout-divider"></div>

                    <div className="user-layout-label">
                        ACCOUNT
                    </div>

                    <button
                        className={`user-layout-item ${
                            location.pathname === "/user/settings" ? "active" : ""
                        }`}
                        onClick={() => navigate("/user/settings")}
                    >
                        <span>⚙</span>
                        Settings
                    </button>

                    <button
                        className="user-layout-item"
                        onClick={handleLogout}
                    >
                        <span>↪</span>
                        Logout
                    </button>

                </aside>


                {/* PAGE CONTENT */}
                <main className="user-layout-content">
                    {children}
                </main>

            </div>


            {/* FOOTER */}
            <footer className="user-layout-footer">
                © 2026 TaskMate. All rights reserved.
            </footer>

        </div>
    );
};

export default UserLayout;