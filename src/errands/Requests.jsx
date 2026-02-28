// errands/components/Requests.jsx
import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../firebase";
import ErrandCard from "./ErrandCard";

export default function Requests() {
  const [requests, setRequests] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, "tasks"),
      where("requesterId", "==", currentUser.uid)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRequests(data);
    });

    return () => unsub();
  }, [currentUser]);

return (
  <div className="feed-container">
    <h1 className="travel-page-title">My Requests</h1>

    <div className="feed-content">
      {requests.length === 0 ? (
        <p className="empty-text">No requests yet 👀</p>
      ) : (
        requests.map((req) => (
          <ErrandCard
            key={req.id}
            errand={req}
            currentUser={currentUser}
          />
        ))
      )}
    </div>
  </div>
);
}