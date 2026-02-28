import { useState, useEffect } from "react";
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  onSnapshot
} from "firebase/firestore";
import { db } from "./firebase";
import "./styles/seatStyle.css";

const FriendsModal = ({ currentStudentId, onClose }) => {
  const [friends, setFriends] = useState([]);
  const [sent, setSent] = useState([]);
  const [received, setReceived] = useState([]);
  const [searchUsername, setSearchUsername] = useState("");
  const [error, setError] = useState("");

  /* ================= LISTEN REALTIME ================= */
  useEffect(() => {
    if (!currentStudentId) return;

    const friendsRef = collection(
      db,
      "userFriends",
      currentStudentId,
      "friends"
    );

    const sentRef = collection(
      db,
      "userFriends",
      currentStudentId,
      "sentRequests"
    );

    const receivedRef = collection(
      db,
      "userFriends",
      currentStudentId,
      "receivedRequests"
    );

    const unsub1 = onSnapshot(friendsRef, snap => {
      setFriends(
        snap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      );
    });

    const unsub2 = onSnapshot(sentRef, snap => {
      setSent(
        snap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      );
    });

    const unsub3 = onSnapshot(receivedRef, snap => {
      setReceived(
        snap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      );
    });

    return () => {
      unsub1();
      unsub2();
      unsub3();
    };
  }, [currentStudentId]);

  /* ================= SEND REQUEST ================= */
  const sendRequest = async () => {
    try {
      setError("");

      if (!searchUsername.trim()) {
        setError("Enter a username");
        return;
      }

      const usernameTrimmed = searchUsername.trim();

      const userQuery = query(
        collection(db, "usernames"),
        where("__name__", "==", usernameTrimmed)
      );

      const snap = await getDocs(userQuery);

      if (snap.empty) {
        setError("User not found");
        return;
      }

      const targetUid = snap.docs[0].data().uid;

      if (targetUid === currentStudentId) {
        setError("You cannot add yourself");
        return;
      }

      if (friends.find(f => f.id === targetUid)) {
        setError("Already friends");
        return;
      }

      if (sent.find(s => s.id === targetUid)) {
        setError("Request already sent");
        return;
      }

      // Get my username
      const mySnap = await getDocs(
        query(collection(db, "usernames"), where("uid", "==", currentStudentId))
      );

      const myUsername = mySnap.docs[0].id;

      // Add to my sent
      await setDoc(
        doc(db, "userFriends", currentStudentId, "sentRequests", targetUid),
        { uid: targetUid, username: usernameTrimmed }
      );

      // Add to their received
      await setDoc(
        doc(db, "userFriends", targetUid, "receivedRequests", currentStudentId),
        { uid: currentStudentId, username: myUsername }
      );

      setSearchUsername("");
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
    }
  };

  /* ================= ACCEPT REQUEST ================= */
  const acceptRequest = async (senderUid) => {
    try {
      // Get sender username
      const senderSnap = await getDocs(
        query(collection(db, "usernames"), where("uid", "==", senderUid))
      );

      if (senderSnap.empty) return;

      const senderUsername = senderSnap.docs[0].id;

      // Get my username
      const mySnap = await getDocs(
        query(collection(db, "usernames"), where("uid", "==", currentStudentId))
      );

      const myUsername = mySnap.docs[0].id;

      // Add sender to my friends
      await setDoc(
        doc(db, "userFriends", currentStudentId, "friends", senderUid),
        { uid: senderUid, username: senderUsername }
      );

      // Add me to sender's friends
      await setDoc(
        doc(db, "userFriends", senderUid, "friends", currentStudentId),
        { uid: currentStudentId, username: myUsername }
      );

      // Delete request documents
      await deleteDoc(
        doc(db, "userFriends", currentStudentId, "receivedRequests", senderUid)
      );

      await deleteDoc(
        doc(db, "userFriends", senderUid, "sentRequests", currentStudentId)
      );
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= REMOVE FRIEND ================= */
  const removeFriend = async (friendUid) => {
    try {
      await deleteDoc(
        doc(db, "userFriends", currentStudentId, "friends", friendUid)
      );

      await deleteDoc(
        doc(db, "userFriends", friendUid, "friends", currentStudentId)
      );
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= CANCEL SENT REQUEST ================= */
  const cancelRequest = async (uid) => {
    try {
      await deleteDoc(
        doc(db, "userFriends", currentStudentId, "sentRequests", uid)
      );

      await deleteDoc(
        doc(db, "userFriends", uid, "receivedRequests", currentStudentId)
      );
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="friends-overlay">
      <div className="friends-modal">
        <h2>Friends</h2>

        {error && <p className="error-text">{error}</p>}

        {/* MY FRIENDS */}
        <div className="friends-section">
          <h3>My Friends</h3>
          {friends.length === 0 && <p>No friends yet</p>}
          {friends.map(friend => (
            <div key={friend.id} className="friend-item">
              <span>{friend.username}</span>
              <button
                className="btn-remove-friend"
                onClick={() => removeFriend(friend.id)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* SENT REQUESTS */}
        <div className="friends-section">
          <h3>Requests Sent</h3>
          {sent.length === 0 && <p>No pending requests</p>}
          {sent.map(req => (
            <div key={req.id} className="friend-item">
              <span>{req.username}</span>
              <button
                className="btn-cancel"
                onClick={() => cancelRequest(req.id)}
              >
                Cancel
              </button>
            </div>
          ))}
        </div>

        {/* RECEIVED REQUESTS */}
        <div className="friends-section">
          <h3>Requests Received</h3>
          {received.length === 0 && <p>No new requests</p>}
          {received.map(req => (
            <div key={req.id} className="friend-item">
              <span>{req.username}</span>
              <button
                className="btn-add-friend"
                onClick={() => acceptRequest(req.id)}
              >
                Accept
              </button>
            </div>
          ))}
        </div>

        {/* SEND REQUEST */}
        <div className="friends-section">
          <h3>Add Friend</h3>
          <div className="friend-input-group">
          <input
            type="text"
            placeholder="Enter username"
            value={searchUsername}
            onChange={(e) => setSearchUsername(e.target.value)}
          />
          <button className="btn-send-request" onClick={sendRequest}>
            Send Request
          </button>
          </div>
        </div>

        <button className="friends-close-btn" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default FriendsModal;