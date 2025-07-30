const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: String,
  firebaseUID: String,
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  savedLists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'List' }]
});

module.exports = mongoose.model('User', userSchema);