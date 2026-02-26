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
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [description, setDescription] = useState("");
  const [taskType, setTaskType] = useState("Canteen");

  /* ---------------- FETCH TASKS ---------------- */
  useEffect(() => {
    const q = query(collection(db, "tasks"));

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      }));

      setTasks(data.sort((a, b) => b.createdAt - a.createdAt));
    });

    return () => unsub();
  }, []);

  /* ---------------- FILTER + SEARCH ---------------- */
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch =
        task.description?.toLowerCase().includes(search.toLowerCase());

      const matchesFilter =
        filter === "all" || task.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [tasks, search, filter]);

  /* ---------------- POST TASK ---------------- */
  const handlePost = async (e) => {
    e.preventDefault();

    if (!description.trim()) return;

    try {
      await addDoc(collection(db, "tasks"), {
        type: taskType,
        description,
        requesterId: auth.currentUser.uid,
        requesterName: auth.currentUser.displayName || "Hosteller",
        status: "pending",
        createdAt: serverTimestamp(),
      });

      setDescription("");
      setShowModal(false);
    } catch (err) {
      console.error(err);
      alert("Could not post 😵");
    }
  };

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

  } catch (err) {
    console.error(err);
    alert("Too late ⚡");
  }
};
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

      // 1️⃣ Mark completed
      tx.update(taskRef, {
        status: "completed",
        completedAt: serverTimestamp(),
      });

      // 2️⃣ Add credits to accepter
      tx.update(userRef, {
        [`taskCredits.${shopKey}`]: increment(creditAmount),
      });
    });

    // 3️⃣ Log credits
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
  return (
    <div>
      <h2 className="travel-page-title">Errand Feed</h2>

      Search 
      <div className="search-wrapper">
        <input
          type="text"
          placeholder="Search errands..."
          className="custom-search-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Filter Tabs */}
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

      {/* Feed */}
      {filteredTasks.length === 0 && <p style={{color:"var(--text-main)"}}>No errands found ✨</p>}

      {filteredTasks.map((task) => (
  <ErrandCard
    key={task.id}
    errand={task}
    onAccept={handleAccept}
    onComplete={handleComplete}
    currentUser={auth.currentUser}
  />
))}
      <CreateErrand/>

      {/* Floating Action Button 
      <button
        className="fab-button"
        onClick={() => setShowModal(true)}
      >
        +
      </button>

      {/* Modal 
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content travel-card create-post-form">
            <div className="modal-header">
              <h3>Create Errand</h3>
              <button
                className="close-modal"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handlePost}>
              <div className="input-group">
                <label className="input-label">Select Shop</label>
                <select
                  value={taskType}
                  onChange={(e) => setTaskType(e.target.value)}
                >
                  <option>Canteen</option>
                  <option>Pharmacy</option>
                  <option>Xerox Shop</option>
                  <option>Stationary</option>
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">What do you need?</label>
                <textarea
                  className="textarea-fixed"
                  placeholder="Describe your order..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <button className="action-btn" type="submit">
                Post Request
              </button>
            </form>
          </div>
        </div>
      )}*/}
    </div>
  );
}