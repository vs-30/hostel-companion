/*import React, { useState,useEffect } from "react";
import { doc, getDoc, updateDoc, setDoc,getDocs,collection} from "firebase/firestore";
import { db } from "./firebase";
import "./styles/seatStyle.css";

const BookingModal = ({ seat, onClose, currentStudentId }) => {
  const [fromTime, setFromTime] = useState("");
  const [toTime, setToTime] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [error, setError] = useState("");
  const [extendMinutes, setExtendMinutes] = useState("");

  useEffect(() => {

  if (!seat) return;

  const now = new Date();

  const todayFormatted = now.toISOString().split("T")[0];
  setSelectedDate(todayFormatted);

  const from = now.toTimeString().slice(0, 5);
  setFromTime(from);
  const end = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  const to = end.toTimeString().slice(0, 5);
  setToTime(to);

}, [seat]);
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

  const fetchAllSeats = async () => {
  const snapshot = await getDocs(collection(db, "seats"));
  return snapshot.docs.map(doc => doc.data());
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

  // ❌ Only between 8 AM and 8 PM
  const startLimit = normalize(convertToTimestamp(selectedDate, "08:00"));
  const endLimit = normalize(convertToTimestamp(selectedDate, "22:00"));

  if (from < startLimit || to > endLimit) {
    setError("Booking allowed only between 8:00 AM and 8:00 PM.");
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

  // 🔎 CHECK: Has user already booked ANY seat for selected date?

const allSeatsRef = await fetchAllSeats();

for (let s of allSeatsRef) {
  const bookings = s.bookings || [];

  const alreadyBookedSameDate = bookings.find((b) => {
    const bookingDate = new Date(b.from).toISOString().split("T")[0];

    return (
      b.studentId === currentStudentId &&
      bookingDate === selectedDate
    );
  });

  if (alreadyBookedSameDate) {
    setError("You can book only one seat per day.");
    return;
  }
}

  // 🔎 Check overlap for this seat
  const seatRef = doc(db, "seats", seat.id);
  const seatSnap = await getDoc(seatRef);

  let existingBookings = seatSnap.exists()
    ? seatSnap.data().bookings || []
    : [];

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
    createdAt: Date.now(), // ⭐ IMPORTANT
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

  const booking = bookings.find(
    (b) => b.studentId === currentStudentId
  );

  if (!booking) return;

  const now = Date.now();
  const cancelLimit = booking.from + (5 * 60 * 1000);

  // ✅ Allow until 5 mins after start time
  if (now > cancelLimit) {
    setError("Cancellation allowed only until 5 minutes after start time.");
    return;
  }

  const updated = bookings.filter(
    (b) => b.studentId !== currentStudentId
  );

  await updateDoc(seatRef, { bookings: updated });

  alert("Booking cancelled.");
  onClose();
};
const handleExtend = async () => {
  setError("");

  if (!extendMinutes || extendMinutes <= 0) {
    setError("Enter extension minutes.");
    return;
  }

  if (extendMinutes > 30) {
    setError("Maximum extension allowed is 30 minutes.");
    return;
  }

  const seatRef = doc(db, "seats", seat.id);
  const seatSnap = await getDoc(seatRef);

  if (!seatSnap.exists()) return;

  let bookings = seatSnap.data().bookings || [];

  const index = bookings.findIndex(
    (b) => b.studentId === currentStudentId
  );

  if (index === -1) return;

  const booking = bookings[index];

  const now = Date.now();
const extendLimit = booking.from + (5 * 60 * 1000);

if (now > extendLimit) {
  setError("Extension allowed only until 5 minutes after start time.");
  return;
}

  const extendMs = parseInt(extendMinutes) * 60 * 1000;
  const newTo = booking.to + extendMs;
  if ((newTo - booking.from) > 2 * 60 * 60 * 1000) {
    setError("Total booking cannot exceed 2 hours.");
    return;
  }

  // ❌ Cannot extend beyond 8 PM
  const bookingDate = new Date(booking.from)
    .toISOString()
    .split("T")[0];

  const endLimit = convertToTimestamp(bookingDate, "20:00");

  if (newTo > endLimit) {
    setError("Cannot extend beyond 8:00 PM.");
    return;
  }

  bookings[index].to = newTo;

  await updateDoc(seatRef, { bookings });

  alert("Booking extended successfully.");
  onClose();
};
const nowTime = Date.now();

const currentBooking = seat.bookings?.find(
  (b) => nowTime >= b.from && nowTime <= b.to
);
const myBooking = seat.bookings?.find(
  (b) => b.studentId === currentStudentId
);
const activeAndFutureBookings = seat.bookings?.filter(
  b => b.to > nowTime
);
let canCancel = false;

if (myBooking) {
  const cancelLimit = myBooking.from + (5 * 60 * 1000);
  if (Date.now() <= cancelLimit) {
    canCancel = true;
  }
}

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Seat {seat.id}</h2>


        <h4>Booked Slots:</h4>
        
        {activeAndFutureBookings && activeAndFutureBookings.length > 0 ? (
          activeAndFutureBookings.map((b, index) => {
            const isMine = b.studentId === currentStudentId;
            return (
              <div key={index} style={{padding: "6px",borderRadius: "6px",marginBottom: "6px",
              backgroundColor: isMine ? "var(--accent-color)" : "#f1f1f1",color: isMine ? "white" : "black",fontWeight: isMine ? "600" : "normal"}}>
                {new Date(b.from).toLocaleString()} -{" "}
      {new Date(b.to).toLocaleTimeString()}
      {isMine && " (Your Booking)"}
              </div>
            );
          })
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

        {myBooking && canCancel && (
  <div style={{ marginTop: "10px" }}>
    <button
      onClick={handleCancel}
      className="btn-cancel"
    >
      Cancel Booking
    </button>

    <div style={{ marginTop: "10px" }}>
      <label>Extend (Max 30 mins): </label>
      <input
        type="number"
        min="1"
        max="30"
        value={extendMinutes}
        onChange={(e) => setExtendMinutes(e.target.value)}
        style={{ width: "70px", marginLeft: "5px" }}
      />

      <button
        onClick={handleExtend}
        className="btn-extend"
        style={{ marginLeft: "8px" }}
      >
        Extend
      </button>
    </div>
  </div>
)}


        <button onClick={onClose} className="close-link">
          Close
        </button>
      </div>
    </div>
  );
};

export default BookingModal;*/
import React, { useState, useEffect } from "react";
import {
  doc,
  runTransaction,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  updateDoc,
  onSnapshot
} from "firebase/firestore";
import { db, auth } from "./firebase";
import "./styles/seatStyle.css";

