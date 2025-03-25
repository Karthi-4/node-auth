const express = require("express");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

const router = express.Router();

// In-memory token blacklist (for logout)
const tokenBlacklist = new Set();

// Register user
router.post("/register", async (req, res) => {
 const { username, email, password } = req.body;
 try {
  const userExists = await User.findOne({ email });
  if (userExists) return res.status(400).json({ message: "User already exists" });

  const user = new User({ username, email, password });
  await user.save();

  res.status(201).json({ message: "User registered successfully" });
 } catch (error) {
  res.status(500).json({ message: "Server error" });
 }
});

// Login user
router.post("/login", async (req, res) => {
 const { email, password } = req.body;
 try {
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "Invalid email or password" });

  const isMatch = await user.matchPassword(password);
  if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

  const token = jwt.sign({ id: user._id }, fivestars, { expiresIn: "1h" });

  res.cookie("token", token, {
   httpOnly: true,
   secure: process.env.NODE_ENV === "production",
  });
  res.json({ message: "Login successful", token });
 } catch (error) {
  res.status(500).json({ message: "Server error" });
 }
});

// Logout user
router.post("/logout", (req, res) => {
 const token = req.cookies.token;
 if (token) {
  tokenBlacklist.add(token);
 }
 res.clearCookie("token");
 res.json({ message: "Logout successful" });
});

module.exports = router;
