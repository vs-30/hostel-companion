/*import { useEffect, useState } from "react";
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

export default CreditsPage;*/
import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import HelpHubSidebar from "../components/HelpHubSidebar";

const CreditsPage = () => {
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      const userRef = doc(db, "users", auth.currentUser.uid);
      const snap = await getDoc(userRef);

      if (snap.exists()) {
        const data = snap.data();
        setCourses(data.enrolledCourses || []);
        setAssignments(data.assignments || {});
      }
    };

    fetchData();
  }, []);

  const handleAvail = async (courseCode, assignmentKey) => {
    const userRef = doc(db, "users", auth.currentUser.uid);
    const snap = await getDoc(userRef);
    const data = snap.data();

    let updatedCourses = [...(data.enrolledCourses || [])];
    let updatedAssignments = { ...(data.assignments || {}) };

    const courseIndex = updatedCourses.findIndex(
      (c) => c.code === courseCode
    );

    if (courseIndex === -1) return;

    if (updatedCourses[courseIndex].credits < 500) {
      alert("Not enough credits.");
      return;
    }

    // Deduct credits
    updatedCourses[courseIndex].credits -= 500;

    // Initialize assignment structure
    if (!updatedAssignments[courseCode]) {
      updatedAssignments[courseCode] = {
        assignment1: false,
        assignment2: false,
      };
    }

    updatedAssignments[courseCode][assignmentKey] = true;

    await updateDoc(userRef, {
      enrolledCourses: updatedCourses,
      assignments: updatedAssignments,
    });

    setCourses(updatedCourses);
    setAssignments(updatedAssignments);

    alert("Assignment claimed successfully!");
  };

  return (
    <>
      <HelpHubSidebar />
      <div className="side-page-content">
        <h2 className="travel-page-title">
          Your Credits & Assignments
        </h2>

        {courses.length === 0 && <p>No subjects found.</p>}

        <div className="posts-grid">
          {courses.map((course) => (
            <div key={course.code} className="travel-card">
              <h3>
                {course.code} - {course.name}
              </h3>

              <p>Total Points: {course.credits || 0}</p>

              <div style={{ marginTop: "10px" }}>
                <p>
                  Assignment 1:{" "}
                  {assignments?.[course.code]?.assignment1
                    ? "Claimed"
                    : "Not Claimed"}
                </p>

                {!assignments?.[course.code]?.assignment1 &&
                  (course.credits || 0) >= 500 && (
                    <button
                      className="action-btn"
                      onClick={() =>
                        handleAvail(course.code, "assignment1")
                      }
                    >
                      Claim Assignment 1 (500 pts)
                    </button>
                  )}

                <p>
                  Assignment 2:{" "}
                  {assignments?.[course.code]?.assignment2
                    ? "Claimed"
                    : "Not Claimed"}
                </p>

                {!assignments?.[course.code]?.assignment2 &&
                  (course.credits || 0) >= 500 && (
                    <button
                      className="action-btn"
                      onClick={() =>
                        handleAvail(course.code, "assignment2")
                      }
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