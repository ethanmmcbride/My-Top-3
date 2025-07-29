const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: String,
  firebaseUID: String,
  role: { type: String, enum: ['admin', 'user'], default: 'user' }
});

module.exports = mongoose.model('User', userSchema);