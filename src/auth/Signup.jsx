import "../styles/style.css";
import { auth, db, googleProvider } from "../firebase";
import { signInWithPopup, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const Signup = () => {
  const [loading, setLoading] = useState(false);
  const [gender, setGender] = useState(""); 
  const navigate = useNavigate();
  const [degree, setDegree] = useState("");
  const [year, setYear] = useState("");
  const [branch, setBranch] = useState("");

  const signupWithGoogle = async () => {
    try {
      if (!gender || !degree || !year || !branch) {
      alert("Please complete all fields before signing up.");
      return;
    }

      setLoading(true);

      // 🔑 Force account selection every time
      googleProvider.setCustomParameters({
        prompt: "select_account",
      });

      // Clear any previous session
      await signOut(auth);
 
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // 🔒 Domain restriction
      if (!user.email.endsWith("@sastra.ac.in")) {
        alert("Only @sastra.ac.in accounts are allowed.");
        await signOut(auth);
        return;
      }

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      // 🚫 Already registered → redirect to login
      if (userSnap.exists()) {
        alert("Account already exists. Please login.");
        navigate("/login");
        return;
      }

      await setDoc(userRef, {
  name: user.displayName,
  email: user.email,
  gender: gender,
  degree: degree,
  year: year,
  branch: branch,
  createdAt: new Date(),
});
      alert("Signup successful!");
      navigate("/");

    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };
const degreeData = {
  "B.Tech": {
    years: ["1", "2", "3", "4"],
    branches: [
      "Bioengineering",
      "Bioinformatics",
      "Biotechnology",
      "Chemical Engineering",
      "Civil Engineering",
      "Computer Science and Engineering",
      "Computer Science and Engineering (Artificial Intelligence & Data Science)",
      "Computer Science and Engineering (Cyber Security & Blockchain Technology)",
      "Computer Science and Engineering (IoT & Automation)",
      "Computer Science and Engineering (Networks)",
      "Information and Communication Technology",
      "Information Technology",
      "Electrical and Electronics Engineering",
      "Electrical and Electronics Engineering(Smart Grid and Electric Vehicles)",
      "Electronics and Communication Engineering",
      "Electronics and Communication Engineering(Cyber Physical Systems)",
      "Electronics & Instrumentation Engineering",
      "Robotics & Artificial Intelligence",
      "Electronics Enginerring(VLSI Design&Technology)",
      "Aerospace Engineering",
      "Mechanical Engineering",
      "Mechanical Engineering(Digital Manufacturing)",
      "Mechatronics"
    ]
  },
  "M.Tech": {
    years: ["1", "2"],
    branches: [
      "Aerospace Enginerring",
      "Digital Manufacturing",
      "Artificial Intelligence and Data Science",
      "Computer Science and Engineering",
      "Cyber Security",
      "VLSI",
      "Artificial Intelligence & Robotics",
      "Power & Energy Systems",
      "Wireless Smart Communication",
      "Big Data Biology",
      "Indusrial Biotechnology",
      "Medical Nanotechnology",
      "Structural Engineering"
    ]
  },
  "M.Tech 5-year Integrated": {
    years: ["1", "2"],
    branches: [
      "Integrated Biotechnology",
      "Integrated Medical Nanotechnology",
    ]
  },
  "M.Sc": {
    years: ["1", "2"],
    branches: [
      "Biotechnology",
      "Bioinformatics",
      "Chemistry",
      "Physics",
      "Data Science",
    ]
  },
  "MBA": {
    years: ["1", "2"],
    branches: ["Management"]
  },
  "MCA": {
    years: ["1", "2"],
    branches: ["Computer Applications"]
  },
  "BFA": {
    years: ["1", "2", "3", "4"],
    branches: [
      "Music",
      "Bharatanatyam",
    ]
  },
  "MFA": {
    years: ["1", "2"],
    branches: [ "Bharatanatyam" ]
  },
  "MA": {
    years: ["1", "2"],
    branches: [
      "Divyaprabandhandam",
      "Sanskrit",
    ]
  },
  "MA (5 Year Integrated)": {
    years: ["1", "2", "3", "4", "5"],
    branches: [
      "Sanskrit",
    ]
  },
  "B. Optom": {
    years: ["1", "2", "3", "4"],
    branches: ["B.Optom [Collaboration with Elite School of Optometry, Sankara Nethralaya, Chennai]"]
  },
  "M. Optom": {
    years: ["1", "2"],
    branches: ["M.Optom [Collaboration with Elite School of Optometry, Sankara Nethralaya, Chennai]"]
  },
  "Law (5 Year Integrated)": {
    years: ["1", "2", "3", "4", "5"],
    branches: [
      "BA LLB [2022-27] / [2023-28] / [2024-29]",
      "BBA LLB [2022-27] / [2023-28] / [2024-29]",
      "B.Com LLB [2022-27] / [2023-28] / [2024-29]"
    ]
  },
  "M. Sc (5 Year Integrated)": {
    years: ["1", "2", "3", "4", "5"],
    branches: [
      "Integrated Biotechnology",
      "Integtrated Physics",
      "Integrated Chemistry",
      "Integrated Mathematics",
      "Integrated Mathematics and Computing",
      "Integrated Data Science"
    ]
  },
  "B.Ed. (Integrated)": {
    years: ["1", "2", "3", "4"],
    branches: [
      "Physics",
      "Maths",
      "English"
    ]
  },
};
  return (
    <div className="login-container">
      <h2 className="login-title">SASTRA Student Signup</h2>
      <div className="form-group">
        <label className="form-label">Gender</label>
        <select className="form-select" value={gender} onChange={(e) => setGender(e.target.value)}>
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
      </div>
    {/* Degree */}
    <div className="form-group">
      <label className="form-label">Degree</label>
      <select className="form-select" value={degree} onChange={(e) => {setDegree(e.target.value); setYear(""); setBranch("");}}>
        <option value="">Select Degree</option>
        {Object.keys(degreeData).map((deg) => (
          <option key={deg} value={deg}>{deg}</option>
        ))}
      </select>
    </div>
    {/* Study Year */}
    {degree && (
      <div className="form-group">
        <label className="form-label">Year</label>
        <select className="form-select" value={year} onChange={(e) => setYear(e.target.value)}>
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
        <label className="form-label">Branch</label>
        <select className="form-select" value={branch} onChange={(e) => setBranch(e.target.value)}>
        <option value="">Select Branch</option>
        {degreeData[degree].branches.map((br) => (
        <option key={br} value={br}>{br}</option>
        ))}
    </select>
  </div>
      )}
      <button
          className="google-btn"
          onClick={signupWithGoogle}
          disabled={loading}
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google logo"
            className="google-logo"
          />
          <span>Signup with Google</span>
        </button>

      <p style={{ marginTop: "15px" }}>
        Already registered?{" "}
        <Link to="/login" style={{ color: "#1a73e8" }}>
          Login here
        </Link>
      </p>
    </div>
  );
};

export default Signup;
