const express = require('express');
const router = express.Router();
const List = require('../models/List');
const User = require('../models/User');
const admin = require('../firebaseAdmin');

// Create a new list
router.post('/', async (req, res) => {
  try {
    const { idToken, title, description } = req.body;
    const decoded = await admin.auth().verifyIdToken(idToken);
    const user = await User.findOne({ firebaseUID: decoded.uid });
    
    if (!user) return res.status(404).json({ message: 'User not found' });

    const list = new List({
      title,
      description,
      userId: user._id,
      songs: []
    });

    await list.save();
    res.status(201).json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add song to list
router.post('/:listId/songs', async (req, res) => {
  try {
    const { idToken, song } = req.body;
    const decoded = await admin.auth().verifyIdToken(idToken);
    const user = await User.findOne({ firebaseUID: decoded.uid });
    
    if (!user) return res.status(404).json({ message: 'User not found' });

    const list = await List.findOne({ _id: req.params.listId, userId: user._id });
    if (!list) return res.status(404).json({ message: 'List not found' });

    list.songs.push(song);
    await list.save();
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Publish list
router.patch('/:listId/publish', async (req, res) => {
  try {
    const { idToken } = req.body;
    const decoded = await admin.auth().verifyIdToken(idToken);
    const user = await User.findOne({ firebaseUID: decoded.uid });
    
    if (!user) return res.status(404).json({ message: 'User not found' });

    const list = await List.findOneAndUpdate(
      { _id: req.params.listId, userId: user._id },
      { isPublished: true },
      { new: true }
    );

    if (!list) return res.status(404).json({ message: 'List not found' });
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all published lists (for explore page)
router.get('/explore', async (req, res) => {
  try {
    const lists = await List.find({ isPublished: true })
      .populate('userId', 'email')
      .sort({ createdAt: -1 });
    res.json(lists);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete list (admin only)
router.delete('/:listId', async (req, res) => {
  try {
    const { idToken } = req.body;
    const decoded = await admin.auth().verifyIdToken(idToken);
    const user = await User.findOne({ firebaseUID: decoded.uid });
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role !== 'admin') return res.status(403).json({ message: 'Unauthorized' });

    await List.findByIdAndDelete(req.params.listId);
    res.json({ message: 'List deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer '))
      return res.status(401).json({ message: 'No token provided' });

    const idToken = authHeader.split(' ')[1];
    const decoded = await admin.auth().verifyIdToken(idToken);
    const user = await User.findOne({ firebaseUID: decoded.uid });

    if (!user) return res.status(404).json({ message: 'User not found' });

    const lists = await List.find({ userId: user._id });
    res.json(lists);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;