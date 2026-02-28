import { setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  onSnapshot,
  doc,
  runTransaction,
  increment,
} from "firebase/firestore";
import { db, auth } from "../firebase";
import ErrandCard from "./ErrandCard";
import CreateErrand from "./CreateErrand";

export default function ErrandFeed() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  /* ---------------- FETCH TASKS ---------------- */
  useEffect(() => {
    const q = query(collection(db, "tasks"));

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate() || new Date(),
      }));

      setTasks(data.sort((a, b) => b.createdAt - a.createdAt));
    });

    return () => unsub();
  }, []);

  /* ---------------- FILTER + SEARCH ---------------- */
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch =
        task.type?.toLowerCase().includes(search.toLowerCase());

      const matchesFilter =
        filter === "all" || task.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [tasks, search, filter]);

  /* ---------------- ACCEPT TASK ---------------- */
  const handleAccept = async (task) => {
    const taskRef = doc(db, "tasks", task.id);

    try {
      await runTransaction(db, async (tx) => {
        const snap = await tx.get(taskRef);

        if (!snap.exists()) throw new Error("Missing");
        if (snap.data().status !== "pending")
          throw new Error("Already Taken");

        tx.update(taskRef, {
          status: "accepted",
          acceptedBy: auth.currentUser.uid,
        });
      });

      // Create private chat
      const ownerId = task.createdBy; // make sure this exists in your task doc
      const accepterId = auth.currentUser.uid;
      const chatId = task.id + "_" + accepterId;

      await setDoc(doc(db, "errandChats", chatId), {
        participants: [ownerId, accepterId],
        errandId: task.id,
        createdAt: serverTimestamp(),
      });

      navigate(`/errand-chat/${chatId}`);

    } catch (err) {
      console.error(err);
      alert("Too late ⚡");
    }
  };

  /* ---------------- COMPLETE TASK ---------------- */
  const handleComplete = async (task) => {
    const taskRef = doc(db, "tasks", task.id);
    const userRef = doc(db, "users", task.acceptedBy);

    const shopMap = {
      Canteen: "canteen",
      Pharmacy: "pharmacy",
      "Xerox Shop": "xerox",
      Stationary: "stationary",
    };

    const shopKey = shopMap[task.type];
    const creditAmount = (task.totalItems || 1) * 10;

    try {
      await runTransaction(db, async (tx) => {
        const snap = await tx.get(taskRef);

        if (!snap.exists()) throw new Error("Missing");
        if (snap.data().status !== "accepted")
          throw new Error("Not eligible");

        tx.update(taskRef, {
          status: "completed",
          completedAt: serverTimestamp(),
        });

        tx.update(userRef, {
          [`taskCredits.${shopKey}`]: increment(creditAmount),
        });
      });

      await addDoc(collection(db, "creditLogs"), {
        userId: task.acceptedBy,
        amount: creditAmount,
        shop: shopKey,
        type: "earn",
        timestamp: serverTimestamp(),
      });

    } catch (err) {
      console.error(err);
      alert("Something went wrong ⚠️");
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div>
      <h2 className="travel-page-title">Errand Feed</h2>

      <div className="search-section">
        <div className="search-wrapper">
          <input
            type="text"
            placeholder="Search by shop..."
            className="custom-search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="category-tabs">
          {["all", "pending", "accepted", "completed"].map((tab) => (
            <button
              key={tab}
              className={`tab-btn ${filter === tab ? "active" : ""}`}
              onClick={() => setFilter(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {filteredTasks.length === 0 && (
        <p style={{ color: "var(--text-main)" }}>
          No errands found ✨
        </p>
      )}

      {filteredTasks.map((task) => (
        <ErrandCard
          key={task.id}
          errand={task}
          onAccept={handleAccept}
          onComplete={handleComplete}
          currentUser={auth.currentUser}
        />
      ))}

      <CreateErrand />
    </div>
  );
}