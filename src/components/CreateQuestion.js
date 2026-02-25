import { useState, useEffect } from "react";
import { collection, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { FaCamera,FaTimes } from "react-icons/fa";
import "../styles/create.css";

const CreateQuestion = ({ selectedCourse }) => {
  const [questionText, setQuestionText] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [userCourses, setUserCourses] = useState([]);
  const [localSelectedCourse, setLocalSelectedCourse] = useState(""); // Controls modal visibility
  
  useEffect(() => {
    const fetchCourses = async () => {
      if (!auth.currentUser) return;
      const userSnap = await getDoc(doc(db, "users", auth.currentUser.uid));
      if (userSnap.exists()) {
        setUserCourses(userSnap.data().enrolledCourses || []);
      }
    };
    if (isOpen) fetchCourses(); // Fetch only when modal opens
  }, [isOpen]);

  const toggleModal = () => setIsOpen(!isOpen);

  const handleSubmit = async () => {
    if (!questionText || !localSelectedCourse) {
      alert("Please select a subject and write your question.");
      return;
    }

    try {
      await addDoc(collection(db, "questions"), {
        text: questionText,
        courseCode: localSelectedCourse,
        createdAt: serverTimestamp(),
        userId: auth.currentUser.uid,
      });

      setQuestionText("");
      setLocalSelectedCourse("");
      setIsOpen(false);
      alert("Question posted!");
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };


  return (
    <>
      <button className="fab-button" onClick={toggleModal}>
        +
      </button> 
      {isOpen && (
        <div className="modal-overlay" onClick={toggleModal}>
     
          <div className="modal-content card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ color: "var(--accent-color)", margin: 0 }}>Ask Question</h2>
              <button className="close-modal" onClick={toggleModal}>
                <FaTimes />
              </button>
            </div>

            <select 
              className="modal-select"
              value={localSelectedCourse}
              onChange={(e) => setLocalSelectedCourse(e.target.value)}

            >
              <option value="">Select Subject</option>
              {userCourses.map((course) => (
                <option key={course.code} value={course.code}>{course.code} - {course.name}</option>
              ))}
            </select> 

            <textarea
              className="textarea-fixed"
              placeholder="Ask your question..."
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
            />

            {selectedCourse && (
              <p style={{ marginTop: "10px", fontWeight: "bold", fontSize: "0.9rem" }}>
                Posting under: <span style={{ color: "var(--accent-color)" }}>{selectedCourse}</span>
              </p>
            )}

            <div
              style={{
                marginTop: "15px",
                padding: "10px",
                border: "1px dashed gray",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                cursor: "pointer",
                borderRadius: "8px"
              }}
              onClick={() => alert("Image upload coming soon!")}
            >
              <FaCamera />
              <span>Add Image</span>
            </div>

            <button
              className="create-post-btn"
              style={{ 
                marginTop: "20px", 
                width: "100%", 
                padding: "12px",
                borderRadius: "10px",
                background: "var(--accent-color)",
                color: "white",
                border: "none",
                cursor: "pointer",
                fontWeight: "bold"
              }}
              onClick={handleSubmit}
            >
              Post Question
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateQuestion;
