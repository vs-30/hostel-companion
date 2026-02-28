/*import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";

const QuestionCard = ({ question }) => {
  const navigate = useNavigate();
  const isOwner = auth.currentUser?.uid === question.userId;

  return (
    <div className="travel-card">
      <div className="card-header">
        <h3 className="destination-title">
  {question.courseCode} - {question.courseName}
</h3>
      </div>

      <p>{question.text}</p>

      <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
        <button
          className="action-btn"
          onClick={() =>
            navigate(`/helphub/question/${question.id}`)
          }
        >
          View Answers
        </button>

        {!isOwner && (
          <button
            className="secondary-btn action-btn"
            onClick={() =>
              navigate(`/helphub/question/${question.id}`, {
                state: { openAnswerBox: true },
              })
            }
          >
            Answer
          </button>
        )}
      </div>
    </div>
  );
};

export default QuestionCard;*/
import { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
} from "firebase/firestore";

const QuestionCard = ({ question }) => {
  const [showAnswers, setShowAnswers] = useState(false);
  const [showAnswerBox, setShowAnswerBox] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [answerText, setAnswerText] = useState("");
  const hasApprovedAnswer = answers.some((a) => a.isApproved);
  const isOwner = auth.currentUser?.uid === question.userId;

  useEffect(() => {
    if (!showAnswers && !showAnswerBox) return;

    const q = query(
      collection(db, "answers"),
      where("questionId", "==", question.id)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      setAnswers(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      );
    });

    return () => unsub();
  }, [showAnswers, showAnswerBox, question.id]);

  const handleAnswerSubmit = async () => {
    if (!answerText.trim()) return;

    // 🔥 Fetch username first
let username = "Unknown";

const userRef = doc(db, "users", auth.currentUser.uid);
const userSnap = await getDoc(userRef);

if (userSnap.exists()) {
  username = userSnap.data().username;
}

await addDoc(collection(db, "answers"), {
  questionId: question.id,
  questionText: question.text,
  answerText: answerText.trim(),
  answeredBy: auth.currentUser.uid,
  answeredByUsername: username, // ✅ ADD THIS
  courseCode: question.courseCode,
  createdAt: serverTimestamp(),
  isApproved: false,
});

    setAnswerText("");
    setShowAnswerBox(false);
  };

  return (
    <div className="question-card">
      <div className="card-header">
        <h3>
          {question.courseCode}
        </h3>
      </div>

      <p className="question-text">{question.text}</p>

      <div className="card-actions">
        <button
          className="view-btn"
          onClick={() => {
            setShowAnswers(!showAnswers);
            setShowAnswerBox(false);
          }}
        >
          {showAnswers ? "Hide Answers" : "View Answers"}
        </button>

        {!isOwner && !hasApprovedAnswer && (
          <button
          className="answer-btn"
          onClick={() => {
            setShowAnswers(true);
            setShowAnswerBox(true);
          }}
          >
           Answer
           </button>)}
      </div>

      {/* ANSWERS ONLY */}
      {showAnswers && (
        <div className="answers-section">
          {answers.length > 0 ? (
            answers.map((ans) => (
              <div key={ans.id} className="answer-card">
                <p>{ans.answerText}</p>
                <small>— {ans.answeredByUsername || "Unknown"}</small>
              </div>
            ))
          ) : (
            <p className="no-answers">No answers yet.</p>
          )}
        </div>
      )}

      {/* ANSWER BOX ONLY */}
      {showAnswerBox && (
        <div className="answer-box">
          <textarea
            placeholder="Write your answer..."
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
          />
          <button className="submit-btn" onClick={handleAnswerSubmit}>
            Submit Answer
          </button>
        </div>
      )}
    </div>
  );
};

export default QuestionCard;