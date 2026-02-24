import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import HelpHubSidebar from "../components/HelpHubSidebar";

const CreditsPage = () => {
  const [credits, setCredits] = useState({});

  useEffect(() => {
    const fetchCredits = async () => {
      const userRef = doc(db, "users", auth.currentUser.uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        setCredits(snap.data().credits || {});
      }
    };
    fetchCredits();
  }, []);

  const handleAvail = async (subject, assignment) => {
  const userRef = doc(db, "users", auth.currentUser.uid);
  const snap = await getDoc(userRef);
  const data = snap.data();

  let credits = data.credits || {};
  let assignments = data.assignments || {};

  if (!assignments[subject]) {
    assignments[subject] = { assignment1: false, assignment2: false };
  }

  if (assignment === "assignment1" && !assignments[subject].assignment1) {
    if (credits[subject] < 500) {
      alert("Not enough points.");
      return;
    }

    assignments[subject].assignment1 = true;
    credits[subject] -= 500;

    await updateDoc(userRef, { assignments, credits });

    setCredits(credits); // update UI immediately
  }

  if (assignment === "assignment2" && !assignments[subject].assignment2) {
    if (credits[subject] < 500) {
      alert("Not enough points.");
      return;
    }

    assignments[subject].assignment2 = true;
    credits[subject] -= 500;

    await updateDoc(userRef, { assignments, credits });

    setCredits(credits);
  }
};

  return (
    <>
      <HelpHubSidebar />
      <div className="side-page-content">
        <h2 className="travel-page-title">Your Credits & Assignments</h2>
        {Object.keys(credits).length === 0 && <p>No credits yet.</p>}

        <div className="posts-grid">
          {Object.entries(credits).map(([subject, pts]) => (
            <div key={subject} className="travel-card">
              <h3>{subject}</h3>
              <p>Points: {pts}</p>
              <AssignmentSection subject={subject} points={pts} handleAvail={handleAvail} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

const AssignmentSection = ({ subject, points, handleAvail }) => {
  const [status, setStatus] = useState({ assignment1: false, assignment2: false });

  useEffect(() => {
    const fetchStatus = async () => {
      const snap = await getDoc(doc(db, "users", auth.currentUser.uid));
      const data = snap.data();
      if (data?.assignments?.[subject]) setStatus(data.assignments[subject]);
    };
    fetchStatus();
  }, [subject]);

  return (
    <div style={{ marginTop: "10px" }}>
      <p>Assignment 1: {status.assignment1 ? "Done" : "Pending"}</p>
      {points >= 500 && !status.assignment1 && (
        <button className="action-btn" onClick={() => handleAvail(subject, "assignment1")}>
          Avail Points for Assignment 1
        </button>
      )}
      <p>Assignment 2: {status.assignment2 ? "Done" : "Pending"}</p>
      {points >= 1000 && !status.assignment2 && (
        <button className="action-btn" onClick={() => handleAvail(subject, "assignment2")}>
          Avail Points for Assignment 2
        </button>
      )}
    </div>
  );
};

export default CreditsPage;