import { useState, useEffect } from "react";
import "./styles/Profile.css";
import { auth, db } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [userRef, setUserRef] = useState(null);

  const [form, setForm] = useState({
    name: "",
    gender: "",
    degree: "",
    year: "",
    branch: "",
  });

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
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }

      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);

      setUserRef(ref);

      const googleName = user.displayName || "";

      if (snap.exists()) {
        const data = snap.data();
        setForm({
          name: googleName,  // Always from Google
          gender: data.gender || "",
          degree: data.degree || "",
          year: data.year || "",
          branch: data.branch || "",
        });
      } else {
        setForm({
          name: googleName,
          gender: "",
          degree: "",
          year: "",
          branch: "",
        });
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "degree") {
      setForm((prev) => ({
        ...prev,
        degree: value,
        year: "",
        branch: ""
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!userRef) return;

    setSaving(true);
    setMessage("");

    try {
      await setDoc(userRef, {
        gender: form.gender,
        degree: form.degree,
        year: form.year,
        branch: form.branch,
        updatedAt: new Date(),
      }, { merge: true });

      setMessage("Profile updated successfully.");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error(err);
      setMessage("Error updating profile.");
    }

    setSaving(false);
  };

  if (loading) return <div>Loading profile...</div>;

  return (
    <div className="settings-container">
      <h2>My Profile</h2>

      <form onSubmit={handleSave} className="settings-form">

        {/* Name (Auto from Google) */}
        <label>
          Name
          <input value={form.name} disabled />
        </label>

        {/* Gender */}
        <label>
          Gender
          <select name="gender" value={form.gender} onChange={handleChange}>
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </label>

        {/* Degree */}
        <label>
          Degree
          <select name="degree" value={form.degree} onChange={handleChange}>
            <option value="">Select Degree</option>
            {Object.keys(degreeData).map((deg) => (
              <option key={deg} value={deg}>{deg}</option>
            ))}
          </select>
        </label>

        {/* Year */}
        {form.degree && (
          <label>
            Year
            <select name="year" value={form.year} onChange={handleChange}>
              <option value="">Select Year</option>
              {degreeData[form.degree].years.map((yr) => (
                <option key={yr} value={yr}>{yr}</option>
              ))}
            </select>
          </label>
        )}

        {/* Branch */}
        {form.degree && (
          <label>
            Branch
            <select name="branch" value={form.branch} onChange={handleChange}>
              <option value="">Select Branch</option>
              {degreeData[form.degree].branches.map((br) => (
                <option key={br} value={br}>{br}</option>
              ))}
            </select>
          </label>
        )}

        <button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Update Profile"}
        </button>

        {message && <p className="success-message">{message}</p>}
      </form>
    </div>
  );
};

export default Profile;