import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../firebase";
import "../styles/travel.css";

function CreatePost() {
  const [isOpen, setIsOpen] = useState(false);
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "travelPosts"), {
        destination,
        date,
        description,
        userId: auth.currentUser?.uid || "user123",
        createdAt: serverTimestamp(),
      });

      alert("Journey shared successfully!");
      setDestination("");
      setDate("");
      setDescription("");
      setIsOpen(false); // Close modal after success
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  return (
    <>
      {/* ➕ Floating Action Button (FAB) */}
      <button 
        className="fab-button" 
        onClick={() => setIsOpen(true)}
        title="Create New Journey"
      >
        +
      </button>

      {/* 🖥️ Modal Overlay */}
      {isOpen && (
        <div className="modal-overlay" onClick={() => setIsOpen(false)}>
          <div 
            className="travel-card modal-content" 
            onClick={(e) => e.stopPropagation()} // Prevents closing when clicking inside form
          >
            <div className="modal-header">
              <h2 className="destination-title">Plan New Journey</h2>
              <button className="close-modal" onClick={() => setIsOpen(false)}>&times;</button>
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
                <label className="input-label">Journey Details</label>
                <textarea
                  className="custom-search-input textarea-fixed"
                  placeholder="Train details or requirements..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="action-btn">Create Post</button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default CreatePost;