import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import API from "../../services/api";
import "../../styles/adminUsers.css";

const AdminUsers = () => {
    const { user, token, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await API.get("/users", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const regularUsers = (response.data.users || []).filter(
                (u) => u.role === "user" && u._id !== user?._id && u.email !== user?.email
            );
            setUsers(regularUsers);
        } catch (err) {
            console.error("Fetch users error:", err);

            setError(
                err.response?.data?.message ||
                "Failed to load users."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchUsers();
        }
    }, [token]);

    const getInitial = (name) => {
        return name?.charAt(0).toUpperCase() || "U";
    };

    const formatDate = (date) => {
        if (!date) return "—";

        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    };

    return (
        <div className="admin-users-page">

            {/* Background Orbs */}
            <div className="admin-users-orb users-orb-one"></div>
            <div className="admin-users-orb users-orb-two"></div>

            {/* Header */}
            <header className="admin-users-header glass-panel">

                <div className="admin-users-brand">
                    <div className="admin-users-logo">
                        ✓
                    </div>

                    <div>
                        <h2>TaskMate</h2>
                        <span>Admin Workspace</span>
                    </div>
                </div>

                <div className="admin-users-profile">

                    <div className="admin-users-avatar">
                        {getInitial(user?.name)}
                    </div>

                    <div>
                        <strong>
                            {user?.name || "Admin"}
                        </strong>

                        <span>
                            Administrator
                        </span>
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

            {/* Main Layout */}
            <div className="admin-users-layout">

                {/* Sidebar */}
                <aside className="admin-users-sidebar glass-panel">

                    <div className="admin-users-label">
                        WORKSPACE
                    </div>

                    <button
                        className="admin-users-nav-item"
                        onClick={() =>
                            navigate("/admin/dashboard")
                        }
                    >
                        <span>⌂</span>
                        Dashboard
                    </button>

                    <button
                        className="admin-users-nav-item"
                        onClick={() =>
                            navigate("/admin/tasks")
                        }
                    >
                        <span>✓</span>
                        Tasks
                    </button>

                    <button
                        className="admin-users-nav-item active"
                    >
                        <span>♟</span>
                        Users
                    </button>

                    <button
                        className="admin-users-nav-item"
                        onClick={() =>
                            navigate("/admin/activity")
                        }
                    >
                        <span>◷</span>
                        Activity
                    </button>

                    <div className="admin-users-divider"></div>

                    <div className="admin-users-label">
                        MANAGEMENT
                    </div>

                    <button
                        className="admin-users-nav-item"
                        onClick={() =>
                            navigate("/admin/create-task")
                        }
                    >
                        <span>＋</span>
                        Create Task
                    </button>

                    <button
                        className="admin-users-nav-item"
                        onClick={() =>
                            navigate("/admin/settings")
                        }
                    >
                        <span>⚙</span>
                        Settings
                    </button>

                    <button
                        className="admin-users-nav-item logout-btn"
                        onClick={handleLogout}
                    >
                        <span>↪</span>
                        Logout
                    </button>

                </aside>

                {/* Content */}
                <main className="admin-users-content">

                    <div className="admin-users-title-section">

                        <div>

                            <span className="admin-users-badge">
                                ✦ USER MANAGEMENT
                            </span>

                            <h1>
                                All <span>Users.</span>
                            </h1>

                            <p>
                                View and manage all registered users.
                            </p>

                        </div>

                        <div className="admin-users-title-actions">

    <div className="admin-users-count-card">
        <span>Total Users</span>
        <strong>{users.length}</strong>
    </div>

    <button
        className="admin-users-create-button"
        onClick={() =>
            navigate("/admin/users/create")
        }
    >
        <span>＋</span>
        Create User
    </button>

</div>
                    </div>

                    {error && (
                        <div className="admin-users-error">
                            {error}
                        </div>
                    )}

                    {/* User List */}
                    <div className="admin-users-card glass-panel">

                        <div className="admin-users-card-header">

                            <div>
                                <h2>User List</h2>

                                <p>
                                    {users.length}{" "}
                                    {users.length === 1
                                        ? "user"
                                        : "users"}{" "}
                                    registered
                                </p>
                            </div>

                            <button
                                className="admin-users-refresh"
                                onClick={fetchUsers}
                            >
                                ↻ Refresh
                            </button>

                        </div>

                        {loading ? (

                            <div className="admin-users-empty">

                                <div className="admin-users-empty-icon">
                                    ◷
                                </div>

                                <h3>
                                    Loading users...
                                </h3>

                                <p>
                                    Fetching registered users.
                                </p>

                            </div>

                        ) : users.length === 0 ? (

                            <div className="admin-users-empty">

                                <div className="admin-users-empty-icon">
                                    ♟
                                </div>

                                <h3>
                                    No users found
                                </h3>

                                <p>
                                    No registered users are available.
                                </p>

                            </div>

                        ) : (

                            <div className="admin-users-table-wrapper">

                                <table className="admin-users-table">

                                    <thead>

                                        <tr>
                                            <th>User</th>
                                            <th>Email</th>
                                            <th>Role</th>
                                            <th>Joined</th>
                                            <th>Action</th>
                                        </tr>

                                    </thead>

                                    <tbody>

                                        {users.map((currentUser) => (

                                            <tr key={currentUser._id}>

                                                <td>

                                                    <div className="admin-user-cell">

                                                        <div className="admin-user-table-avatar">
                                                            {getInitial(
                                                                currentUser.name
                                                            )}
                                                        </div>

                                                        <div>
                                                            <strong>
                                                                {currentUser.name}
                                                            </strong>

                                                            <span>
                                                                User ID:{" "}
                                                                {currentUser._id.slice(
                                                                    -6
                                                                )}
                                                            </span>
                                                        </div>

                                                    </div>

                                                </td>

                                                <td>

                                                    <span className="admin-user-email">
                                                        {currentUser.email}
                                                    </span>

                                                </td>

                                                <td>

                                                    <span
                                                        className={`admin-user-role ${
                                                            currentUser.role
                                                        }`}
                                                    >
                                                        {currentUser.role}
                                                    </span>

                                                </td>

                                                <td>

                                                    <span className="admin-user-date">
                                                        {formatDate(
                                                            currentUser.createdAt
                                                        )}
                                                    </span>

                                                </td>

                                                <td>

                                                    <button
                                                        className="admin-user-view-button"
                                                        onClick={() =>
                                                            navigate(
                                                                `/admin/users/${currentUser._id}`
                                                            )
                                                        }
                                                    >
                                                        View
                                                    </button>

                                                </td>

                                            </tr>

                                        ))}

                                    </tbody>

                                </table>

                            </div>

                        )}

                    </div>

                </main>

            </div>

            {/* Footer */}
            <footer className="admin-users-footer">

                <span>
                    © 2026 TaskMate
                </span>

                <span>
                    Admin Workspace
                </span>

                <span>
                    Build Better. Together.
                </span>

            </footer>

        </div>
    );
};

export default AdminUsers;