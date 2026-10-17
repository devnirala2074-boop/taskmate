import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import authService from "../services/authService";
import { useAuth } from "../context/AuthContext";

import "../styles/global.css";
import "../styles/glass.css";
import "../styles/animations.css";

const Login = () => {

    const [role, setRole] = useState("Admin");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [activeModal, setActiveModal] = useState(null);
    const [theme, setTheme] = useState(() => localStorage.getItem("taskmate_theme") || "dark");

    const [customGoogleEmail, setCustomGoogleEmail] = useState("");
    const [customGoogleName, setCustomGoogleName] = useState("");
    const [showCustomGoogle, setShowCustomGoogle] = useState(false);

    const navigate = useNavigate();
    const { login } = useAuth();

    // Listen to hash changes (e.g. #about, #product, #features, #google)
    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash.replace("#", "").toLowerCase();
            if (["product", "features", "about", "privacy", "terms", "support", "google"].includes(hash)) {
                setActiveModal(hash);
            } else if (!hash) {
                setActiveModal(null);
            }
        };

        handleHashChange();
        window.addEventListener("hashchange", handleHashChange);
        return () => window.removeEventListener("hashchange", handleHashChange);
    }, []);

    // Close modal on Escape key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                closeModal();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    const openModal = (modalKey) => {
        window.location.hash = modalKey;
        setActiveModal(modalKey);
    };

    const closeModal = () => {
        if (window.location.hash) {
            window.history.replaceState(null, "", window.location.pathname);
        }
        setActiveModal(null);
        setShowCustomGoogle(false);
    };

    const toggleTheme = () => {
        const nextTheme = theme === "dark" ? "ambient" : "dark";
        setTheme(nextTheme);
        localStorage.setItem("taskmate_theme", nextTheme);
    };

    const handleGoogleAuth = async (googleUser) => {
        setError("");
        setLoading(true);

        try {
            const data = await authService.googleLogin({
                email: googleUser.email,
                name: googleUser.name,
                role: role.toLowerCase()
            });

            const loggedInUser = data.user;

            // Save token + user globally
            login(data.token, loggedInUser);

            // Role-based redirect
            if (loggedInUser.role === "admin") {
                navigate("/admin/dashboard");
            } else {
                navigate("/user/dashboard");
            }

        } catch (err) {
            console.error("Google login error:", err);
            setError(
                err.response?.data?.message ||
                "Google authentication failed. Please try again."
            );
        } finally {
            setLoading(false);
            closeModal();
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {

            const data = await authService.loginUser(
                email,
                password
            );

            const loggedInUser = data.user;

            /*
             * Role selected on UI must match
             * actual backend role.
             */
            if (
                role.toLowerCase() !==
                loggedInUser.role.toLowerCase()
            ) {
                setError(
                    `This account is registered as ${loggedInUser.role}. Please select the correct role.`
                );

                setLoading(false);
                return;
            }


            // Save token + user globally
            login(
                data.token,
                loggedInUser
            );


            // Role-based redirect
            if (loggedInUser.role === "admin") {

                navigate("/admin/dashboard");

            } else {

                navigate("/user/dashboard");

            }

        } catch (err) {

            console.error("Login error:", err);

            setError(
                err.response?.data?.message ||
                "Unable to login. Please check your email and password."
            );

        } finally {

            setLoading(false);

        }
    };


    return (
        <div className={`login-page ${theme === "ambient" ? "ambient" : ""}`}>

            <div className="background-orb orb-one"></div>
            <div className="background-orb orb-two"></div>
            <div className="background-orb orb-three"></div>


            {/* =========================================
                HEADER
            ========================================= */}

            <header className="login-header">

                <div
                    className="brand"
                    onClick={() => {
                        closeModal();
                        window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    style={{ cursor: "pointer" }}
                    title="TaskMate Home"
                >

                    <div className="brand-icon">
                        ✓
                    </div>

                    <div>
                        <h2>TaskMate</h2>

                        <span>
                            Task Management System
                        </span>
                    </div>

                </div>


                <nav className="login-nav">

                    <button
                        type="button"
                        className={`nav-link-btn ${activeModal === "product" ? "active" : ""}`}
                        onClick={() => openModal("product")}
                    >
                        Product
                    </button>

                    <button
                        type="button"
                        className={`nav-link-btn ${activeModal === "features" ? "active" : ""}`}
                        onClick={() => openModal("features")}
                    >
                        Features
                    </button>

                    <button
                        type="button"
                        className={`nav-link-btn ${activeModal === "about" ? "active" : ""}`}
                        onClick={() => openModal("about")}
                    >
                        About
                    </button>

                    <button
                        type="button"
                        className={`theme-button ${theme === "ambient" ? "active" : ""}`}
                        onClick={toggleTheme}
                        title={`Current: ${theme === "ambient" ? "Aurora Ambient" : "Midnight Blue"}. Click to switch theme.`}
                        aria-label="Toggle visual theme"
                    >
                        {theme === "ambient" ? "◑" : "◐"}
                    </button>

                </nav>

            </header>


            {/* =========================================
                MAIN
            ========================================= */}

            <main className="login-main">


                {/* =========================================
                    INTRO
                ========================================= */}

                <section className="login-intro">

                    <div className="intro-badge">
                        ✦ Smart Task Management
                    </div>


                    <h1>
                        Plan.
                        <br />
                        Track.
                        <br />
                        <span>
                            Achieve.
                        </span>
                    </h1>


                    <p className="login-hero-tagline">
                        Together towards a better tomorrow.
                    </p>

                    <p>
                        A simple, beautiful way to manage tasks, collaborate with your team, and build better results together.
                    </p>


                    <div className="intro-features">

                        <div className="intro-feature">

                            <div>
                                ⚡
                            </div>

                            <span>
                                Stay Organized
                            </span>

                        </div>


                        <div className="intro-feature">

                            <div>
                                ♟
                            </div>

                            <span>
                                Work Together
                            </span>

                        </div>


                        <div className="intro-feature">

                            <div>
                                ◷
                            </div>

                            <span>
                                Turn Goals into Results
                            </span>

                        </div>

                    </div>


                    <div className="quote">

                        <p>
                            "The secret of getting ahead is getting started."
                        </p>

                        <span>
                            — Mark Twain
                        </span>

                    </div>

                </section>


                {/* =========================================
                    LOGIN CARD
                ========================================= */}

                <section className="login-card glass-card">

                    <div className="login-logo">
                        ✓
                    </div>


                    <div className="login-title">

                        <h2>
                            Welcome Back
                        </h2>

                        <p>
                            Sign in to your account
                        </p>

                    </div>


                    {/* ROLE */}

                    <div className="role-selector">

                        <button
                            type="button"
                            className={
                                role === "Admin"
                                    ? "active"
                                    : ""
                            }
                            onClick={() => {
                                setRole("Admin");
                                setError("");
                            }}
                        >
                            Admin
                        </button>


                        <button
                            type="button"
                            className={
                                role === "User"
                                    ? "active"
                                    : ""
                            }
                            onClick={() => {
                                setRole("User");
                                setError("");
                            }}
                        >
                            User
                        </button>

                    </div>


                    <form onSubmit={handleSubmit}>


                        {/* EMAIL */}

                        <div className="input-group">

                            <span className="input-icon">
                                ✉
                            </span>

                            <input
                                type="email"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) =>
                                    setEmail(e.target.value)
                                }
                                required
                            />

                        </div>


                        {/* PASSWORD */}

                        <div className="input-group">

                            <span className="input-icon">
                                🔒
                            </span>

                            <input
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                placeholder="Password"
                                value={password}
                                onChange={(e) =>
                                    setPassword(e.target.value)
                                }
                                required
                            />

                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() =>
                                    setShowPassword(
                                        !showPassword
                                    )
                                }
                            >
                                {showPassword
                                    ? "◉"
                                    : "○"}
                            </button>

                        </div>


                        {/* ERROR */}

                        {error && (
                            <div className="login-error">
                                {error}
                            </div>
                        )}


                        {/* OPTIONS */}

                        <div className="login-options">

                            <label className="remember">

                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) =>
                                        setRememberMe(
                                            e.target.checked
                                        )
                                    }
                                />

                                <span>
                                    Remember me
                                </span>

                            </label>


                            <button
                                type="button"
                                className="forgot-password"
                            >
                                Forgot password?
                            </button>

                        </div>


                        {/* LOGIN BUTTON */}

                        <button
                            type="submit"
                            className="login-button"
                            disabled={loading}
                        >

                            {loading
                                ? "Signing In..."
                                : "Sign In"}

                            {!loading && (
                                <span>
                                    →
                                </span>
                            )}

                        </button>

                    </form>


                    {/* DIVIDER */}

                    <div className="login-divider">

                        <span></span>

                        <p>
                            or
                        </p>

                        <span></span>

                    </div>


                    {/* GOOGLE */}

                    <button
                        type="button"
                        className="google-button"
                        onClick={() => openModal("google")}
                        id="google-signin-btn"
                    >
                        <span className="google-svg-wrap">
                            <svg width="20" height="20" viewBox="0 0 24 24">
                                <path
                                    fill="#4285F4"
                                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                                />
                                <path
                                    fill="#34A853"
                                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                                />
                                <path
                                    fill="#FBBC05"
                                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                                />
                                <path
                                    fill="#EA4335"
                                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                                />
                            </svg>
                        </span>

                        Continue with Google
                    </button>


                    {/* REGISTER */}

                    <div className="register-text">

                        New here?

                        <button type="button">
                            Contact Administrator
                        </button>

                    </div>

                </section>

            </main>


            {/* =========================================
                FOOTER
            ========================================= */}

            <footer className="login-footer">

                <span>
                    © 2026 TaskMate. All rights reserved.
                </span>

                <div>

                    <button
                        type="button"
                        className="footer-link-btn"
                        onClick={() => openModal("privacy")}
                    >
                        Privacy
                    </button>

                    <button
                        type="button"
                        className="footer-link-btn"
                        onClick={() => openModal("terms")}
                    >
                        Terms
                    </button>

                    <button
                        type="button"
                        className="footer-link-btn"
                        onClick={() => openModal("support")}
                    >
                        Support
                    </button>

                </div>

                <span>
                    Build Better. Together.
                </span>

            </footer>


            {/* =========================================
                NAVBAR & FOOTER MODALS
            ========================================= */}
            {activeModal && (
                <div className="tm-modal-overlay" onClick={closeModal}>
                    <div className="tm-modal-card" onClick={(e) => e.stopPropagation()}>

                        {/* GOOGLE SIGN IN MODAL */}
                        {activeModal === "google" && (
                            <>
                                <div className="tm-modal-header" style={{ justifyContent: "center", flexDirection: "column", alignItems: "center", textAlign: "center", position: "relative" }}>
                                    <div style={{ margin: "0 auto 12px", width: "48px", height: "48px", borderRadius: "14px", background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,255,255,0.1)" }}>
                                        <svg width="26" height="26" viewBox="0 0 24 24">
                                            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                                            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                                            <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                                            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                                        </svg>
                                    </div>
                                    <div className="tm-modal-title-wrap" style={{ textAlign: "center", width: "100%" }}>
                                        <h2 style={{ fontSize: "20px" }}>Sign in with Google</h2>
                                        <p style={{ margin: "4px 0 0 0", color: "#94a3b8", fontSize: "13px" }}>Choose an account to continue to TaskMate</p>
                                    </div>
                                    <button className="tm-modal-close-btn" style={{ position: "absolute", top: "0", right: "0" }} onClick={closeModal} title="Close">✕</button>
                                </div>

                                <div className="tm-modal-body">
                                    <div className="google-account-list">
                                        <button
                                            type="button"
                                            className="google-account-item"
                                            onClick={() => handleGoogleAuth({ email: "admin@test.com", name: "TaskMate Admin" })}
                                        >
                                            <div className="google-account-avatar" style={{ background: "#4338ca", color: "#c7d2fe" }}>A</div>
                                            <div className="google-account-info">
                                                <div className="google-account-name">
                                                    TaskMate Admin
                                                    <span className="google-account-badge admin">Administrator</span>
                                                </div>
                                                <div className="google-account-email">admin@test.com</div>
                                            </div>
                                            <span style={{ color: "#64748b", fontSize: "14px" }}>→</span>
                                        </button>

                                        <button
                                            type="button"
                                            className="google-account-item"
                                            onClick={() => handleGoogleAuth({ email: "yash@gmail.com", name: "Yash" })}
                                        >
                                            <div className="google-account-avatar" style={{ background: "#0369a1", color: "#bae6fd" }}>Y</div>
                                            <div className="google-account-info">
                                                <div className="google-account-name">
                                                    Yash
                                                    <span className="google-account-badge user">Team Member</span>
                                                </div>
                                                <div className="google-account-email">yash@gmail.com</div>
                                            </div>
                                            <span style={{ color: "#64748b", fontSize: "14px" }}>→</span>
                                        </button>

                                        {email && email !== "admin@test.com" && email !== "yash@gmail.com" && (
                                            <button
                                                type="button"
                                                className="google-account-item"
                                                onClick={() => handleGoogleAuth({ email, name: email.split("@")[0] })}
                                            >
                                                <div className="google-account-avatar">{email.charAt(0).toUpperCase()}</div>
                                                <div className="google-account-info">
                                                    <div className="google-account-name">
                                                        {email.split("@")[0]}
                                                        <span className="google-account-badge user">{role}</span>
                                                    </div>
                                                    <div className="google-account-email">{email}</div>
                                                </div>
                                                <span style={{ color: "#64748b", fontSize: "14px" }}>→</span>
                                            </button>
                                        )}
                                    </div>

                                    {!showCustomGoogle ? (
                                        <button
                                            type="button"
                                            className="google-account-item"
                                            style={{ borderStyle: "dashed", justifyContent: "center", color: "#93c5fd" }}
                                            onClick={() => setShowCustomGoogle(true)}
                                        >
                                            <span>＋ Use another Google account</span>
                                        </button>
                                    ) : (
                                        <form
                                            onSubmit={(e) => {
                                                e.preventDefault();
                                                if (customGoogleEmail) {
                                                    handleGoogleAuth({
                                                        email: customGoogleEmail,
                                                        name: customGoogleName || customGoogleEmail.split("@")[0]
                                                    });
                                                }
                                            }}
                                            style={{ marginTop: "14px", padding: "16px", borderRadius: "14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
                                        >
                                            <div style={{ marginBottom: "10px" }}>
                                                <input
                                                    type="email"
                                                    placeholder="Enter Google Email (e.g. alex@gmail.com)"
                                                    value={customGoogleEmail}
                                                    onChange={(e) => setCustomGoogleEmail(e.target.value)}
                                                    required
                                                    style={{ width: "100%", padding: "11px 14px", fontSize: "13px" }}
                                                />
                                            </div>
                                            <div style={{ marginBottom: "14px" }}>
                                                <input
                                                    type="text"
                                                    placeholder="Your Name (Optional)"
                                                    value={customGoogleName}
                                                    onChange={(e) => setCustomGoogleName(e.target.value)}
                                                    style={{ width: "100%", padding: "11px 14px", fontSize: "13px" }}
                                                />
                                            </div>
                                            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                                                <button
                                                    type="button"
                                                    className="footer-link-btn"
                                                    onClick={() => setShowCustomGoogle(false)}
                                                >
                                                    Back
                                                </button>
                                                <button
                                                    type="submit"
                                                    className="tm-modal-btn-primary"
                                                >
                                                    Sign in with this account
                                                </button>
                                            </div>
                                        </form>
                                    )}

                                    <p style={{ margin: "18px 0 0 0", textAlign: "center", fontSize: "11.5px", color: "#64748b" }}>
                                        To continue, Google will securely authenticate your profile with TaskMate.
                                    </p>
                                </div>
                            </>
                        )}

                        {/* PRODUCT MODAL */}
                        {activeModal === "product" && (
                            <>
                                <div className="tm-modal-header">
                                    <div className="tm-modal-title-wrap">
                                        <span className="tm-modal-badge">✦ Product Overview</span>
                                        <h2>TaskMate Workspace</h2>
                                    </div>
                                    <button className="tm-modal-close-btn" onClick={closeModal} title="Close">✕</button>
                                </div>
                                <div className="tm-modal-body">
                                    <p>
                                        TaskMate is an Apple-inspired project and task management system built for engineering, design, and operations teams to execute with clarity and speed.
                                    </p>
                                    <div className="tm-modal-grid">
                                        <div className="tm-feature-item">
                                            <div className="tm-feature-icon">⌂</div>
                                            <div className="tm-feature-text">
                                                <strong>Dedicated Workspaces</strong>
                                                <p>Separation of concerns with a powerful Administrator Control Center and a streamlined Team Member Dashboard.</p>
                                            </div>
                                        </div>
                                        <div className="tm-feature-item">
                                            <div className="tm-feature-icon">✓</div>
                                            <div className="tm-feature-text">
                                                <strong>Full Task Lifecycle</strong>
                                                <p>Track tasks from Pending to In Progress to Completed with live milestone percentage bars.</p>
                                            </div>
                                        </div>
                                        <div className="tm-feature-item">
                                            <div className="tm-feature-icon">◷</div>
                                            <div className="tm-feature-text">
                                                <strong>Real-Time System Audit</strong>
                                                <p>Every assignment, status shift, and user join event is logged into an interactive timeline feed.</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="tm-modal-chips">
                                        <span className="tm-chip">✓ React 19 Frontend</span>
                                        <span className="tm-chip">✓ Express REST API</span>
                                        <span className="tm-chip">✓ MongoDB Database</span>
                                        <span className="tm-chip">✓ JWT Auth</span>
                                    </div>
                                </div>
                                <div className="tm-modal-footer">
                                    <button className="tm-modal-btn-primary" onClick={closeModal}>Explore Workspace</button>
                                </div>
                            </>
                        )}

                        {/* FEATURES MODAL */}
                        {activeModal === "features" && (
                            <>
                                <div className="tm-modal-header">
                                    <div className="tm-modal-title-wrap">
                                        <span className="tm-modal-badge">✦ Capabilities</span>
                                        <h2>Core Features</h2>
                                    </div>
                                    <button className="tm-modal-close-btn" onClick={closeModal} title="Close">✕</button>
                                </div>
                                <div className="tm-modal-body">
                                    <p>Everything you need to orchestrate complex projects without unnecessary friction.</p>
                                    <div className="tm-modal-grid">
                                        <div className="tm-feature-item">
                                            <div className="tm-feature-icon">♟</div>
                                            <div className="tm-feature-text">
                                                <strong>Role-Based Access Control</strong>
                                                <p>Secure JWT role guards separating Admin governance from User execution.</p>
                                            </div>
                                        </div>
                                        <div className="tm-feature-item">
                                            <div className="tm-feature-icon">📊</div>
                                            <div className="tm-feature-text">
                                                <strong>Progress Sliders & Status</strong>
                                                <p>Interactive 0-100% progress tracking with immediate team synchronization.</p>
                                            </div>
                                        </div>
                                        <div className="tm-feature-item">
                                            <div className="tm-feature-icon">🔍</div>
                                            <div className="tm-feature-text">
                                                <strong>Universal Filter & Search</strong>
                                                <p>Instant search by title, priority (High, Medium, Low), and completion status.</p>
                                            </div>
                                        </div>
                                        <div className="tm-feature-item">
                                            <div className="tm-feature-icon">⚙</div>
                                            <div className="tm-feature-text">
                                                <strong>Settings & Preferences</strong>
                                                <p>Profile management, credential reset, and customizable notification alerts.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="tm-modal-footer">
                                    <button className="tm-modal-btn-primary" onClick={closeModal}>Got it</button>
                                </div>
                            </>
                        )}

                        {/* ABOUT MODAL */}
                        {activeModal === "about" && (
                            <>
                                <div className="tm-modal-header">
                                    <div className="tm-modal-title-wrap">
                                        <span className="tm-modal-badge">✦ System Information</span>
                                        <h2>About TaskMate</h2>
                                    </div>
                                    <button className="tm-modal-close-btn" onClick={closeModal} title="Close">✕</button>
                                </div>
                                <div className="tm-modal-body">
                                    <p>
                                        TaskMate is engineered as a lightweight, lightning-fast MERN stack task management system inspired by Apple's dark cinematic glass design language.
                                    </p>
                                    <div className="tm-modal-grid">
                                        <div className="tm-feature-item">
                                            <div className="tm-feature-icon">ℹ</div>
                                            <div className="tm-feature-text">
                                                <strong>Version & Build</strong>
                                                <p>TaskMate v2.4 (2026 Production Release) · Dark Glass Edition</p>
                                            </div>
                                        </div>
                                        <div className="tm-feature-item">
                                            <div className="tm-feature-icon">🔒</div>
                                            <div className="tm-feature-text">
                                                <strong>Security & Encryption</strong>
                                                <p>Bcrypt salted password encryption and stateless Bearer tokens.</p>
                                            </div>
                                        </div>
                                        <div className="tm-feature-item">
                                            <div className="tm-feature-icon">●</div>
                                            <div className="tm-feature-text">
                                                <strong>System Status</strong>
                                                <p style={{ color: "#34d399" }}>All systems operational · API & Database connected</p>
                                            </div>
                                        </div>
                                    </div>
                                    <p style={{ fontSize: "12px", color: "#64748b", marginTop: "12px" }}>
                                        Designed and developed for modern agile teams.
                                    </p>
                                </div>
                                <div className="tm-modal-footer">
                                    <button className="tm-modal-btn-primary" onClick={closeModal}>Close</button>
                                </div>
                            </>
                        )}

                        {/* PRIVACY MODAL */}
                        {activeModal === "privacy" && (
                            <>
                                <div className="tm-modal-header">
                                    <div className="tm-modal-title-wrap">
                                        <span className="tm-modal-badge">✦ Legal</span>
                                        <h2>Privacy Policy</h2>
                                    </div>
                                    <button className="tm-modal-close-btn" onClick={closeModal} title="Close">✕</button>
                                </div>
                                <div className="tm-modal-body">
                                    <p>TaskMate respects your privacy and is committed to protecting your organizational data.</p>
                                    <p>• <strong>Data Storage</strong>: All user credentials and tasks are securely stored in your local or hosted MongoDB instance.</p>
                                    <p>• <strong>Local Storage</strong>: Browser storage is used strictly for JWT authentication session persistence and user UI preferences.</p>
                                    <p>• <strong>No Tracking</strong>: Your project details and tasks are never shared or sold to third-party ad networks.</p>
                                </div>
                                <div className="tm-modal-footer">
                                    <button className="tm-modal-btn-primary" onClick={closeModal}>Understood</button>
                                </div>
                            </>
                        )}

                        {/* TERMS MODAL */}
                        {activeModal === "terms" && (
                            <>
                                <div className="tm-modal-header">
                                    <div className="tm-modal-title-wrap">
                                        <span className="tm-modal-badge">✦ Legal</span>
                                        <h2>Terms of Service</h2>
                                    </div>
                                    <button className="tm-modal-close-btn" onClick={closeModal} title="Close">✕</button>
                                </div>
                                <div className="tm-modal-body">
                                    <p>By using TaskMate, you agree to comply with standard acceptable use terms:</p>
                                    <p>1. <strong>Account Responsibility</strong>: Administrators are responsible for managing member permissions and revoking unauthorized access.</p>
                                    <p>2. <strong>Data Ownership</strong>: You retain complete ownership of all tasks, descriptions, and deliverables stored in your workspace.</p>
                                    <p>3. <strong>Availability</strong>: TaskMate is provided under standard software terms with continuous stability updates.</p>
                                </div>
                                <div className="tm-modal-footer">
                                    <button className="tm-modal-btn-primary" onClick={closeModal}>Understood</button>
                                </div>
                            </>
                        )}

                        {/* SUPPORT MODAL */}
                        {activeModal === "support" && (
                            <>
                                <div className="tm-modal-header">
                                    <div className="tm-modal-title-wrap">
                                        <span className="tm-modal-badge">✦ Help Desk</span>
                                        <h2>TaskMate Support</h2>
                                    </div>
                                    <button className="tm-modal-close-btn" onClick={closeModal} title="Close">✕</button>
                                </div>
                                <div className="tm-modal-body">
                                    <p>Need assistance or have questions about configuring TaskMate?</p>
                                    <div className="tm-modal-grid">
                                        <div className="tm-feature-item">
                                            <div className="tm-feature-icon">✉</div>
                                            <div className="tm-feature-text">
                                                <strong>Email Support</strong>
                                                <p>support@taskmate.local · 24-hour turnaround</p>
                                            </div>
                                        </div>
                                        <div className="tm-feature-item">
                                            <div className="tm-feature-icon">📖</div>
                                            <div className="tm-feature-text">
                                                <strong>Documentation</strong>
                                                <p>Comprehensive setup guides for Admin and Team Members.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="tm-modal-footer">
                                    <button className="tm-modal-btn-primary" onClick={closeModal}>Close</button>
                                </div>
                            </>
                        )}

                    </div>
                </div>
            )}

        </div>
    );
};

export default Login;