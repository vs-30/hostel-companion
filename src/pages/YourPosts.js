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
import "../styles/helphub.css";

const YourPosts = () => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [approvedAnswers, setApprovedAnswers] = useState({});

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, "questions"),
      where("userId", "==", auth.currentUser.uid)
    );

    const unsubQ = onSnapshot(q, (snapshot) => {
      setQuestions(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      );
    });

    const unsubA = onSnapshot(collection(db, "answers"), (snapshot) => {
      setAnswers(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      );
    });

    return () => {
      unsubQ();
      unsubA();
    };
  }, []);


  const handleApprove = async (question, approvedAnswer) => {
    if (approvedAnswer.isApproved) return;

    const subjectCode = question.courseCode || "GENERAL";

    await updateDoc(doc(db, "answers", approvedAnswer.id), {
      isApproved: true,
    });
    setApprovedAnswers((prev) => ({
    ...prev,
    [approvedAnswer.id]: true,
  }));
    const addCreditsToUser = async (userId, points) => {
      const userRef = doc(db, "users", userId);
      const snap = await getDoc(userRef);

      if (!snap.exists()) return;

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

    await addCreditsToUser(approvedAnswer.answeredBy, 50);
    const otherAnswers = answers.filter(
      (a) => a.questionId === question.id && a.id !== approvedAnswer.id
    );

    for (let ans of otherAnswers) {
      await addCreditsToUser(ans.answeredBy, 10);
    }
    // ===============================
    await addCreditsToUser(question.userId, 5);
  };

  return (
    <>
      <HelpHubSidebar />
      <div className="side-page-content">
        <h2 className="travel-page-title">Your Posts</h2>

        <div className="questions-grid">
          {questions.map((q) => {
            const approvedExists = answers.some(
              (a) => a.questionId === q.id && a.isApproved
            );

            return (
              <div key={q.id} className="question-card">
                <h3>{q.courseCode}</h3>
                <strong className="question">{q.text}</strong>
                <p>Answers:</p>
{answers
  .filter((a) => a.questionId === q.id)
  .map((ans) => (
    <div key={ans.id} className="answer-card">
      <p className="answer-text">{ans.answerText}</p>
      <small className="answered-by">— {ans.answeredBy}</small>

      <div className="button-container">
        {q.userId === auth.currentUser.uid && !ans.isApproved && !approvedAnswers[ans.id] && (
          <button
            className="approve-btn"
            onClick={() => handleApprove(q, ans)}
          >
            Approve Answer
          </button>
        )}

        {(ans.isApproved || approvedAnswers[ans.id]) && (
          <button className="approve-btn approved" disabled>
            Approved!
          </button>
        )}
      </div>
    </div>
  ))}

                {approvedExists && (
                  <div
                    style={{
                      marginTop: "10px",
                      fontStyle: "italic",
                      color: "#666",
                    }}
                  >
                    This question has an approved answer.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default YourPosts;