const express = require("express");
const router = express.Router();
const User = require("../models/User");

// GET /users/admins
router.get("/admins", async (req, res) => {
  const { email } = req.query;
  try {
    if (!email) {
      return res.status(400).json({ error: "Email parameter is required" });
    }
    const adminUser = await User.findOne({ email, role: "admin" });
    if (!adminUser) {
      return res.json({
        message: "User with the provided email is not an admin",
        isAdmin: false,
      });
    }
    res.json({
      message: "User with the provided email is an admin",
      isAdmin: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
