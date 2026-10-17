import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, role }) => {
    const {
        user,
        isAuthenticated,
        loading
    } = useAuth();

    // Authentication state restore hone tak wait
    if (loading) {
        return (
            <div
                style={{
                    minHeight: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#06101f",
                    color: "#ffffff",
                    fontSize: "18px"
                }}
            >
                Loading...
            </div>
        );
    }

    // User logged in nahi hai
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Role check
    if (role && user?.role !== role) {

        if (user?.role === "admin") {
            return (
                <Navigate
                    to="/admin/dashboard"
                    replace
                />
            );
        }

        if (user?.role === "user") {
            return (
                <Navigate
                    to="/user/dashboard"
                    replace
                />
            );
        }

        return <Navigate to="/login" replace />;
    }

    // Authorized user
    return children;
};

export default ProtectedRoute;