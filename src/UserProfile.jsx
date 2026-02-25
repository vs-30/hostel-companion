import { useState, useEffect } from "react";
import "./styles/Profile.css";
import { auth, db } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { degreeData } from "./data/degreeData"; // <-- import from separate file

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [userRef, setUserRef] = useState(null);

  const [form, setForm] = useState({
    name: "",
    gender: "",
    degree: "",
    semester: "",
    branch: "",
  });

  const [subjects, setSubjects] = useState([]);

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
          name: googleName,
          gender: data.gender || "",
          degree: data.degree || "",
          semester: data.semester || "",
          branch: data.branch || "",
        });
      } else {
        setForm({
          name: googleName,
          gender: "",
          degree: "",
          semester: "",
          branch: "",
        });
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 🔥 Update subjects when degree / branch / semester changes
  useEffect(() => {
    if (!form.degree || !form.branch || !form.semester) {
      setSubjects([]);
      return;
    }

    const degree = degreeData[form.degree];
    if (!degree) return;

    let semesterSubjects = [];

    // Add COMMON subjects (B.Tech Sem 1 & 2)
    if (
      form.degree === "B.Tech" &&
      degree.branches["COMMON"]?.semesters[form.semester]
    ) {
      semesterSubjects = [
        ...degree.branches["COMMON"].semesters[form.semester],
      ];
    }

    // Add branch-specific subjects
    const branchData = degree.branches[form.branch];
    if (branchData?.semesters[form.semester]) {
      semesterSubjects = [
        ...semesterSubjects,
        ...branchData.semesters[form.semester],
      ];
    }

    setSubjects(semesterSubjects);
  }, [form.degree, form.branch, form.semester]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "degree") {
      setForm({
        ...form,
        degree: value,
        semester: "",
        branch: "",
      });
    } else {
      setForm({
        ...form,
        [name]: value,
      });
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!userRef) return;

    setSaving(true);
    setMessage("");

    try {
      await setDoc(
        userRef,
        {
          gender: form.gender,
          degree: form.degree,
          semester: form.semester,
          branch: form.branch,
          updatedAt: new Date(),
        },
        { merge: true }
      );

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

        {/* Name */}
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

        {/* Branch */}
        {form.degree && (
          <label>
            Branch
            <select name="branch" value={form.branch} onChange={handleChange}>
              <option value="">Select Branch</option>
              {Object.keys(degreeData[form.degree].branches)
                .filter((b) => b !== "COMMON")
                .map((br) => (
                  <option key={br} value={br}>{br}</option>
                ))}
            </select>
          </label>
        )}

        {/* Semester */}
        {form.degree && (
          <label>
            Semester
            <select name="semester" value={form.semester} onChange={handleChange}>
              <option value="">Select Semester</option>
              {degreeData[form.degree].semesters.map((sem) => (
                <option key={sem} value={sem}>
                  Semester {sem}
                </option>
              ))}
            </select>
          </label>
        )}
        {subjects.length > 0 && (
        <div className="subjects-container">
         {/*<h3>Subjects{form.semester}</h3>*/}
         <label> Subjects
          <ul className="subjects-display">
            {subjects.map((sub, index) => (
              <li key={index}>
                <strong>{sub.code}</strong> – {sub.name}
              </li>
            ))}
          </ul>
          </label>
        </div>
      )}

        <button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Update Profile"}
        </button>

        {message && <p className="success-message">{message}</p>}
      </form>

      {/* 🔥 SUBJECT DISPLAY (NON EDITABLE) */}
      
    </div>
  );
};

export default Profile;