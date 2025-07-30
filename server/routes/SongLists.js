const express = require('express');
const router = express.Router();
const List = require('../models/List');
const User = require('../models/User');
const admin = require('../firebaseAdmin');

// Get or create user's default list
router.get('/', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer '))
      return res.status(401).json({ message: 'No token provided' });

    const idToken = authHeader.split(' ')[1];
    const decoded = await admin.auth().verifyIdToken(idToken);
    const user = await User.findOne({ firebaseUID: decoded.uid });

    if (!user) return res.status(404).json({ message: 'User not found' });

    // Find or create the user's default list
    let list = await List.findOne({ userId: user._id });
    if (!list) {
      list = new List({
        title: "My Top 3",
        description: "My favorite songs",
        userId: user._id,
        songs: [],
        isPublished: false
      });
      await list.save();
    }

    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add song to user's list
router.post('/songs', async (req, res) => {
  try {
    const { idToken, song } = req.body;

    if (!idToken || !song) {
      return res.status(400).json({ message: 'Missing idToken or song' });
    }

    const decoded = await admin.auth().verifyIdToken(idToken);
    const user = await User.findOne({ firebaseUID: decoded.uid });

    if (!user) return res.status(404).json({ message: 'User not found' });

    const list = await List.findOne({ userId: user._id });

    if (!list) return res.status(404).json({ message: 'List not found' });

    if (list.songs.length >= 3) {
      return res.status(400).json({ message: 'List already has 3 songs' });
    }

    list.songs.push(song);
    await list.save();

    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Publish list
router.patch('/publish', async (req, res) => {
  try {
    const { idToken } = req.body;
    const decoded = await admin.auth().verifyIdToken(idToken);
    const user = await User.findOne({ firebaseUID: decoded.uid });
    
    if (!user) return res.status(404).json({ message: 'User not found' });

    const list = await List.findOneAndUpdate(
      { userId: user._id },
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

// Unpublish list
router.patch('/unpublish', async (req, res) => {
  try {
    const { idToken } = req.body;

    const decoded = await admin.auth().verifyIdToken(idToken);
    const user = await User.findOne({ firebaseUID: decoded.uid });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const list = await List.findOneAndUpdate(
      { userId: user._id },
      { isPublished: false },
      { new: true }
    );

    if (!list) return res.status(404).json({ message: 'List not found' });

    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/admin/unpublish/:listId', async (req, res) => {
    try {
      const { idToken } = req.body;
      const decoded = await admin.auth().verifyIdToken(idToken);
      const user = await User.findOne({ firebaseUID: decoded.uid });

      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: 'Unauthorized' });
      }

      const list = await List.findByIdAndUpdate(
        req.params.listId,
        { isPublished: false },
        { new: true }
      );

      if (!list) return res.status(404).json({ message: 'List not found' });

      res.json(list);
    } catch (err) {
      console.error('Admin unpublish error:', err);
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

// Remove a song from user's list
router.delete('/songs', async (req, res) => {
  try {
    const { idToken, songId } = req.body;

    if (!idToken || !songId) {
      return res.status(400).json({ message: 'Missing idToken or songId' });
    }

    const decoded = await admin.auth().verifyIdToken(idToken);
    const user = await User.findOne({ firebaseUID: decoded.uid });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const list = await List.findOne({ userId: user._id });
    if (!list) return res.status(404).json({ message: 'List not found' });

    list.songs = list.songs.filter(song => song.spotifyId !== songId);
    await list.save();

    res.json(list);
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

module.exports = router;