import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../firebase";
import { FaCamera } from "react-icons/fa";
import { degreeData } from "../data/degreeData";

const CreateQuestion = () => {
  const [questionText, setQuestionText] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [visibleToYears, setVisibleToYears] = useState([]);
  const [degree, setDegree] = useState("");
  const [year, setYear] = useState("");
  const [branch, setBranch] = useState("");
  const handleSubmit = async () => {
    if (!questionText || !courseCode) {
      alert("Fill required fields");
      return;
    }

    await addDoc(collection(db, "questions"), {
  text: questionText,
  courseCode: courseCode,
  degree: degree,
  year: year,
  branch: branch,
  createdAt: serverTimestamp(),
  userId: auth.currentUser.uid
});

    setQuestionText("");
    setCourseCode("");
    setVisibleToYears([]);
    alert("Question posted!");
  };

  return (
    <div className="card">
      <textarea
        placeholder="Ask your question..."
        value={questionText}
        onChange={(e) => setQuestionText(e.target.value)}
      />

      <input
        type="text"
        placeholder="Enter Course Code"
        value={courseCode}
        onChange={(e) => setCourseCode(e.target.value)}
      />

      {/* Degree */}
<div className="form-group">
  <label>Degree</label>
  <select
    value={degree}
    onChange={(e) => {
      setDegree(e.target.value);
      setYear("");
      setBranch("");
    }}
  >
    <option value="">Select Degree</option>
    {Object.keys(degreeData).map((deg) => (
      <option key={deg} value={deg}>{deg}</option>
    ))}
  </select>
</div>

{/* Year */}
{degree && (
  <div className="form-group">
    <label>Year</label>
    <select value={year} onChange={(e) => setYear(e.target.value)}>
      <option value="">Select Year</option>
      {degreeData[degree].years.map((yr) => (
        <option key={yr} value={yr}>{yr}</option>
      ))}
    </select>
  </div>
)}

{/* Branch */}
{degree && (
  <div className="form-group">
    <label>Branch</label>
    <select value={branch} onChange={(e) => setBranch(e.target.value)}>
      <option value="">Select Branch</option>
      {degreeData[degree].branches.map((br) => (
        <option key={br} value={br}>{br}</option>
      ))}
    </select>
  </div>
)}

      {/* Camera UI only */}
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