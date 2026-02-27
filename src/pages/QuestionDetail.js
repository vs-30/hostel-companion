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

  // 🔥 Declare username OUTSIDE
  let username = "Unknown";

  const userRef = doc(db, "users", auth.currentUser.uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    username = userSnap.data().username;
  }

  await addDoc(collection(db, "answers"), {
    questionId: id,
    questionText: question?.text,
    answerText: answerText.trim(),
    answeredBy: auth.currentUser.uid,
    answeredByUsername: username, // ✅ now defined
    courseCode: question.courseCode,
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

  const subjectCode = question.courseCode;

  // 1️⃣ Mark answer as approved
  await updateDoc(doc(db, "answers", answer.id), {
    isApproved: true,
  });

  // 🔹 Helper function to update credits inside enrolledCourses
  const addCreditsToUser = async (userId, points) => {
    const userRef = doc(db, "users", userId);
    const snap = await getDoc(userRef);
    const data = snap.data();

    if (!data?.enrolledCourses) return;

    const updatedCourses = data.enrolledCourses.map((course) => {
      if (course.code === subjectCode) {
        return {
          ...course,
          credits: (course.credits || 0) + points,
        };
      }
      return course;
    });

    await updateDoc(userRef, {
      enrolledCourses: updatedCourses,
    });
  };

  // 2️⃣ 50 credits to approved answer user
  await addCreditsToUser(answer.answeredBy, 50);

  // 3️⃣ 10 credits to other answerers
  for (let ans of answers) {
    if (ans.id !== answer.id) {
      await addCreditsToUser(ans.answeredBy, 10);
    }
  }

  // 4️⃣ 5 credits to question owner
  await addCreditsToUser(question.userId, 5);

  alert("Answer approved & credits awarded!");
};

  return (
    <div className="side-page-content">
      <div className="travel-card">
        <h2>{question?.text}</h2>
        <small>Asked by: {question?.username || "Unknown"}</small>
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
            <small>Answered by: {ans.answeredByUsername || "Unknown"}</small>

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