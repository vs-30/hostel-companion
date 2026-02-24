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
  const [year, setYear] = useState("");
  const [branch, setBranch] = useState("");
  const navigate = useNavigate();

  const signupWithGoogle = async () => {
    try {
      if (!gender || !degree || !year || !branch) {
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

      await setDoc(userRef, {
        name: user.displayName,
        email: user.email,
        gender,
        degree,
        year,
        branch,
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
          <label className="form-label">Year</label>
          <select
            className="form-select"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          >
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
          <select
            className="form-select"
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
          >
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