import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db, auth } from "../../firebase";
import ErrandCard from "./ErrandCard";
import { getAuth } from "firebase/auth";
import { addCredits } from "../services/errandsService";

async function handleAccept(request) {
  const user = auth.currentUser;

  if (!user) return;

  // Add credits based on store + order amount
  await addCredits(user.uid, request.storeKey, request.amount);

  // Then update request status to accepted (your existing logic)
}
export default function Requests() {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, "tasks"),
      where("requesterId", "==", auth.currentUser.uid)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setRequests(data);
    });

    return () => unsub();
  }, []);

  return (
    <div>
      <h2>My Requests 📋</h2>

      {requests.map((req) => (
        <ErrandCard
          key={req.id}
          errand={req}
          currentUser={auth.currentUser}
        />
      ))}

      {requests.length === 0 && <p>No requests yet 👀</p>}
    </div>
  );
}