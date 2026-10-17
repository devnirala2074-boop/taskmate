const express = require("express");

const {
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    resetUserPassword
} = require("../controllers/userController");

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const router = express.Router();


// ==========================================
// ADMIN USER ROUTES
// ==========================================


// Create User
router.post(
    "/",
    protect,
    adminOnly,
    createUser
);


// Get All Users
router.get(
    "/",
    protect,
    adminOnly,
    getAllUsers
);


// Get Single User
router.get(
    "/:id",
    protect,
    adminOnly,
    getUserById
);


// Update User
router.patch(
    "/:id",
    protect,
    adminOnly,
    updateUser
);


// Delete User
router.delete(
    "/:id",
    protect,
    adminOnly,
    deleteUser
);


// Reset User Password
router.patch(
    "/:id/reset-password",
    protect,
    adminOnly,
    resetUserPassword
);


module.exports = router;