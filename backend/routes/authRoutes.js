const express = require("express");

const {
    registerUser,
    loginUser,
    googleLogin
} = require("../controllers/authController");

const router = express.Router();

// Register
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

// Google OAuth Login
router.post("/google", googleLogin);

module.exports = router;