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
import { auth } from "../firebase";
import "../styles/travel.css";

function TravelHistory() {
  const [requests, setRequests] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const navigate = useNavigate();

  // 🔹 Listen to Join Requests (FILTERED)
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "joinRequests"),
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        const filtered = data.filter(
          r =>
            r.postOwnerId === auth.currentUser?.uid ||
            r.requesterId === auth.currentUser?.uid
        );

        setRequests(filtered);
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

  // 🔹 Accept
  const handleAccept = async (id) => {
    await updateDoc(doc(db, "joinRequests", id), {
      status: "accepted"
    });
  };

  // 🔹 Reject
  const handleReject = async (id) => {
    await updateDoc(doc(db, "joinRequests", id), {
      status: "rejected"
    });
  };

  // 🔹 Open Chat
  const openChat = (request) => {
    if (request.status !== "accepted") return;

    const currentUid = auth.currentUser?.uid;

    if (
      currentUid === request.postOwnerId ||
      currentUid === request.requesterId
    ) {
      navigate(`/chat/${request.id}`);
    } else {
      alert("You are not allowed to access this chat.");
    }
  };

  // 🔹 Submit Rating (WITH duplicate prevention)
  const submitRating = async () => {

    const alreadyRated = ratings.find(
      r =>
        r.requestId === selectedRequest.id &&
        r.ratedBy === auth.currentUser?.uid
    );

    if (alreadyRated) {
      alert("You already rated this trip.");
      return;
    }

    await addDoc(collection(db, "ratings"), {
      requestId: selectedRequest.id,
      postDestination: selectedRequest.postDestination,
      rating: Number(rating),
      comment,
      ratedUserId: selectedRequest.postOwnerId,
      ratedBy: auth.currentUser?.uid
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
      <div className="request-top-row">
        <h1 className="travel-page-title">Travel Requests</h1>
      </div>

      <div className="posts-grid">
        {requests.map(request => (
          <div key={request.id} className="travel-card">
            <div className="card-header">
              <h3 className="destination-title">
                {request.postDestination}
              </h3>
              <span className={`status-badge ${request.status}`}>
                {request.status}
              </span>
            </div>

            <p className="rating-badge">
              ⭐ {getAverageRating(request.postOwnerId)}
            </p>

            <div className="card-footer">

              {/* 🔹 POST OWNER CAN ACCEPT */}
              {auth.currentUser?.uid === request.postOwnerId &&
                request.status === "pending" && (
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    className="action-btn"
                    onClick={() => handleAccept(request.id)}
                  >
                    Accept
                  </button>

                  <button
                    className="action-btn secondary-btn"
                    onClick={() => handleReject(request.id)}
                  >
                    Reject
                  </button>
                </div>
              )}

              {/* 🔹 REQUESTER SEES STATUS */}
              {auth.currentUser?.uid === request.requesterId && (
                <p>Status: {request.status}</p>
              )}

              {/* 🔥 OPEN CHAT BUTTON */}
              {request.status === "accepted" &&
                (auth.currentUser?.uid === request.postOwnerId ||
                 auth.currentUser?.uid === request.requesterId) && (
                <button
                  className="action-btn"
                  style={{ marginTop: "10px" }}
                  onClick={() => openChat(request)}
                >
                  Open Chat
                </button>
              )}

              {/* ⭐ RATE BUTTON (Only requester can rate after accepted) */}
              {request.status === "accepted" &&
                auth.currentUser?.uid === request.requesterId && (
                <button
                  className="action-btn secondary-btn"
                  style={{ marginTop: "10px" }}
                  onClick={() => setSelectedRequest(request)}
                >
                  Rate Companion
                </button>
              )}

            </div>
          </div>
        ))}
      </div>

      {/* ⭐ RATING MODAL */}
      {selectedRequest && (
        <div className="modal-overlay">
          <div
            className="travel-card"
            style={{ width: "90%", maxWidth: "400px" }}
          >
            <h3>Rate Companion</h3>

            <select
              className="custom-search-input"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
            >
              <option value="5">5 ⭐⭐⭐⭐⭐</option>
              <option value="4">4 ⭐⭐⭐⭐</option>
              <option value="3">3 ⭐⭐⭐</option>
              <option value="2">2 ⭐⭐</option>
              <option value="1">1 ⭐</option>
            </select>

            <textarea
              className="custom-search-input"
              style={{
                marginTop: "15px",
                height: "100px",
                borderRadius: "15px"
              }}
              placeholder="Your comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />

            <div
              style={{
                display: "flex",
                gap: "10px",
                marginTop: "20px"
              }}
            >
              <button
                className="action-btn"
                onClick={submitRating}
              >
                Submit
              </button>

              <button
                className="action-btn secondary-btn"
                onClick={() => setSelectedRequest(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TravelHistory;
