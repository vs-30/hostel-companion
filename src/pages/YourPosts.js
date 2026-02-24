import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  getDoc
} from "firebase/firestore";
import { db, auth } from "../firebase";
import HelpHubSidebar from "../components/HelpHubSidebar";

const YourPosts = () => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);

  useEffect(() => {
    // Fetch your questions
    const q = query(
      collection(db, "questions"),
      where("userId", "==", auth.currentUser.uid)
    );

    const unsubQ = onSnapshot(q, (snapshot) => {
      setQuestions(snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })));
    });

    // Fetch all answers
    const unsubA = onSnapshot(collection(db, "answers"), (snapshot) => {
      setAnswers(snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })));
    });

    return () => {
      unsubQ();
      unsubA();
    };
  }, []);

  const handleApprove = async (question, approvedAnswer) => {
    const answerRef = doc(db, "answers", approvedAnswer.id);
    await updateDoc(answerRef, { isApproved: true });

    const subjectCode = question.courseCode || "GENERAL";

    // Award points to approved answerer
    const approvedUserRef = doc(db, "users", approvedAnswer.answeredBy);
    const approvedSnap = await getDoc(approvedUserRef);
    const approvedData = approvedSnap.data() || {};
    let approvedCredits = { ...(approvedData.credits || {}) };
    if (!approvedCredits[subjectCode]) approvedCredits[subjectCode] = 0;
    if (approvedCredits[subjectCode] + 50 <= 500) {
      approvedCredits[subjectCode] += 50;
      await updateDoc(approvedUserRef, { credits: approvedCredits });
    }

    // Award 10 points to other answerers
    const otherAnswers = answers.filter(
      (a) => a.questionId === question.id && a.id !== approvedAnswer.id
    );

    for (let a of otherAnswers) {
      const userRef = doc(db, "users", a.answeredBy);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data() || {};
      let credits = { ...(userData.credits || {}) };
      if (!credits[subjectCode]) credits[subjectCode] = 0;

      // Only add if under 500
      if (credits[subjectCode] + 10 <= 500) {
        credits[subjectCode] += 10;
        await updateDoc(userRef, { credits });
      }
    }
  };

  return (
    <>
      <HelpHubSidebar />
      <div className="side-page-content">
        <h2 className="travel-page-title">Your Posts</h2>

        {questions.map((q) => {
          const approvedExists = answers.some(
            (a) => a.questionId === q.id && a.isApproved
          );

          return (
            <div key={q.id} className="travel-card">
              <h3>{q.text}</h3>
              <h4>Answers:</h4>

              {answers
                .filter((a) => a.questionId === q.id)
                .map((ans, i) => (
                  <div key={i} style={{ marginBottom: "10px" }}>
                    <p>{ans.answerText}</p>
                    <small>— {ans.answeredByName}</small>

                    {/* Approve button only for question owner & if not approved */}
                    {q.userId === auth.currentUser.uid && !ans.isApproved && (
                      <button
                        className="action-btn"
                        style={{ marginLeft: "10px" }}
                        onClick={() => handleApprove(q, ans)}
                      >
                        Approve Answer
                      </button>
                    )}

                    {ans.isApproved && (
                      <span
                        style={{
                          color: "green",
                          fontWeight: "bold",
                          marginLeft: "10px",
                        }}
                      >
                        Approved!
                      </span>
                    )}
                  </div>
                ))}

              {approvedExists && (
                <div style={{ marginTop: "10px", fontStyle: "italic" }}>
                  This question has an approved answer. No more answers allowed.
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
};

export default YourPosts;