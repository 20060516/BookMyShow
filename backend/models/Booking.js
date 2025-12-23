const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  bookingId: { type: String, unique: true },
  seatId: String,
  name: String,
  status: String
});

module.exports = mongoose.model('Booking', BookingSchema);