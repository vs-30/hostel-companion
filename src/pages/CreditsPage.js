
import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import HelpHubSidebar from "../components/HelpHubSidebar";
import { FaCoins, FaCheckCircle, FaLock } from "react-icons/fa"; // New Icons
import "../styles/helphub.css"; 

const CreditsPage = () => {
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      if (!auth.currentUser) return;
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

    const courseIndex = updatedCourses.findIndex((c) => c.code === courseCode);
    if (courseIndex === -1) return;

    if ((updatedCourses[courseIndex].credits || 0) < 500) {
      alert("Not enough credits! You need 500 points.");
      return;
    }

    updatedCourses[courseIndex].credits -= 500;

    if (!updatedAssignments[courseCode]) {
      updatedAssignments[courseCode] = { assignment1: false, assignment2: false };
    }

    updatedAssignments[courseCode][assignmentKey] = true;

    await updateDoc(userRef, {
      enrolledCourses: updatedCourses,
      assignments: updatedAssignments,
    });

    setCourses(updatedCourses);
    setAssignments(updatedAssignments);
    alert("Assignment unlocked!");
  };

  return (
    <>
      <HelpHubSidebar />
      <div className="side-page-content">
        {/*<h2 className="travel-page-title">Credits Dashboard</h2>*/}

        <div className="credits-container">
          {courses.length === 0 ? (
            <p className="no-data">No subjects enrolled yet.</p>
          ) : (
            courses.map((course) => (
              <div key={course.code} className="wide-credits-card">
                {/* Header Section: Left (Title) vs Right (Points) */}
                <div className="card-main-info">
                  <div className="course-identity">
                    <h1 className="highlight-code">{course.code}</h1>
                    <p className="course-name-sub">{course.name}</p>
                  </div>
                  
                  <div className="points-badge">
                    <FaCoins className="coin-icon" />
                    <div className="points-text">
                      <span className="points-number">{course.credits || 0}</span>
                      <span className="points-label">Total Points</span>
                    </div>
                  </div>
                </div>

                <hr className="divider" />

                {/* Assignments Section */}
                <div className="assignments-row">
                  {["assignment1", "assignment2"].map((key, index) => {
                    const isClaimed = assignments?.[course.code]?.[key];
                    const canAfford = (course.credits || 0) >= 500;

                    return (
                      <div key={key} className={`assignment-box ${isClaimed ? "claimed" : ""}`}>
                        <div className="assignment-status">
                          <span>Assignment {index + 1}</span>
                          {isClaimed ? <FaCheckCircle className="status-icon success" /> : <FaLock className="status-icon locked" />}
                        </div>
                        
                        {!isClaimed ? (
                          <button 
                            className={`claim-btn ${!canAfford ? "disabled" : ""}`}
                            onClick={() => handleAvail(course.code, key)}
                            disabled={!canAfford}
                          >
                            {canAfford ? "Claim (500 pts)" : "Need more points"}
                          </button>
                        ) : (
                          <span className="unlocked-text">Unlocked</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default CreditsPage;