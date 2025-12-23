const mongoose = require('mongoose');

const ShowSchema = new mongoose.Schema({
  showId: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Show', ShowSchema);