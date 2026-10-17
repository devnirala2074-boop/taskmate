import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import API from "../../services/api";
import "../../styles/createUser.css";

const CreateUser = () => {
    const navigate = useNavigate();
    const { token } = useAuth();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "user"
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);
            setError("");
            setSuccess("");

            const response = await API.post(
                "/users",
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setSuccess(
                response.data.message ||
                "User created successfully."
            );

            setFormData({
                name: "",
                email: "",
                password: "",
                role: "user"
            });

        } catch (err) {
            console.error("Create user error:", err);

            setError(
                err.response?.data?.message ||
                "Failed to create user."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-user-page">

            <div className="create-user-orb create-user-orb-one"></div>
            <div className="create-user-orb create-user-orb-two"></div>

            <header className="create-user-header glass-panel">

                <div className="create-user-brand">

                    <div className="create-user-logo">
                        ✓
                    </div>

                    <div>
                        <h2>TaskMate</h2>
                        <span>Admin Workspace</span>
                    </div>

                </div>

                <div className="create-user-header-action">

                    <button
                        onClick={() =>
                            navigate("/admin/users")
                        }
                    >
                        ← Back to Users
                    </button>

                </div>

            </header>

            <main className="create-user-content">

                <div className="create-user-title">

                    <span className="create-user-badge">
                        ✦ USER MANAGEMENT
                    </span>

                    <h1>
                        Create <span>User.</span>
                    </h1>

                    <p>
                        Create a new user account from the
                        administration panel.
                    </p>

                </div>

                <div className="create-user-card glass-panel">

                    <div className="create-user-card-header">

                        <div className="create-user-icon">
                            ♟
                        </div>

                        <div>
                            <h2>New User</h2>
                            <p>
                                Enter the account information below.
                            </p>
                        </div>

                    </div>

                    {error && (
                        <div className="create-user-error">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="create-user-success">
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>

                        <div className="create-user-form-group">

                            <label>
                                Full Name
                            </label>

                            <input
                                type="text"
                                name="name"
                                placeholder="Enter full name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />

                        </div>

                        <div className="create-user-form-group">

                            <label>
                                Email Address
                            </label>

                            <input
                                type="email"
                                name="email"
                                placeholder="Enter email address"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />

                        </div>

                        <div className="create-user-form-group">

                            <label>
                                Password
                            </label>

                            <input
                                type="password"
                                name="password"
                                placeholder="Minimum 6 characters"
                                value={formData.password}
                                onChange={handleChange}
                                minLength={6}
                                required
                            />

                        </div>

                        <div className="create-user-form-group">

                            <label>
                                Account Role
                            </label>

                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                            >
                                <option value="user">
                                    User
                                </option>

                                <option value="admin">
                                    Admin
                                </option>
                            </select>

                        </div>

                        <div className="create-user-actions">

                            <button
                                type="button"
                                className="create-user-cancel"
                                onClick={() =>
                                    navigate("/admin/users")
                                }
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="create-user-submit"
                                disabled={loading}
                            >
                                {loading
                                    ? "Creating..."
                                    : "Create User"}
                            </button>

                        </div>

                    </form>

                </div>

            </main>

            <footer className="create-user-footer">
                <span>© 2026 TaskMate</span>
                <span>Admin Workspace</span>
                <span>Build Better. Together.</span>
            </footer>

        </div>
    );
};

export default CreateUser;