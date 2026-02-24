import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "../firebase";

const QuestionDetail = () => {
  const { id } = useParams();

  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [answerText, setAnswerText] = useState("");

  useEffect(() => {
    const fetchQuestion = async () => {
      const snap = await getDoc(doc(db, "questions", id));
      if (snap.exists()) {
        setQuestion({ id: snap.id, ...snap.data() });
      }
    };

    fetchQuestion();

    const q = query(collection(db, "answers"), where("questionId", "==", id));

    const unsub = onSnapshot(q, (snapshot) => {
      setAnswers(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      );
    });

    return () => unsub();
  }, [id]);

  const handleAnswer = async () => {
    if (!answerText.trim()) return;

    if (auth.currentUser.uid === question.userId) {
      alert("You cannot answer your own question.");
      return;
    }

    if (answers.some((a) => a.isApproved)) {
      alert("This question already has an approved answer.");
      return;
    }

    await addDoc(collection(db, "answers"), {
      questionId: id,
      questionText: question?.text,
      answerText: answerText.trim(),
      answeredBy: auth.currentUser.uid,
      answeredByName: auth.currentUser.displayName,
      createdAt: serverTimestamp(),
      isApproved: false,
    });

    setAnswerText("");
  };

  const handleApprove = async (answer) => {
    if (auth.currentUser.uid !== question.userId) {
      alert("Only the question owner can approve.");
      return;
    }

    const subjectCode = question.courseCode || "GENERAL";

    // Mark answer as approved
    await updateDoc(doc(db, "answers", answer.id), {
      isApproved: true,
    });

    // 1️⃣ Give 50 credits to approved answer user
    const approvedUserRef = doc(db, "users", answer.answeredBy);
    const approvedSnap = await getDoc(approvedUserRef);
    const approvedData = approvedSnap.data() || {};
    let approvedCredits = { ...(approvedData.credits || {}) };

    if (!approvedCredits[subjectCode]) approvedCredits[subjectCode] = 0;
    approvedCredits[subjectCode] += 50;

    await updateDoc(approvedUserRef, { credits: approvedCredits });

    // 2️⃣ Give 10 credits to other answerers
    for (let ans of answers) {
      if (ans.id !== answer.id) {
        const otherRef = doc(db, "users", ans.answeredBy);
        const otherSnap = await getDoc(otherRef);
        const otherData = otherSnap.data() || {};
        let otherCredits = { ...(otherData.credits || {}) };

        if (!otherCredits[subjectCode]) otherCredits[subjectCode] = 0;
        otherCredits[subjectCode] += 10;

        await updateDoc(otherRef, { credits: otherCredits });
      }
    }

    // 3️⃣ Give 5 credits to question owner (for approving)
    const ownerRef = doc(db, "users", question.userId);
    const ownerSnap = await getDoc(ownerRef);
    const ownerData = ownerSnap.data() || {};
    let ownerCredits = { ...(ownerData.credits || {}) };

    if (!ownerCredits[subjectCode]) ownerCredits[subjectCode] = 0;
    ownerCredits[subjectCode] += 5;

    await updateDoc(ownerRef, { credits: ownerCredits });

    alert("Answer approved & credits awarded!");
  };

  return (
    <div className="side-page-content">
      <div className="travel-card">
        <h2>{question?.text}</h2>
        <small>Asked by: {question?.name || "Unknown"}</small>
      </div>

      {auth.currentUser?.uid !== question?.userId &&
        !answers.some((a) => a.isApproved) && (
          <div className="travel-card">
            <textarea
              placeholder="Write your answer..."
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
            />
            <button className="action-btn" onClick={handleAnswer}>
              Submit Answer
            </button>
          </div>
        )}

      <h3 style={{ marginTop: "20px" }}>All Answers</h3>

      <div className="posts-grid">
        {answers.map((ans) => (
          <div key={ans.id} className="travel-card">
            <p>{ans.answerText}</p>
            <small>— {ans.answeredByName}</small>

            {question?.userId === auth.currentUser?.uid &&
              !ans.isApproved && (
                <button
                  className="action-btn"
                  onClick={() => handleApprove(ans)}
                >
                  Approve Answer
                </button>
              )}

            {ans.isApproved && (
              <span style={{ color: "green", fontWeight: "bold" }}>
                Approved ✓
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuestionDetail;