const mongoose = require('mongoose');

const SeatSchema = new mongoose.Schema({
  seatId: { type: String, unique: true },
  status: { type: String, default: 'AVAILABLE' },
  holdSeatAt: Date,
  bookedBy: String,
  bookedAt: Date,
  holdId: String
});

module.exports = mongoose.model('Seat', SeatSchema);