const BookingModal = ({ seat, onClose, currentStudentId }) => {

  const [fromTime, setFromTime] = useState("");
  const [toTime, setToTime] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [error, setError] = useState("");
  const [extendMinutes, setExtendMinutes] = useState("");
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    if (!seat) return;

    const now = new Date();
    const todayFormatted = now.toISOString().split("T")[0];
    setSelectedDate(todayFormatted);

    const from = now.toTimeString().slice(0, 5);
    setFromTime(from);

    const end = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    setToTime(end.toTimeString().slice(0, 5));
  }, [seat]);

  // 🔥 REALTIME BOOKINGS FOR THIS SEAT
  useEffect(() => {
    if (!seat) return;

    const q = query(
      collection(db, "seatBookings"),
      where("seatId", "==", seat.id)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBookings(data);
    });

    return () => unsubscribe();
  }, [seat]);

  const convertToTimestamp = (dateStr, timeStr) => {
    const date = new Date(dateStr);
    const [hours, minutes] = timeStr.split(":");
    date.setHours(hours);
    date.setMinutes(minutes);
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date.getTime();
  };

  const handleBooking = async () => {
    setError("");

    if (!selectedDate || !fromTime || !toTime) {
      setError("Select date and both time fields.");
      return;
    }

    const to = convertToTimestamp(selectedDate, toTime);
    const from = convertToTimestamp(selectedDate, fromTime);
    const now = new Date();
    now.setSeconds(0, 0);
    const nowTs = now.getTime();
    if (from < nowTs) {
      setError("Cannot book for past time.");
      return;
    }

    const startLimit = convertToTimestamp(selectedDate, "08:00");
    const endLimit = convertToTimestamp(selectedDate, "22:00");

    if (from < startLimit || to > endLimit) {
      setError("Booking allowed only between 8:00 AM and 10:00 PM.");
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

    const uid = auth.currentUser.uid;
    const bookingId = `${uid}_${selectedDate}`;
    const bookingRef = doc(db, "seatBookings", bookingId);

    try {
      await runTransaction(db, async (transaction) => {

        const existing = await transaction.get(bookingRef);

        // 🔥 One booking per day enforcement
        if (existing.exists()) {
          throw "You already booked a seat for this day.";
        }

        // 🔥 Overlap check for this seat
        const seatQuery = query(
          collection(db, "seatBookings"),
          where("seatId", "==", seat.id),
          where("date", "==", selectedDate)
        );

        const seatSnap = await getDocs(seatQuery);

        const overlap = seatSnap.docs.some(doc => {
          const b = doc.data();
          return from < b.to && to > b.from;
        });

        if (overlap) {
          throw "Seat already booked for selected duration.";
        }

        transaction.set(bookingRef, {
          studentId: uid,
          seatId: seat.id,
          date: selectedDate,
          from,
          to,
          createdAt: Date.now()
        });
      });

      alert("Booking successful!");
      onClose();

    } catch (err) {
      setError(err);
    }
  };

  const handleCancel = async () => {
    const uid = auth.currentUser.uid;
    const bookingId = `${uid}_${selectedDate}`;
    const bookingRef = doc(db, "seatBookings", bookingId);

    const myBooking = bookings.find(
      b => b.studentId === uid && b.date === selectedDate
    );

    if (!myBooking) return;

    const cancelLimit = myBooking.from + (5 * 60 * 1000);

    if (Date.now() > cancelLimit) {
      setError("Cancellation allowed only until 5 minutes after start time.");
      return;
    }

    await deleteDoc(bookingRef);
    alert("Booking cancelled.");
    onClose();
  };

  const handleExtend = async () => {
    setError("");

    const uid = auth.currentUser.uid;
    const bookingId = `${uid}_${selectedDate}`;
    const bookingRef = doc(db, "seatBookings", bookingId);

    const myBooking = bookings.find(
      b => b.studentId === uid && b.date === selectedDate
    );

    if (!myBooking) return;

    const extendLimit = myBooking.from + (5 * 60 * 1000);

    if (Date.now() > extendLimit) {
      setError("Extension allowed only until 5 minutes after start time.");
      return;
    }

    const extendMs = parseInt(extendMinutes) * 60 * 1000;
    const newTo = myBooking.to + extendMs;

    if ((newTo - myBooking.from) > 2 * 60 * 60 * 1000) {
      setError("Total booking cannot exceed 2 hours.");
      return;
    }

    const endLimit = convertToTimestamp(selectedDate, "22:00");

    if (newTo > endLimit) {
      setError("Cannot extend beyond 10:00 PM.");
      return;
    }

    await updateDoc(bookingRef, { to: newTo });

    alert("Booking extended successfully.");
    onClose();
  };

  // Inside BookingModal component
const nowTime = Date.now();

// Filter the bookings list to exclude past ones
const activeAndFutureBookings = bookings.filter(b => b.to > nowTime);


  const currentBooking = bookings.find(
    b => nowTime >= b.from && nowTime <= b.to
  );

  const myBooking = bookings.find(
    b => b.studentId === currentStudentId && b.date === selectedDate
  );

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Seat {seat.id}</h2>

        <h4>Booked Slots:</h4>

        {bookings.length > 0 ? (
          bookings.map((b, index) => {
            const isMine = b.studentId === currentStudentId;
            return (
              <div key={index}
                style={{
                  padding: "6px",
                  borderRadius: "6px",
                  marginBottom: "6px",
                  backgroundColor: isMine ? "var(--accent-color)" : "#f1f1f1",
                  color: isMine ? "white" : "black"
                }}>
                {new Date(b.from).toLocaleString()} -
                {new Date(b.to).toLocaleTimeString()}
                {isMine && " (Your Booking)"}
              </div>
            );
          })
        ) : <p>No bookings yet</p>}

        <hr />

        {activeAndFutureBookings ? (
          activeAndFutureBookings.studentId === currentStudentId ?
            <p>Status: <span className="mine">You have booked this seat.</span></p>
            :
            <p>Status: <span className="booked">Seat is currently booked.</span></p>
        ) :
          <p>Status: <span className="free">Seat is available.</span></p>
        }

        <label>From:</label>
        <input type="time" value={fromTime}
          onChange={(e) => setFromTime(e.target.value)} />

        <label>To:</label>
        <input type="time" value={toTime}
          onChange={(e) => setToTime(e.target.value)} />

        {error && <p style={{ color: "red" }}>{error}</p>}

        <button onClick={handleBooking} className="btn-confirm">
          Confirm Booking
        </button>

        {myBooking && (
          <>
            <button onClick={handleCancel} className="btn-cancel">
              Cancel Booking
            </button>

            <div style={{ marginTop: "10px" }}>
              <input type="number"
                min="1"
                max="30"
                value={extendMinutes}
                onChange={(e) => setExtendMinutes(e.target.value)}
              />
              <button onClick={handleExtend} className="btn-extend">
                Extend
              </button>
            </div>
          </>
        )}

        <button onClick={onClose} className="close-link">
          Close
        </button>
      </div>
    </div>
  );
};

export default BookingModal;