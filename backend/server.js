const express = require('express');
const cors = require('cors');
const { v4: uuid } = require('uuid');

// Initialize DB connection (must be required before models)
require('./config/db');

const Seat = require('./models/seat');
const Booking = require('./models/Booking');
const Show = require('./models/Show');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;

/* -------- Helpers -------- */
async function seedSeats() {
  const showId = uuid();
  // Replace existing show
  await Show.deleteMany({});
  await Show.create({ showId });

  // Reset seats and bookings
  await Seat.deleteMany({});
  await Booking.deleteMany({});

  const seatsToInsert = [];
  for (let i = 1; i <= 30; i++) {
    seatsToInsert.push({ seatId: `A${i}` });
  }
  await Seat.insertMany(seatsToInsert);

  return showId;
}

/* -------- APIs (now persisted in MongoDB) -------- */

app.post('/seed', async (req, res) => {
  try {
    const showId = await seedSeats();
    res.json({ showId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Seed failed' });
  }
});

app.get('/show', async (req, res) => {
  try {
    const show = await Show.findOne().sort({ createdAt: -1 }).lean();
    res.json(show || {});
  } catch (err) {
    console.error(err);
    res.status(500).json({});
  }
});

app.get('/seats', async (req, res) => {
  try {
    const seats = await Seat.find().lean();
    res.json(seats);
  } catch (err) {
    console.error(err);
    res.status(500).json([]);
  }
});

app.post('/hold', async (req, res) => {
  const { seatId, name } = req.body;
  const holdId = uuid();

  try {
    // Atomically move from AVAILABLE to HELD
    const seat = await Seat.findOneAndUpdate(
      { seatId, status: 'AVAILABLE' },
      { status: 'HELD', holdSeatAt: new Date(), holdId },
      { new: true }
    );

    if (!seat) return res.status(400).json({ error: 'Seat not available' });

    const bookingId = uuid();
    await Booking.create({ bookingId, seatId, name, status: 'HELD' });

    res.json({ status: 'HELD', bookingId, heldBy: name, seatSnapshot: seat });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Hold failed' });
  }
});

app.post('/confirm', async (req, res) => {
  const { bookingId } = req.body;

  try {
    const booking = await Booking.findOne({ bookingId });
    if (!booking) return res.status(400).json({});

    // Ensure the seat is HELD and then mark BOOKED
    const seat = await Seat.findOneAndUpdate(
      { seatId: booking.seatId, status: 'HELD' },
      { status: 'BOOKED', bookedBy: booking.name, bookedAt: new Date(), holdSeatAt: null, holdId: null },
      { new: true }
    );

    if (!seat) return res.status(400).json({ error: 'Seat not held' });

    booking.status = 'BOOKED';
    await booking.save();

    res.json({ status: 'BOOKED', seat });
  } catch (err) {
    console.error(err);
    res.status(500).json({});
  }
});

app.post('/cancel', async (req, res) => {
  const { bookingId } = req.body;

  try {
    const booking = await Booking.findOne({ bookingId });
    if (!booking) return res.json({});

    const seat = await Seat.findOneAndUpdate(
      { seatId: booking.seatId },
      { status: 'AVAILABLE', holdSeatAt: null, holdId: null },
      { new: true }
    );

    await Booking.deleteOne({ bookingId });

    res.json({ status: 'CANCELLED', seat });
  } catch (err) {
    console.error(err);
    res.status(500).json({});
  }
});

app.listen(PORT, () => console.log(`Backend running at http://localhost:${PORT}`));