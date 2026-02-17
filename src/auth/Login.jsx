import "../styles/style.css";
import { auth, db, googleProvider } from "../firebase";
import { signInWithPopup, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const loginWithGoogle = async () => {
    try {
      setLoading(true);

      // 🔑 Always show account chooser
      googleProvider.setCustomParameters({
        prompt: "select_account",
      });

      // Optional: clear previous session
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

      // 🚫 Not registered → go to signup
      if (!userSnap.exists()) {
        alert("You are not registered. Redirecting to signup.");
        navigate("/signup");
        return;
      }

      // ✅ Registered → enter app
      navigate("/");

    } catch (err) {
      console.error(err)
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>SASTRA Student Login</h2>
      <button
          className="google-btn"
          onClick={loginWithGoogle}
          disabled={loading}
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google logo"
            className="google-logo"
          />
          <span>Login with Google</span>
        </button>

      <p style={{ marginTop: "15px" }}>
        New user?{" "}
        <Link to="/signup" style={{ color: "#1a73e8" }}>
          Sign up here
        </Link>
      </p>
    </div>
  );
};

export default Login;
