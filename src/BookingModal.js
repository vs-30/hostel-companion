import { useState, useEffect } from "react";
import {
  doc,
  runTransaction,
  collection,
  collectionGroup,
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
  const [myUsername, setMyUsername] = useState("");
  const [bookedForUsername, setBookedForUsername] = useState("");
  const [allowedUsers, setAllowedUsers] = useState([]);
 

  const isBulk = seat?.bulkSeats?.length > 0;

  /* ---------------- DEFAULT TIME ---------------- */
  useEffect(() => {
    if (!seat) return;

    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");

    setSelectedDate(`${yyyy}-${mm}-${dd}`);
    setFromTime(now.toTimeString().slice(0, 5));

    const end = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    setToTime(end.toTimeString().slice(0, 5));
  }, [seat]);

  /* ---------------- LISTEN BOOKINGS ---------------- */
  useEffect(() => {
    if (!seat) return;

    const q = query(collection(db, "seats", seat.id, "bookings"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBookings(data);
    });

    return () => unsubscribe();
  }, [seat]);

  useEffect(() => {
  const fetchMyUsername = async () => {
    const snap = await getDocs(
      query(collection(db, "usernames"), where("uid", "==", currentStudentId))
    );

    if (!snap.empty) {
      setMyUsername(snap.docs[0].id);
    }
  };

  if (currentStudentId) {
    fetchMyUsername();
  }
}, [currentStudentId]);
  
  useEffect(() => {
  if (!currentStudentId || !myUsername) return;

  const friendsRef = collection(
    db,
    "userFriends",
    currentStudentId,
    "friends"
  );

  const unsub = onSnapshot(friendsRef, snap => {
    const friendList = snap.docs.map(d => d.data().username);

    setAllowedUsers([
      myUsername,  // ✅ properly fetched username
      ...friendList
    ]);
  });

  return () => unsub();
}, [currentStudentId, myUsername]);


  const convertToTimestamp = (dateStr, timeStr) => {
    const [year, month, day] = dateStr.split("-");
    const [hours, minutes] = timeStr.split(":");

    return new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hours),
      Number(minutes)
    ).getTime();
  };

  /* ================= BOOKING ================= */
  const handleBooking = async () => {

    setError("");

    if (!selectedDate || !fromTime || !toTime) {
      setError("Select date and both time fields.");
      return;
    }

    const from = convertToTimestamp(selectedDate, fromTime);
    const to = convertToTimestamp(selectedDate, toTime);

    if (to <= from) {
      setError("End time must be after start time.");
      return;
    }

    if ((to - from) > 2 * 60 * 60 * 1000) {
      setError("Maximum booking allowed is 2 hours.");
      return;
    }

    const bookedBy = auth.currentUser.uid;

    try {

      /* -------- BULK -------- */
      if (isBulk) {

        await runTransaction(db, async (transaction) => {

          for (let i = 0; i < seat.bulkSeats.length; i++) {

            const seatId = seat.bulkSeats[i];
            const username = multiUsernames[i];

            if (!username) throw new Error("All usernames required");

            const userQuery = query(
              collection(db, "usernames"),
              where("__name__", "==", username)
            );

            const snap = await getDocs(userQuery);
            if (snap.empty) {
              throw new Error(`Username ${username} does not exist`);
            }

            const bookedForUid = snap.docs[0].data().uid;

            // 🔥 Prevent same user multiple seats same time
            const userBookingsQuery = query(
              collectionGroup(db, "bookings"),
              where("bookedForUid", "==", bookedForUid),
              where("date", "==", selectedDate)
            );

            const userSnap = await getDocs(userBookingsQuery);

            const userOverlap = userSnap.docs.some(doc => {
              const b = doc.data();
              return from < b.to && to > b.from;
            });

            if (userOverlap) {
              throw new Error(
                `${username} already has another booking during this time`
              );
            }

            const bookingRef = doc(
              collection(db, "seats", seatId, "bookings")
            );

            transaction.set(bookingRef, {
              bookedBy,
              bookedForUsername: username,
              bookedForUid,
              seatId,
              date: selectedDate,
              from,
              to,
              createdAt: Date.now()
            });
          }
        });

        alert("Bulk booking successful!");
        onClose();
        return;
      }

      /* -------- SINGLE -------- */

      const usernameQuery = query(
        collection(db, "usernames"),
        where("__name__", "==", bookedForUsername)
      );

      const usernameSnap = await getDocs(usernameQuery);

      if (usernameSnap.empty) {
        setError("Username does not exist.");
        return;
      }

      const bookedForUid = usernameSnap.docs[0].data().uid;

      await runTransaction(db, async (transaction) => {

        // 🔥 Prevent user double booking
        const userBookingsQuery = query(
          collectionGroup(db, "bookings"),
          where("bookedForUid", "==", bookedForUid),
          where("date", "==", selectedDate)
        );

        const userSnap = await getDocs(userBookingsQuery);

        const userOverlap = userSnap.docs.some(doc => {
          const b = doc.data();
          return from < b.to && to > b.from;
        });

        if (userOverlap) {
          throw new Error(
            `${bookedForUsername} already has another booking during this time`
          );
        }

        // 🔥 Prevent seat overlap
        const seatQuery = query(
          collection(db, "seats", seat.id, "bookings"),
          where("date", "==", selectedDate)
        );

        const seatSnap = await getDocs(seatQuery);

        const seatOverlap = seatSnap.docs.some(doc => {
          const b = doc.data();
          return from < b.to && to > b.from;
        });

        if (seatOverlap) {
          throw new Error("Seat already booked for selected duration.");
        }

        const newBookingRef = doc(
          collection(db, "seats", seat.id, "bookings")
        );

        transaction.set(newBookingRef, {
          bookedBy,
          bookedForUsername,
          bookedForUid,
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
      setError(err.message);
    }
  };

  /* ================= CANCEL ================= */
  const handleCancel = async () => {

    const myBooking = bookings.find(
      b => b.bookedBy === currentStudentId
    );

    if (!myBooking) {
      setError("No booking found.");
      return;
    }
    const cancelLimit = myBooking.from + (5 * 60 * 1000); 
    if (Date.now() > cancelLimit) 
    { 
      setError("Cancellation allowed only until 5 minutes after start time."); 
      return; 
    }
    const bookingRef = doc(
      db,
      "seats",
      seat.id,
      "bookings",
      myBooking.id
    );

    await deleteDoc(bookingRef);
    alert("Booking cancelled.");
    onClose();
  };

  /* ================= EXTEND ================= */
  const handleExtend = async () => {

    const myBooking = bookings.find(
      b => b.bookedBy === currentStudentId
    );

    if (!myBooking) {
      setError("No booking found.");
      return;
    }
    const extendLimit = myBooking.to - (5 * 60 * 1000); 
    if (Date.now() > extendLimit) 
    { 
      setError("Extension allowed only until 5 minutes before end time."); 
      return; 
    }
    const extendMs = parseInt(extendMinutes) * 60 * 1000;
    const newTo = myBooking.to + extendMs;

    if ((newTo - myBooking.from) > 2 * 60 * 60 * 1000) {
      setError("Total booking cannot exceed 2 hours.");
      return;
    }

    const bookingRef = doc(
      db,
      "seats",
      seat.id,
      "bookings",
      myBooking.id
    );

    await updateDoc(bookingRef, { to: newTo });
    alert("Booking extended.");
    onClose();
  };

  /* ================= UI ================= */

  const seatsToDisplay = isBulk ? seat.bulkSeats : [seat.id];
  const [multiUsernames, setMultiUsernames] = useState(
  new Array(seatsToDisplay.length).fill("")
);

  return (
    <div className="smodal-overlay">
      <div className="smodal-content">
        <div className="smodalheader">
          <h2>{isBulk ? "Bulk Seat Booking" : `Seat ${seat.id}`}</h2>
          <button className="close-modal"onClick={onClose}>&times;</button>
        </div>

        {seatsToDisplay.map((seatId, idx) => {

          const seatBookings = isBulk
            ? bookings.filter(b => b.seatId === seatId)
            : bookings;

          return (
            <div key={idx}>
              <h4>{seatId}</h4>

              {seatBookings.map((b, i) => {
                const isMine = b.bookedBy === currentStudentId;
                const isForMe = b.bookedForUid === currentStudentId;

                return (
                  <div key={i}>
                    {new Date(b.from).toLocaleTimeString()} -
                    {new Date(b.to).toLocaleTimeString()}
                    <br />
                    For: {b.bookedForUsername}
                    {isMine && " (Booked By You)"}
                    {isForMe && " (Booked For You)"}
                  </div>
                );
              })}
            </div>
          );
        })}

        <label>From:</label>
        <input type="time" value={fromTime}
          onChange={(e) => setFromTime(e.target.value)} />

        <label>To:</label>
        <input type="time" value={toTime}
          onChange={(e) => setToTime(e.target.value)} />

        {isBulk ? (
  <>
    <h4>Enter Usernames For Each Seat</h4>

    {seatsToDisplay.map((seatId, index) => (
  <div key={index} className="mulinput-group">
    <label>{seatId}</label>
    <select
      className="booking-select"
      value={multiUsernames[index] || ""}
      onChange={(e) => {
        const updated = [...multiUsernames];
        updated[index] = e.target.value;
        setMultiUsernames(updated);
      }}
    >
      {allowedUsers.map((user, i) => (
        <option key={i} value={user}>
          {user}
        </option>
      ))}
    </select>
  </div>
))}
  </>
) : (
  <>
   <div className="input-group">
  <label>Booked For (Username):</label>
  <select
    className="booking-select"
    value={bookedForUsername}
    onChange={(e) => setBookedForUsername(e.target.value)}
  >
    {allowedUsers.map((user, i) => (
      <option key={i} value={user}>
        {user}
      </option>
    ))}
  </select>
</div>
  </>
)}

        {error && <p style={{ color: "red" }}>{error}</p>}

        <button onClick={handleBooking} className="btn-confirm">
          Confirm Booking
        </button>

        {bookings.some(b => b.bookedBy === currentStudentId) && (
          <>
            <button onClick={handleCancel} className="btn-cancel">
              Cancel My Booking
            </button>

            <input
              type="number"
              min="1"
              max="30"
              value={extendMinutes}
              onChange={(e) => setExtendMinutes(e.target.value)}
            />
            <button onClick={handleExtend} className="btn-extend">
              Extend My Booking
            </button>
          </>
        )}

      </div>
    </div>
  );
};

export default BookingModal;