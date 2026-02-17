import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  updateDoc,
  doc,
  addDoc
} from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import "../styles/travel.css";

function TravelHistory() {
  const [requests, setRequests] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const navigate = useNavigate();

  // 🔹 Listen to Join Requests
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "joinRequests"),
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setRequests(data);
      }
    );

    return () => unsubscribe();
  }, []);

  // 🔹 Listen to Ratings
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "ratings"),
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setRatings(data);
      }
    );

    return () => unsubscribe();
  }, []);

  // 🔹 Accept / Reject
  const handleAccept = async (id) => {
    await updateDoc(doc(db, "joinRequests", id), {
      status: "accepted"
    });
  };

  const handleReject = async (id) => {
    await updateDoc(doc(db, "joinRequests", id), {
      status: "rejected"
    });
  };

  const openChat = (requestId) => {
    navigate(`/chat/${requestId}`);
  };

  // 🔹 Submit Rating
  const submitRating = async () => {
    await addDoc(collection(db, "ratings"), {
      requestId: selectedRequest.id,
      postDestination: selectedRequest.postDestination,
      rating: Number(rating),
      comment,
      ratedUserId: selectedRequest.postOwnerId
    });

    alert("Rating submitted!");

    setSelectedRequest(null);
    setComment("");
    setRating(5);
  };

  // 🔹 Calculate Average Rating
  const getAverageRating = (userId) => {
    const userRatings = ratings.filter(
      r => r.ratedUserId === userId
    );

    if (userRatings.length === 0) return "No ratings";

    const total = userRatings.reduce(
      (sum, r) => sum + r.rating,
      0
    );

    return (total / userRatings.length).toFixed(1);
  };

  return (
    <div className="travel-container">
      {/*<nav className="sub-nav">
        <Link to="/travelbuddy" className="nav-btn">🏠</Link>
        <Link to="/history" className="nav-btn">📜</Link>
        <Link to="/profile/testUser" className="nav-btn">👤</Link>
      </nav>*/}

      <h1 className="page-title">Travel Requests</h1>

      <div className="posts-list">
        {requests.map(request => (
          <div key={request.id} className="travel-card">
            <div className="card-header">
              <h3 className="destination-title">{request.postDestination}</h3>
              <span className={`status-badge ${request.status}`}>{request.status}</span>
            </div>
            
            <p className="rating-badge">⭐ {getAverageRating(request.postOwnerId)}</p>

            <div className="card-footer">
              {request.status === "pending" && (
                <div style={{ display: "flex", gap: "10px" }}>
                  <button className="action-btn" onClick={() => handleAccept(request.id)}>Accept</button>
                  <button className="action-btn secondary-btn" onClick={() => handleReject(request.id)}>Reject</button>
                </div>
              )}
              {request.status === "accepted" && (
                <div style={{ display: "flex", gap: "10px" }}>
                  <button className="action-btn" onClick={() => navigate(`/chat/${request.id}`)}>Chat</button>
                  <button className="action-btn secondary-btn" onClick={() => setSelectedRequest(request)}>Rate</button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedRequest && (
        <div className="modal-overlay">
          <div className="travel-card" style={{ width: "90%", maxWidth: "400px" }}>
            <h3>Rate Companion</h3>
            <select className="custom-search-input" value={rating} onChange={(e) => setRating(e.target.value)}>
              <option value="5">5 ⭐⭐⭐⭐⭐</option>
              <option value="4">4 ⭐⭐⭐⭐</option>
              <option value="3">3 ⭐⭐⭐</option>
              <option value="2">2 ⭐⭐</option>
              <option value="1">1 ⭐</option>
            </select>
            <textarea 
              className="custom-search-input" 
              style={{ marginTop: "15px", height: "100px", borderRadius: "15px" }}
              placeholder="Your comment..." 
              value={comment} 
              onChange={(e) => setComment(e.target.value)} 
            />
            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <button className="action-btn" onClick={submitRating}>Submit</button>
              <button className="action-btn secondary-btn" onClick={() => setSelectedRequest(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TravelHistory;
