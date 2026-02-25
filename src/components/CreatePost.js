import { useState, useEffect } from "react";
import { collection, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import "../styles/create.css";

function CreatePost() {
  const [isOpen, setIsOpen] = useState(false);
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [allowedGender, setAllowedGender] = useState("all");
  const [currentUserGender, setCurrentUserGender] = useState(null);

  // 🔥 FETCH LOGGED IN USER GENDER
  useEffect(() => {
    const fetchGender = async () => {
      if (!auth.currentUser) return;

      try {
        const userRef = doc(db, "users", auth.currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setCurrentUserGender(userSnap.data().gender);
        }
      } catch (error) {
        console.error("Error fetching user gender:", error);
      }
    };

    fetchGender();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await addDoc(collection(db, "travelPosts"), {
        destination,
        date,
        description,
        allowedGender,
        userId: auth.currentUser.uid,
        userGender: currentUserGender, // 🔥 STORED HERE
        createdAt: serverTimestamp(),
      });

      alert("Journey shared successfully!");
      setDestination("");
      setDate("");
      setDescription("");
      setIsOpen(false);
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  return (
    <>
      <button
        className="fab-button"
        onClick={() => setIsOpen(true)}
        title="Create New Journey"
      >
        +
      </button>

      {isOpen && (
        <div className="modal-overlay" onClick={() => setIsOpen(false)}>
          <div
            className="travel-card modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2 className="destination-title">Plan New Journey</h2>
              <button
                className="close-modal"
                onClick={() => setIsOpen(false)}
              >
                &times;
              </button>
            </div>

            <form className="create-post-form" onSubmit={handleSubmit}>
              <div className="input-group">
                <label className="input-label">Where to?</label>
                <input
                  className="custom-search-input"
                  type="text"
                  placeholder="e.g. Chennai Central"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">Travel Date</label>
                <input
                  className="custom-search-input"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">Who can join?</label>
                <select
                  className="custom-search-input"
                  value={allowedGender}
                  onChange={(e) => setAllowedGender(e.target.value)}
                >
                  <option value="all">Anyone</option>
                  <option value="male">Only Male</option>
                  <option value="female">Only Female</option>
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Journey Details</label>
                <textarea
                  className="custom-search-input textarea-fixed"
                  placeholder="Train details or requirements..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="action-btn">
                Create Post
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default CreatePost;