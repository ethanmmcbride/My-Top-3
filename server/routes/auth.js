const express = require('express');
const router = express.Router();
const admin = require('../firebaseAdmin');
const User = require('../models/User');
const connectDB = require('../db');
connectDB();

// Register: Save user info + role to MongoDB
router.post('/register', async (req, res) => {
  const { email, userId, idToken, role } = req.body;
  console.log('[REGISTER REQUEST]', { email, userId, role });
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    console.log('[TOKEN VERIFIED]', decoded.uid);
    const existing = await User.findOne({ firebaseUID: userId });
    if (!existing) {
      const createdUser = await User.create({ email, firebaseUID: userId, role });
      console.log('[USER CREATED]', createdUser);
    } else {
      console.log('[USER ALREADY EXISTS]');
    }
    res.json({ message: 'User registered' });
  } catch (err) {
    console.error('[REGISTER ERROR]', err);
    res.status(401).json({ message: 'Invalid token or DB error' });
  }
});

// Verify token + return role
router.post('/verify-token', async (req, res) => {
  const { idToken } = req.body;
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    const user = await User.findOne({ firebaseUID: decoded.uid });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: 'Invalid token' });
  }
});

module.exports = router;
