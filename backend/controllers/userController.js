const User = require("../models/User");
const bcrypt = require("bcryptjs");

// ==========================================
// Create User - Admin Only
// ==========================================
const createUser = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            role
        } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email and password are required"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters"
            });
        }

        const existingUser = await User.findOne({
            email: email.toLowerCase().trim()
        });

        if (existingUser) {
            return res.status(409).json({
                message: "User with this email already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            role: role === "admin" ? "admin" : "user"
        });

        const createdUser = await User.findById(user._id)
            .select("-password");

        res.status(201).json({
            message: "User created successfully",
            user: createdUser
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to create user",
            error: error.message
        });
    }
};


// ==========================================
// Get All Users - Admin Only
// ==========================================
const getAllUsers = async (req, res) => {
    try {
        // Enforce role === "user" by default; admin accounts must NOT appear in the user management list
        const filter = { role: "user" };

        // Exclude current admin ID as well for safety
        if (req.user && req.user._id) {
            filter._id = { $ne: req.user._id };
        }

        if (req.query.role && req.query.role !== "all") {
            filter.role = req.query.role;
        } else if (req.query.role === "all") {
            delete filter.role;
        }

        const users = await User.find(filter)
            .select("-password")
            .sort({ createdAt: -1 });

        res.status(200).json({
            count: users.length,
            users
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch users",
            error: error.message
        });
    }
};


// ==========================================
// Get Single User - Admin Only
// ==========================================
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json({
            user
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch user",
            error: error.message
        });
    }
};


// ==========================================
// Update User - Admin Only
// ==========================================
const updateUser = async (req, res) => {
    try {
        const {
            name,
            email,
            role
        } = req.body;

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Admin cannot change their own role
        if (
            req.user.id === user._id.toString() &&
            role &&
            role !== user.role
        ) {
            return res.status(400).json({
                message: "You cannot change your own admin role"
            });
        }

        if (email) {
            const normalizedEmail = email
                .toLowerCase()
                .trim();

            const existingUser = await User.findOne({
                email: normalizedEmail,
                _id: { $ne: user._id }
            });

            if (existingUser) {
                return res.status(409).json({
                    message: "Another user already uses this email"
                });
            }

            user.email = normalizedEmail;
        }

        if (name) {
            user.name = name.trim();
        }

        if (role) {
            if (!["admin", "user"].includes(role)) {
                return res.status(400).json({
                    message: "Role must be admin or user"
                });
            }

            user.role = role;
        }

        await user.save();

        const updatedUser = await User.findById(user._id)
            .select("-password");

        res.status(200).json({
            message: "User updated successfully",
            user: updatedUser
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to update user",
            error: error.message
        });
    }
};


// ==========================================
// Delete User - Admin Only
// ==========================================
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Admin cannot delete their own account
        if (req.user.id === user._id.toString()) {
            return res.status(400).json({
                message: "You cannot delete your own account"
            });
        }

        await User.findByIdAndDelete(req.params.id);

        res.status(200).json({
            message: "User deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to delete user",
            error: error.message
        });
    }
};


// ==========================================
// Reset User Password - Admin Only
// ==========================================
const resetUserPassword = async (req, res) => {
    try {
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({
                message: "New password is required"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters"
            });
        }

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const hashedPassword = await bcrypt.hash(
            password,
            10
        );

        user.password = hashedPassword;

        await user.save();

        res.status(200).json({
            message: "User password reset successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to reset password",
            error: error.message
        });
    }
};


module.exports = {
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    resetUserPassword
};