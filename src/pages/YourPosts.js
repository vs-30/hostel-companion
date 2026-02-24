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
    if (approvedAnswer.isApproved) return;

    const subjectCode = question.courseCode || "GENERAL";

    // Mark approved
    await updateDoc(doc(db, "answers", approvedAnswer.id), {
      isApproved: true,
    });

    // ===============================
    // 1️⃣ Approved answerer +50
    // ===============================
    const approvedRef = doc(db, "users", approvedAnswer.answeredBy);
    const approvedSnap = await getDoc(approvedRef);
    const approvedData = approvedSnap.data() || {};

    let approvedCredits = { ...(approvedData.credits || {}) };
    if (!approvedCredits[subjectCode]) approvedCredits[subjectCode] = 0;

    approvedCredits[subjectCode] += 50;

    await updateDoc(approvedRef, { credits: approvedCredits });

    // ===============================
    // 2️⃣ Other answerers +10
    // ===============================
    const otherAnswers = answers.filter(
      (a) => a.questionId === question.id && a.id !== approvedAnswer.id
    );

    for (let ans of otherAnswers) {
      const userRef = doc(db, "users", ans.answeredBy);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data() || {};

      let credits = { ...(userData.credits || {}) };
      if (!credits[subjectCode]) credits[subjectCode] = 0;

      credits[subjectCode] += 10;

      await updateDoc(userRef, { credits });
    }

    // ===============================
    // 3️⃣ Question owner +5
    // ===============================
    const ownerRef = doc(db, "users", question.userId);
    const ownerSnap = await getDoc(ownerRef);
    const ownerData = ownerSnap.data() || {};

    let ownerCredits = { ...(ownerData.credits || {}) };
    if (!ownerCredits[subjectCode]) ownerCredits[subjectCode] = 0;

    ownerCredits[subjectCode] += 5;

    await updateDoc(ownerRef, { credits: ownerCredits });
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
                .map((ans) => (
                  <div key={ans.id} style={{ marginBottom: "10px" }}>
                    <p>{ans.answerText}</p>
                    <small>— {ans.answeredByName}</small>

                    {q.userId === auth.currentUser.uid && !ans.isApproved && (
                      <button
                        className="action-btn"
                        onClick={() => handleApprove(q, ans)}
                      >
                        Approve Answer
                      </button>
                    )}

                    {ans.isApproved && (
                      <span style={{ color: "green", fontWeight: "bold" }}>
                        Approved!
                      </span>
                    )}
                  </div>
                ))}

              {approvedExists && (
                <div style={{ marginTop: "10px", fontStyle: "italic" }}>
                  This question has an approved answer.
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