import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../../firebase";

export default function Shops() {
  const [userId, setUserId] = useState(null);
  const [credits, setCredits] = useState({});

  const shops = [
    { name: "Canteen", key: "canteen" },
    { name: "Pharmacy", key: "pharmacy" },
    { name: "Xerox Shop", key: "xerox" },
    { name: "Stationary", key: "stationary" }
  ];

  // Get logged-in user
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Listen to credits
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
    <div>
      <h2>Available Shops 🏪</h2>

      <div className="shops-grid">
        {shops.map((shop) => (
          <div key={shop.key} className="shop-card">
            <div className="shop-header">
              <h3>{shop.name}</h3>
              <div className="credit-box">
                {credits[shop.key] || 0} pts
              </div>
            </div>
            <p>Earn & redeem credits</p>
          </div>
        ))}
      </div>
    </div>
  );
}