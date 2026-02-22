import React, { useState,useEffect } from "react";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import "./styles/seatStyle.css";

const BookingModal = ({ seat, onClose, currentStudentId }) => {
  const [fromTime, setFromTime] = useState("");
  const [toTime, setToTime] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
  if (!seat) return;

  const now = new Date();

  const todayFormatted = now.toISOString().split("T")[0];
  setSelectedDate(todayFormatted);

  // 🔥 Use exact current time
  const from = now.toTimeString().slice(0, 5);
  setFromTime(from);

  // 2 hours later
  const end = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  const to = end.toTimeString().slice(0, 5);
  setToTime(to);

}, [seat]);
  // ✅ Today & Tomorrow
  const todayObj = new Date();
  const tomorrowObj = new Date();
  tomorrowObj.setDate(todayObj.getDate() + 1);

  const formatDate = (date) => date.toISOString().split("T")[0];
  const formatDisplayDate = (date) => {
  return date.toLocaleDateString("en-GB"); // DD/MM/YYYY
};

  const convertToTimestamp = (dateStr, timeStr) => {
    const date = new Date(dateStr);
    const [hours, minutes] = timeStr.split(":");
    date.setHours(hours);
    date.setMinutes(minutes);
    return date.getTime();
  };

  const handleBooking = async () => {
    setError("");

    if (!selectedDate || !fromTime || !toTime) {
      setError("Select date and both time fields.");
      return;
    }

    const normalize = (timestamp) => {
      const d = new Date(timestamp);
      d.setSeconds(0);
      d.setMilliseconds(0);
      return d.getTime();
    };
    const from = normalize(convertToTimestamp(selectedDate, fromTime));
    const to = normalize(convertToTimestamp(selectedDate, toTime));
    const now = normalize(Date.now());

    // ❌ Prevent past booking
    if (from < now) {
      setError("Cannot book for past time.");
      return;
    }

    if (to <= from) {
      setError("End time must be after start time.");
      return;
    }

    if ((to - from) > 2 * 60 * 60 * 1000) {
      setError("Maximum booking allowed is 2 hours.");
      return;
    }

    const seatRef = doc(db, "seats", seat.id);
    const seatSnap = await getDoc(seatRef);

    let existingBookings = seatSnap.exists()
      ? seatSnap.data().bookings || []
      : [];

    // 🔴 Check for overlapping bookings (same date automatically handled via timestamp)
    const isOverlapping = existingBookings.some(
      (b) => from < b.to && to > b.from
    );

    if (isOverlapping) {
      setError("Seat already booked for selected duration.");
      return;
    }

    const newBooking = {
      studentId: currentStudentId,
      from,
      to,
    };

    await setDoc(
      seatRef,
      { bookings: [...existingBookings, newBooking] },
      { merge: true }
    );
    alert("Booking successful!");
    onClose();
  };

  const handleCancel = async () => {
    const seatRef = doc(db, "seats", seat.id);
    const seatSnap = await getDoc(seatRef);

    if (!seatSnap.exists()) return;

    let bookings = seatSnap.data().bookings || [];

    const updated = bookings.filter(
      (b) => b.studentId !== currentStudentId
    );

    await updateDoc(seatRef, { bookings: updated });

    onClose();
  };

  const now = Date.now();

  const currentBooking = seat.bookings?.find(
    (b) => now >= b.from && now <= b.to
  );

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Seat {seat.id}</h2>

        {/* ✅ SHOW ALL BOOKINGS */}
        <h4>Booked Slots:</h4>
        {seat.bookings && seat.bookings.length > 0 ? (
          seat.bookings.map((b, index) => (
            <div key={index} style={{ fontSize: "14px" }}>
              {new Date(b.from).toLocaleDateString()} |{" "}
              {new Date(b.from).toLocaleTimeString()} -{" "}
              {new Date(b.to).toLocaleTimeString()}
            </div>
          ))
        ) : (
          <p>No bookings yet</p>
        )}

        <hr />

        {currentBooking ? (
          currentBooking.studentId === currentStudentId ? (
          <p>
            Status: <span className="mine">You have booked this seat.</span>
          </p>
          ) : (
          <p>
            Status: <span className="booked">Seat is currently booked.</span>
          </p>
          )
        ) : (
        <p>
          Status: <span className="free">Seat is available.</span>
        </p>
      )}

        {/* ✅ ALWAYS ALLOW FUTURE BOOKING */}
        <p>Select Booking Date & Time (Max 2 hrs)</p>

        <label>Select Date:</label>
        <select
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        >
          <option value={formatDate(todayObj)}>{formatDisplayDate(todayObj)}</option>
          <option value={formatDate(tomorrowObj)}>{formatDisplayDate(tomorrowObj)}</option>
        </select>

        <label>From:</label>
        <input
          type="time"
          value={fromTime}
          onChange={(e) => setFromTime(e.target.value)}
        />

        <label>To:</label>
        <input
          type="time"
          value={toTime}
          onChange={(e) => setToTime(e.target.value)}
        />

        {error && <p style={{ color: "red" }}>{error}</p>}

        <button onClick={handleBooking} className="btn-confirm">
          Confirm Booking
        </button>

        {/* ✅ Cancel Only Own Active Booking */}
        {currentBooking &&
          currentBooking.studentId === currentStudentId && (
            <button onClick={handleCancel} className="btn-cancel">
              Cancel My Booking
            </button>
          )}

        <button onClick={onClose} className="close-link">
          Close
        </button>
      </div>
    </div>
  );
};

export default BookingModal;