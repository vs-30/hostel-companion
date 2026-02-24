import { useEffect, useState } from "react";
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

export default AnsweredByYou;