/*import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db, auth } from "../firebase";
import HelpHubSidebar from "../components/HelpHubSidebar";

const AnsweredByYou = () => {
  const [answers, setAnswers] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, "answers"),
      where("answeredBy", "==", auth.currentUser.uid)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      setAnswers(snapshot.docs.map((doc) => doc.data()));
    });

    return () => unsub();
  }, []);

  return (
    <>
      <HelpHubSidebar />
      <div className="side-page-content">
        <h2 className="travel-page-title">Answered By You</h2>

        <div className="posts-grid">
          {answers.map((ans, index) => (
            <div key={index} className="travel-card">
              <h4>Question:</h4>
              <p>{ans.questionText}</p>
              <h4>Your Answer:</h4>
              <p>{ans.answerText}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default AnsweredByYou;*/
import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db, auth } from "../firebase";
import HelpHubSidebar from "../components/HelpHubSidebar";

const AnsweredByYou = () => {
  const [answers, setAnswers] = useState([]);

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, "answers"),
      where("answeredBy", "==", auth.currentUser.uid)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAnswers(data);
    });

    return () => unsub();
  }, []);

  return (
    <>
      <HelpHubSidebar />
      <div className="side-page-content">
        <h2 className="travel-page-title">Answered By You</h2>

        {answers.length === 0 && <p>You haven't answered any questions yet.</p>}

        <div className="posts-grid">
          {answers.map((ans) => (
            <div key={ans.id} className="travel-card">
              
              {/* Show subject */}
              <h4>
                {ans.courseCode || "Subject"}
              </h4>

              <h4>Question:</h4>
              <p>{ans.questionText}</p>

              <h4>Your Answer:</h4>
              <p>{ans.answerText}</p>

              {/* Approval Status */}
              {ans.isApproved ? (
                <span style={{ color: "green", fontWeight: "bold" }}>
                  Approved ✓
                </span>
              ) : (
                <span style={{ color: "gray" }}>
                  Not Approved Yet
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default AnsweredByYou;