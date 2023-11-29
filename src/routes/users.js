const express = require("express");
const router = express.Router();
const User = require("../models/User");

router.patch("/admin/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { role: "admin" },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User role updated to admin", user: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Update user profile
router.put("/:email", async (req, res) => {
  try {
    const userEmail = req.params.email;
    const { name, photo } = req.body;

    const updatedUser = await User.findOneAndUpdate(
      { email: userEmail },
      { $set: { name, photo } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res
      .status(200)
      .json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
