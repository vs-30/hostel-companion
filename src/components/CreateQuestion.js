import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../firebase";
import { FaCamera } from "react-icons/fa";

const CreateQuestion = ({ selectedCourse }) => {
  const [questionText, setQuestionText] = useState("");

  const handleSubmit = async () => {
    if (!questionText || !selectedCourse) {
      alert("Please select a subject and write your question.");
      return;
    }

    await addDoc(collection(db, "questions"), {
      text: questionText,
      courseCode: selectedCourse.split(" - ")[0].trim(), // 🔥 Only this matters now
      createdAt: serverTimestamp(),
      userId: auth.currentUser.uid
    });

    setQuestionText("");
    alert("Question posted!");
  };

  return (
    <div className="card">
      <textarea
        placeholder="Ask your question..."
        value={questionText}
        onChange={(e) => setQuestionText(e.target.value)}
      />

      {/* Show Selected Subject */}
      {selectedCourse && (
        <p style={{ marginTop: "10px", fontWeight: "bold" }}>
          Posting under: {selectedCourse}
        </p>
      )}

      {/* Camera UI (future feature) */}
      <div
        style={{
          marginTop: "15px",
          padding: "10px",
          border: "1px dashed gray",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          cursor: "pointer",
          width: "fit-content"
        }}
        onClick={() => alert("Image upload coming soon!")}
      >
        <FaCamera />
        <span>Add Image (Coming Soon)</span>
      </div>

      <button
        style={{ marginTop: "15px" }}
        onClick={handleSubmit}
      >
        Post Question
      </button>
    </div>
  );
};

export default CreateQuestion;