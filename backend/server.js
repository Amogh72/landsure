require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

const Listing = require("./models/Listing");

const app = express();  // Create app before using middlewares

app.use(cors({
  origin: "https://land-sure.netlify.app",   // allow requesting origin dynamically
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());  // Use cookie-parser after app initialized

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// Suggestions (unique location names)
app.get("/api/listings/search-suggestions", async (req, res) => {
  try {
    const q = req.query.q || "";
    const locations = await Listing.find({
      location: { $regex: q, $options: "i" }
    }).distinct("location");

    res.json(locations);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Actual search (listings for results page)
app.get("/api/listings/search", async (req, res) => {
  try {
    const q = req.query.q || "";
    const listings = await Listing.find({
      $or: [
        { title: { $regex: q, $options: "i" } },
        { location: { $regex: q, $options: "i" } }
      ]
    });
    res.json(listings);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ------------------- ROUTES -------------------
const path = require("path");
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/seed-images", express.static(path.join(__dirname, "seed-images")));

const userRoutes = require("./routes/users");
app.use("/api/users", userRoutes);

const listingRoutes = require("./routes/listings");
app.use("/api/listings", listingRoutes);

const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

const feedbackRoutes = require("./routes/feedback");
app.use("/api/feedback", feedbackRoutes);

// Refresh token endpoint
app.post('/refresh', (req, res) => {
  const token = req.cookies?.jwt;  // Read refresh token from cookie
  if (!token) return res.status(401).send('Unauthorized');

  jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.status(403).send('Forbidden');

    const accessToken = jwt.sign({ userId: user.userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '10m' });
    res.json({ accessToken });
  });
});

// ------------------- START SERVER -------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
