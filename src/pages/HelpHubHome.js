import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  doc,
  getDoc,
} from "firebase/firestore";
import { db, auth } from "../firebase";
import QuestionCard from "../components/QuestionCard";
import HelpHubSidebar from "../components/HelpHubSidebar";
import CreateQuestion from "../components/CreateQuestion";

const HelpHubHome = () => {
  const [questions, setQuestions] = useState([]);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserAndListen = async () => {
      if (!auth.currentUser) return;

      // 🔹 Get logged in user's academic info
      const userRef = doc(db, "users", auth.currentUser.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) return;

      const data = userSnap.data();
      setUserData(data);

      // 🔹 Listen to questions
      const unsub = onSnapshot(collection(db, "questions"), (snapshot) => {
        const filtered = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter(
            (q) =>
              q.degree === data.degree &&
              q.year === data.year &&
              q.branch === data.branch
          );

        setQuestions(filtered);
      });

      return () => unsub();
    };

    fetchUserAndListen();
  }, []);

  return (
    <>
      <HelpHubSidebar />
      <div className="side-page-content">
        <h2 className="travel-page-title">Help Hub</h2>

        <CreateQuestion />

        <div className="posts-grid">
          {questions.map((q) => (
            <QuestionCard key={q.id} question={q} />
          ))}
        </div>
      </div>
    </>
  );
};

export default HelpHubHome;