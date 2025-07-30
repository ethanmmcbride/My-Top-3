const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
  spotifyId: String,
  name: String,
  artist: String,
  album: String,
  imageUrl: String,
  previewUrl: String
});

const listSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  songs: [songSchema],
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isPublished: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  likes: { type: Number, default: 0 },
  tags: [String]
});

module.exports = mongoose.model('List', listSchema);