import { useEffect, useState } from "react";
import "./App.css";

const API = "http://localhost:4000"; 

export default function App() {
  const [showId, setShowId] = useState("ca33355e-5e12-4176-bb4b-d35a31472712");
  const [seatId, setSeatId] = useState("A4");
  const [name, setName] = useState("");
  const [status, setStatus] = useState("");
  const [bookingId, setBookingId] = useState("");
  const [heldBy, setHeldBy] = useState("");
  const [seatSnapshot, setSeatSnapshot] = useState({});
  const [allSeats, setAllSeats] = useState([]);


  const seats = Array.from({ length: 30 }, (_, i) => `A${i + 1}`);

  useEffect(() => {
    const seatData = seats.map((s) => ({
      seatId: s,
      status: "AVAILABLE",
      bookedBy: null,
      bookedAt: null,
      holdId: null,
      holdExpiresAt: null,
    }));
    setAllSeats(seatData);
  }, []);

  const handleHold = () => {
    setStatus("HELD");
    setBookingId(`bookingId-${Date.now()}`);
    setHeldBy(name);
    const updatedSeats = allSeats.map((s) =>
      s.seatId === seatId ? { ...s, status: "HELD", bookedBy: name } : s
    );
    setAllSeats(updatedSeats);
    setSeatSnapshot(updatedSeats.find((s) => s.seatId === seatId));
  };

  const handleConfirm = () => {
    setStatus("CONFIRMED");
    const updatedSeats = allSeats.map((s) =>
      s.seatId === seatId ? { ...s, status: "BOOKED" } : s
    );
    setAllSeats(updatedSeats);
    setSeatSnapshot(updatedSeats.find((s) => s.seatId === seatId));
  };

  const handleCancel = () => {
    setStatus("AVAILABLE");
    setBookingId("");
    setHeldBy("");
    const updatedSeats = allSeats.map((s) =>
      s.seatId === seatId ? { ...s, status: "AVAILABLE", bookedBy: null } : s
    );
    setAllSeats(updatedSeats);
    setSeatSnapshot(updatedSeats.find((s) => s.seatId === seatId));
  };

  return (
    <div className="container">
      <h1>Book My Show</h1>

      <div className="controls">
        <button>Seed Show + 30 Seats</button>
        <button>Refresh Seats</button>
      </div>

      <div className="form-row">
        <label>ShowId: </label>
        <input
          type="text"
          value={showId}
          onChange={(e) => setShowId(e.target.value)}
        />
        <label>Seat: </label>
        <select value={seatId} onChange={(e) => setSeatId(e.target.value)}>
          {seats.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="form-row">
        <label>Name: </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button onClick={handleHold}>Checkout (Hold Seat)</button>
        <button onClick={handleConfirm}>Confirm (mock payment)</button>
        <button onClick={handleCancel}>Cancel Hold</button>
      </div>

      <div className="status">
        <strong>Status:</strong> {status}{" "}
        {bookingId && (
          <>
            ✅ <br />
            <strong>bookingId=</strong> {bookingId} <br />
            <strong>held by:</strong> {heldBy}
          </>
        )}
      </div>

      <h3>Seat Snapshot</h3>
      <pre>{JSON.stringify(seatSnapshot, null, 2)}</pre>

      <h3>All Seats</h3>
      <div className="seat-grid">
        {allSeats.map((s) => (
          <div
            key={s.seatId}
            className={`seat ${s.status.toLowerCase()}`}
          >
            {s.seatId}
            <br />
            {s.status}
          </div>
        ))}
      </div>
    </div>
  );
}
