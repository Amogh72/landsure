const express = require("express");
const router = express.Router();
const Feedback = require("../models/Feedback");
const authMiddleware = require("../middleware/auth"); // if you have auth

// POST feedback
router.post("/", async (req, res) => {
  try {
    const { email, feedback } = req.body;
    let userId = null;

    // If logged in, extract userId from token (middleware should set req.user)
    if (req.user) {
      userId = req.user.id;
    }

    if (!feedback) {
      return res.status(400).json({ message: "Feedback is required" });
    }

    if (!userId && !email) {
      return res.status(400).json({ message: "Email is required for guests" });
    }

    const fb = new Feedback({
      userId,
      email,
      feedback,
    });

    await fb.save();
    res.status(201).json({ message: "Feedback saved successfully" });
  } catch (err) {
    console.error("Feedback error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
