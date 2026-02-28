import "../styles/style.css";
import { auth, db, googleProvider } from "../firebase";
import { signInWithPopup, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { degreeData } from "../data/degreeData";

const Signup = () => {
  const [loading, setLoading] = useState(false);
  const [gender, setGender] = useState("");
  const [degree, setDegree] = useState("");
  const [semester, setSemester] = useState("");
  const [branch, setBranch] = useState("");
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const signupWithGoogle = async () => {
    try {
      if (!gender || !degree || !branch || !semester || !username) {
        alert("Please complete all fields before signing up.");
        return;
      }

      setLoading(true);

      googleProvider.setCustomParameters({
        prompt: "select_account",
      });

      await signOut(auth);

      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      if (!user.email.endsWith("@sastra.ac.in")) {
        alert("Only @sastra.ac.in accounts are allowed.");
        await signOut(auth);
        return;
      }

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        alert("Account already exists. Please login.");
        navigate("/login");
        return;
      }

      // 🔥 CHECK USERNAME UNIQUENESS
      const cleanUsername = username.trim().toLowerCase();
      const usernameRef = doc(db, "usernames", cleanUsername);
      const usernameSnap = await getDoc(usernameRef);

      if (usernameSnap.exists()) {
        alert("Username already taken. Please choose another.");
        await signOut(auth);
        return;
      }

      const semesterCourses =
        degreeData[degree].branches[branch].semesters[semester];

      // 🔥 CREATE USER DOCUMENT
      await setDoc(userRef, {
        name: user.displayName,
        email: user.email,
        username: cleanUsername,
        gender,
        degree,
        branch,
        semester,
        enrolledCourses: semesterCourses.map((course) => ({
          code: course.code,
          name: course.name,
          credits: 0,
        })),
        createdAt: new Date(),
      });

      // 🔥 RESERVE USERNAME
      await setDoc(usernameRef, {
        uid: user.uid,
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

  return (
    <div className="login-container">
      <h2 className="login-title">SASTRA Student Signup</h2>

      {/* Gender */}
      <div className="form-group">
        <label className="form-label">Gender</label>
        <select
          className="form-select"
          value={gender}
          onChange={(e) => setGender(e.target.value)}
        >
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
      </div>

      {/* Degree */}
      <div className="form-group">
        <label className="form-label">Degree</label>
        <select
          className="form-select"
          value={degree}
          onChange={(e) => {
            setDegree(e.target.value);
            setSemester("");
            setBranch("");
          }}
        >
          <option value="">Select Degree</option>
          {Object.keys(degreeData).map((deg) => (
            <option key={deg} value={deg}>
              {deg}
            </option>
          ))}
        </select>
      </div>

      {/* Branch */}
      {degree && (
        <div className="form-group">
          <label className="form-label">Branch</label>
          <select
            className="form-select"
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
          >
            <option value="">Select Branch</option>
            {Object.keys(degreeData[degree].branches).map((br) => (
              <option key={br} value={br}>
                {br}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Semester */}
      {degree && branch && (
        <div className="form-group">
          <label className="form-label">Semester</label>
          <select
            className="form-select"
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
          >
            <option value="">Select Semester</option>
            {Object.keys(
              degreeData[degree].branches[branch].semesters
            ).map((sem) => (
              <option key={sem} value={sem}>
                Semester {sem}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Username */}
      <div className="form-group">
        <label className="form-label">Username</label>
        <input
          type="text"
          className="form-select"
          placeholder="Choose a username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

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