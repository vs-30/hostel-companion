import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import HelpHubSidebar from "../components/HelpHubSidebar";

const CreditsPage = () => {
  const [credits, setCredits] = useState({});
  const [assignments, setAssignments] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      const userRef = doc(db, "users", auth.currentUser.uid);
      const snap = await getDoc(userRef);

      if (snap.exists()) {
        const data = snap.data();
        setCredits(data.credits || {});
        setAssignments(data.assignments || {});
      }
    };

    fetchData();
  }, []);

  const handleAvail = async (subject, assignmentKey) => {
    const userRef = doc(db, "users", auth.currentUser.uid);
    const snap = await getDoc(userRef);
    const data = snap.data();

    let updatedCredits = { ...(data.credits || {}) };
    let updatedAssignments = { ...(data.assignments || {}) };

    if (!updatedAssignments[subject]) {
      updatedAssignments[subject] = {
        assignment1: false,
        assignment2: false,
      };
    }

    if (updatedCredits[subject] < 500) {
      alert("Not enough credits.");
      return;
    }

    updatedCredits[subject] -= 500;
    updatedAssignments[subject][assignmentKey] = true;

    await updateDoc(userRef, {
      credits: updatedCredits,
      assignments: updatedAssignments,
    });

    setCredits(updatedCredits);
    setAssignments(updatedAssignments);

    alert("Assignment claimed successfully!");
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
              <p>Total Points: {pts}</p>

              <div style={{ marginTop: "10px" }}>
                <p>
                  Assignment 1:{" "}
                  {assignments?.[subject]?.assignment1
                    ? "Claimed"
                    : "Not Claimed"}
                </p>

                {!assignments?.[subject]?.assignment1 && pts >= 500 && (
                  <button
                    className="action-btn"
                    onClick={() => handleAvail(subject, "assignment1")}
                  >
                    Claim Assignment 1 (500 pts)
                  </button>
                )}

                <p>
                  Assignment 2:{" "}
                  {assignments?.[subject]?.assignment2
                    ? "Claimed"
                    : "Not Claimed"}
                </p>

                {!assignments?.[subject]?.assignment2 && pts >= 500 && (
                  <button
                    className="action-btn"
                    onClick={() => handleAvail(subject, "assignment2")}
                  >
                    Claim Assignment 2 (500 pts)
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default CreditsPage;