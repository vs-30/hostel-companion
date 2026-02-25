// errands/components/Shops.jsx
import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../firebase";

export default function Shops() {
  const [userId, setUserId] = useState(null);
  const [credits, setCredits] = useState({});

  const shops = [
    { name: "Canteen", key: "canteen", icon: "🍔", description: "Food & Beverages" },
    { name: "Pharmacy", key: "pharmacy", icon: "💊", description: "Medicines & Health" },
    { name: "Xerox Shop", key: "xerox", icon: "📄", description: "Printing & Copies" },
    { name: "Stationary", key: "stationary", icon: "📚", description: "Books & Supplies" }
  ];

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) setUserId(user.uid);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!userId) return;
    const unsub = onSnapshot(doc(db, "users", userId), (snapshot) => {
      if (snapshot.exists()) {
        setCredits(snapshot.data().credits || {});
      }
    });
    return () => unsub();
  }, [userId]);

  return (
    <>
      <h1 className="travel-page-title">Available Shops</h1>
      
      <div className="posts-grid">
        {shops.map((shop) => (
          <div key={shop.key} className="travel-card">
            <div style={{ fontSize: "3rem", textAlign: "center", marginBottom: "10px" }}>
              {shop.icon}
            </div>
            <h3 style={{ textAlign: "center", margin: "10px 0" }}>{shop.name}</h3>
            <p style={{ textAlign: "center", color: "var(--text-secondary)" }}>
              {shop.description}
            </p>
            <div style={{ 
              background: "var(--accent-color)", 
              color: "white",
              padding: "8px",
              borderRadius: "8px",
              textAlign: "center",
              fontWeight: "bold",
              margin: "10px 0"
            }}>
              Your Credits: {credits[shop.key] || 0} pts
            </div>
            <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", textAlign: "center" }}>
              Earn 10 credits per delivery
            </p>
          </div>
        ))}
      </div>
    </>
  );
}