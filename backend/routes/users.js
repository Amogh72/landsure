// routes/users.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const User = require("../models/user");
const Listing = require("../models/Listing"); // <-- you need this to populate listings

// Get current user
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Toggle save listing
router.post("/toggle-save/:listingId", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const listingId = req.params.listingId;
    if (user.savedListings.includes(listingId)) {
      user.savedListings = user.savedListings.filter(id => id.toString() !== listingId);
    } else {
      user.savedListings.push(listingId);
    }

    await user.save();
    // ⬇ return as object with savedListings property
    res.json({ savedListings: user.savedListings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Get saved listings
router.get("/saved", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // populate saved listings with details
    const listings = await Listing.find({
      _id: { $in: user.savedListings }
    });

    res.json(listings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;