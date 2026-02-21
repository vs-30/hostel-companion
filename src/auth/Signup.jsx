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

  const signupWithGoogle = async () => {
    try {
      if (!gender) {
      alert("Please select your gender before signing up.");
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

      // ✅ Create new student record
      await setDoc(userRef, {
  name: user.displayName,
  email: user.email,
  gender: gender,   // 🔥 ADD THIS
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
      <h2>SASTRA Student Signup</h2>
      <div style={{ marginBottom: "15px" }}>
  <label>Select Gender</label>
  <select
    value={gender}
    onChange={(e) => setGender(e.target.value)}
    style={{
      width: "100%",
      padding: "10px",
      marginTop: "5px",
      borderRadius: "8px"
    }}
  >
    <option value="">-- Select Gender --</option>
    <option value="male">Male</option>
    <option value="female">Female</option>
  </select>
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
        <Link to="/" style={{ color: "#1a73e8" }}>
          Login here
        </Link>
      </p>
    </div>
  );
};

export default Signup;
