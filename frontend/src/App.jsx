import React from "react";
import {
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/AdminDashboard";
import CreateTask from "./pages/admin/CreateTask";
import UserDashboard from "./pages/user/UserDashboard";
import MyTasks from "./pages/user/MyTasks";
import UserLayout from "./layouts/UserLayout";
import TaskDetails from "./pages/user/TaskDetails";
import AllTasks from "./pages/admin/AllTasks";
import AdminTaskDetails from "./pages/admin/AdminTaskDetails";
import AdminUsers from "./pages/admin/AdminUsers";
import CreateUser from "./pages/admin/CreateUser";
import AdminUserDetails from "./pages/admin/AdminUserDetails";
import AdminActivity from "./pages/admin/AdminActivity";
import AdminSettings from "./pages/admin/Settings";
import UserActivity from "./pages/user/UserActivity";
import UserSettings from "./pages/user/Settings";

import ProtectedRoute from "./components/ProtectedRoute";

const App = () => {
    return (
        <Routes>

            {/* ================= LOGIN ================= */}

            <Route
                path="/"
                element={<Login />}
            />

            <Route
                path="/login"
                element={<Login />}
            />


            {/* ================= ADMIN ================= */}
<Route
    path="/admin/dashboard"
    element={
        <ProtectedRoute role="admin">
            <AdminDashboard />
        </ProtectedRoute>
    }
/>

<Route
    path="/admin/tasks"
    element={
        <ProtectedRoute role="admin">
            <AllTasks />
        </ProtectedRoute>
    }
/>

<Route
    path="/admin/create-task"
    element={
        <ProtectedRoute role="admin">
            <CreateTask />
        </ProtectedRoute>
    }
/>
<Route
    path="/admin/tasks/:id"
    element={
        <ProtectedRoute role="admin">
            <AdminTaskDetails />
        </ProtectedRoute>
    }
/>
<Route
    path="/admin/users"
    element={
        <ProtectedRoute role="admin">
            <AdminUsers />
        </ProtectedRoute>
    }
/>

<Route
    path="/admin/users/create"
    element={
        <ProtectedRoute role="admin">
            <CreateUser />
        </ProtectedRoute>
    }
/>

<Route
    path="/admin/users/:id"
    element={
        <ProtectedRoute role="admin">
            <AdminUserDetails />
        </ProtectedRoute>
    }
/>

<Route
    path="/admin/activity"
    element={
        <ProtectedRoute role="admin">
            <AdminActivity />
        </ProtectedRoute>
    }
/>

<Route
    path="/admin/settings"
    element={
        <ProtectedRoute role="admin">
            <AdminSettings />
        </ProtectedRoute>
    }
/>

            {/* ================= USER ================= */}

<Route
    path="/user/dashboard"
    element={
        <ProtectedRoute role="user">
            <UserLayout>
                <UserDashboard />
            </UserLayout>
        </ProtectedRoute>
    }
/>
<Route
    path="/user/tasks"
    element={
        <ProtectedRoute role="user">
            <UserLayout>
                <MyTasks />
            </UserLayout>
        </ProtectedRoute>
    }
/>
<Route
    path="/user/tasks/:id"
    element={
        <ProtectedRoute role="user">
            <UserLayout>
                <TaskDetails />
            </UserLayout>
        </ProtectedRoute>
    }
/>
<Route
    path="/user/activity"
    element={
        <ProtectedRoute role="user">
            <UserLayout>
                <UserActivity />
            </UserLayout>
        </ProtectedRoute>
    }
/>
<Route
    path="/user/settings"
    element={
        <ProtectedRoute role="user">
            <UserLayout>
                <UserSettings />
            </UserLayout>
        </ProtectedRoute>
    }
/>


            {/* ================= UNKNOWN ROUTE ================= */}

            <Route
                path="*"
                element={
                    <Navigate
                        to="/"
                        replace
                    />
                }
            />

        </Routes>
    );
};

export default App;