const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth'); 

// const JWT_SECRET = process.env.JWT_SECRET; // set this in your .env
router.get('/protected-route', auth, (req, res) => {
  res.send('This is a protected route, accessible only with valid token');
});

// Register
router.post('/register', async (req, res) => {
  const { username, contact, email, password, account_type, govt_id_type, govt_id_number } = req.body;

  if (!username || !email || !password || !account_type || !govt_id_type || !govt_id_number) {
    return res.status(400).json({ message: "All required fields must be filled." });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already registered." });

    const user = new User({
      username,
      contact,
      email,
      password,
      account_type,
      govt_id_type,
      govt_id_number,
      savedListings: []
    });

    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '12h' });

    res.status(201).json({
      message: "User registered successfully",
      token,
      username: user.username,
      account_type: user.account_type,
      email: user.email
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});



// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '12h' });

        // Add refresh token here:
        const refreshToken = jwt.sign({ userId: user._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

        res.cookie('jwt', refreshToken, {
            httpOnly: true,
            secure: false, // set true if using https
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.json({
            message: "Login successful",
            token, // access token
            username: user.username,
            account_type: user.account_type,
            email: user.email
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});


module.exports = router;
