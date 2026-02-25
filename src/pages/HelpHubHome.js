/*import { useEffect, useState } from "react";
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

export default HelpHubHome;*/

/*import { useEffect, useState } from "react";
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
  const [userCourses, setUserCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      if (!auth.currentUser) return;

      const userRef = doc(db, "users", auth.currentUser.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) return;

      const data = userSnap.data();

      // assuming you stored enrolledCourses during signup
      setUserCourses(data.enrolledCourses || []);
    };

    fetchUser();
  }, []);

  useEffect(() => {
    if (!selectedCourse) return;

    const unsub = onSnapshot(collection(db, "questions"), (snapshot) => {
      const filtered = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((q) => q.courseCode === selectedCourse);

      setQuestions(filtered);
    });

    return () => unsub();
  }, [selectedCourse]);

  return (
    <>
      <HelpHubSidebar />
      <div className="side-page-content">
        <h2 className="travel-page-title">Help Hub</h2>

        <div style={{ marginBottom: "20px" }}>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
          >
            <option value="">Select Subject</option>
            {userCourses.map((course) => (
              <option key={course.code} value={course.code}>
                {course.code} - {course.name}
              </option>
            ))}
          </select>
        </div> 
        {selectedCourse && (
          <CreateQuestion selectedCourse={selectedCourse} />
        )}

        <div className="posts-grid">
          {questions.map((q) => (
            <QuestionCard key={q.id} question={q} />
          ))}
        </div>
      </div>
    </>
  );
};

export default HelpHubHome;*/

import { useEffect, useState } from "react";
import { collection, onSnapshot, doc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { IoMdOptions } from "react-icons/io";
import QuestionCard from "../components/QuestionCard";
import HelpHubSidebar from "../components/HelpHubSidebar";
import CreateQuestion from "../components/CreateQuestion";
import "../styles/helphub.css"

const HelpHubHome = () => {
  const [allQuestions, setAllQuestions] = useState([]); // Stores everything
  const [filteredQuestions, setFilteredQuestions] = useState([]); // Display list
  const [userCourses, setUserCourses] = useState([]);
  const [filterCourse, setFilterCourse] = useState("all");

  // 1. Fetch User Courses
  useEffect(() => {
    const fetchUser = async () => {
      if (!auth.currentUser) return;
      const userSnap = await getDoc(doc(db, "users", auth.currentUser.uid));
      if (userSnap.exists()) {
        setUserCourses(userSnap.data().enrolledCourses || []);
      }
    };
    fetchUser();
  }, []);

  // 2. Listen to ALL Questions once
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "questions"), (snapshot) => {
      const questionsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAllQuestions(questionsData);
    });
    return () => unsub();
  }, []);

  // 3. Filter logic
  useEffect(() => {
    if (filterCourse === "all") {
      setFilteredQuestions(allQuestions);
    } else {
      setFilteredQuestions(allQuestions.filter(q => q.courseCode === filterCourse));
    }
  }, [filterCourse, allQuestions]);

    return (
    <>
      <HelpHubSidebar />
      <div className="side-page-content">
        <div className="hub-header">
          <div className="filter-container">
            <IoMdOptions className="filter-icon"/>
            <select 
              value={filterCourse} 
              onChange={(e) => setFilterCourse(e.target.value)}
              className="filter-select"

            >
              <option value="all">All Subjects</option>
              {userCourses.map(course => (
                <option key={course.code} value={course.code}>
                {course.code} - {course.name}
              </option>
              ))}
            </select>
          </div>
        </div>

        <CreateQuestion />

        <div className="questions-grid">
          {filteredQuestions.length > 0 ? (
            filteredQuestions.map((q) => <QuestionCard key={q.id} question={q} />)
          ) : (
            <p style={{ textAlign: "center", opacity: 0.5, marginTop: "50px" }}>
              No discussions found for this subject.
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default HelpHubHome;