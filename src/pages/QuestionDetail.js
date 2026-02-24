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

    // Check if question already has approved answer
    if (answers.some((a) => a.isApproved)) {
      alert("This question already has an approved answer. You cannot answer.");
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
      alert("Only the question poster can approve an answer.");
      return;
    }

    const answerRef = doc(db, "answers", answer.id);
    await updateDoc(answerRef, { isApproved: true });

    const subjectCode = question.courseCode || "GENERAL";

    // Award points to approved user
    const approvedUserRef = doc(db, "users", answer.answeredBy);
    const approvedUserSnap = await getDoc(approvedUserRef);
    const approvedUserData = approvedUserSnap.data() || {};
    let updatedCredits = { ...(approvedUserData.credits || {}) };
    if (!updatedCredits[subjectCode]) updatedCredits[subjectCode] = 0;
    updatedCredits[subjectCode] += 50; // approved answer gets 50
    await updateDoc(approvedUserRef, { credits: updatedCredits });

    // Award 10 points to others who answered
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
  };

  return (
    <div className="side-page-content">
      <div className="travel-card">
        <h2>{question?.text}</h2>
        <small>Asked by: {question?.name || "Unknown"}</small>
      </div>

      {/* Answer Box */}
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

            {question?.userId === auth.currentUser?.uid && !ans.isApproved && (
              <button
                className="action-btn"
                onClick={() => handleApprove(ans)}
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
      </div>
    </div>
  );
};

export default QuestionDetail;