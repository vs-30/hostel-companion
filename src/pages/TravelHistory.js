import { useEffect, useState } from "react";
import {
  getDoc,
  collection,
  onSnapshot,
  updateDoc,
  doc,
  addDoc
} from "firebase/firestore";
import { db, auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import "../styles/travel.css";
import { CgCalendarDates } from "react-icons/cg";

function TravelHistory() {
  const [requests, setRequests] = useState({
    sent: [],
    received: []
  });

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [usersData, setUsersData] = useState({});
  const navigate = useNavigate();

  // 🔥 LISTEN TO JOIN REQUESTS
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "joinRequests"),
      async (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        const currentUid = auth.currentUser?.uid;

        const filtered = data.filter(
          r =>
            r.postOwnerId === currentUid ||
            r.requesterId === currentUid
        );

        const sent = filtered.filter(
          r => r.requesterId === currentUid
        );

        const received = filtered.filter(
          r => r.postOwnerId === currentUid
        );

        setRequests({ sent, received });

        // 🔥 Fetch all unique user IDs for rating display
        const uniqueUserIds = [
          ...new Set(
            filtered.flatMap(r => [r.postOwnerId, r.requesterId])
          )
        ];

        const tempUsers = {};

        for (let uid of uniqueUserIds) {
          const userSnap = await getDoc(doc(db, "users", uid));
          if (userSnap.exists()) {
            tempUsers[uid] = userSnap.data();
          }
        }

        setUsersData(tempUsers);
      }
    );

    return () => unsubscribe();
  }, []);

  // 🔹 ACCEPT
  const handleAccept = async (id) => {
    await updateDoc(doc(db, "joinRequests", id), {
      status: "accepted"
    });
  };

  // 🔹 REJECT
  const handleReject = async (id) => {
    await updateDoc(doc(db, "joinRequests", id), {
      status: "rejected"
    });
  };

  // 🔹 OPEN CHAT
  const openChat = (request) => {
    if (request.status !== "accepted") return;
    navigate(`/chat/${request.id}`);
  };

  // 🔹 CHECK IF TRIP DATE PASSED
  const canRateTrip = (request) => {
    if (!request.postDate) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [year, month, day] = request.postDate.split("-");
    const tripDate = new Date(year, month - 1, day);

    return today.getTime() > tripDate.getTime();
  };

  // 🔹 SUBMIT RATING
  const submitRating = async () => {
    if (!selectedRequest) return;

    const currentUid = auth.currentUser?.uid;

    const ratedUserId =
      currentUid === selectedRequest.postOwnerId
        ? selectedRequest.requesterId
        : selectedRequest.postOwnerId;

    // Save rating history
    await addDoc(collection(db, "ratings"), {
      requestId: selectedRequest.id,
      rating: Number(rating),
      comment,
      ratedUserId,
      ratedBy: currentUid
    });

    // Update aggregated rating
    const userRef = doc(db, "users", ratedUserId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();

      const oldAvg = userData.averageRating || 0;
      const oldCount = userData.ratingCount || 0;

      const newCount = oldCount + 1;
      const newAvg =
        (oldAvg * oldCount + Number(rating)) / newCount;

      await updateDoc(userRef, {
        averageRating: Number(newAvg.toFixed(1)),
        ratingCount: newCount
      });
    }

    alert("Rating submitted!");
    setSelectedRequest(null);
    setComment("");
    setRating(5);
  };

  // 🔥 CARD RENDER FUNCTION
  const renderCard = (request, isReceived) => {
    const companionId = isReceived
      ? request.requesterId
      : request.postOwnerId;

    return (
      <div key={request.id} className="travel-card">
        <div className="card-header">
          <h3 className="destination-title">
            {request.postDestination}
          </h3>
          <span className={`status-badge ${request.status}`}>
            {request.status}
          </span>
        </div>

        <div className="card-footer">
          <p>{<CgCalendarDates/>} {request.postDate || "Not specified"}</p>
          <strong style={{color:"var(--accent-color)"}}>{isReceived ? "Requested By: " : "Requested To:"} </strong>
          <p>Companion id : {companionId}</p>

          <p> Rating :{" "}
            {usersData[companionId]?.averageRating ? (
              <>
              {usersData[companionId].averageRating} ⭐{" "}
              ({usersData[companionId].ratingCount || 0})
              </>
              ) : (
                "No ratings yet"
          )}
          </p>

          {/* ACCEPT / REJECT */}
          {isReceived && request.status === "pending" && (
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

          {/* STATUS */}
          {!isReceived && <p>Status: {request.status}</p>}

          {/* OPEN CHAT */}
          {request.status === "accepted" && (
            <button
              className="action-btn"
              style={{ marginTop: "10px" }}
              onClick={() => openChat(request)}
            >
              Open Chat
            </button>
          )}

          {/* RATE BUTTON */}
          {!isReceived && request.status === "accepted" &&
            canRateTrip(request) && (
              <button
                className="action-btn secondary-btn"
                style={{ marginTop: "10px" }}
                onClick={() => setSelectedRequest(request)}
              >
                Rate Companion
              </button>
            )}

          {!isReceived && request.status === "accepted" &&
            !canRateTrip(request) && (
              <p
                style={{
                  marginTop: "10px",
                  fontSize: "14px",
                  color: "#888"
                }}
              >
                Rating available after travel date.
              </p>
            )}
        </div>
      </div>
    );
  };

  return (
    <div className="travel-container">
      <h1 className="travel-page-title">
        Travel Requests
      </h1>

      {/* RECEIVED */}
      <h2 style={{ marginTop: "20px",color:"var(--text-main)"}}>
        Requests Received
      </h2>
      <div className="posts-grid">
        {requests.received.map(r =>
          renderCard(r, true)
        )}
      </div>

      {/* SENT */}
      <h2 style={{ marginTop: "40px" ,color:"var(--text-main)"}}>
        Requests Sent
      </h2>
      <div className="posts-grid">
        {requests.sent.map(r =>
          renderCard(r, false)
        )}
      </div>

      {/* ⭐ RATING MODAL */}
      {selectedRequest && (
        <div className="modal-overlay">
          <div
            className="travel-card"
            style={{
              width: "90%",
              maxWidth: "400px"
            }}
          >
            <h3>Rate Companion</h3>

            <select
              className="custom-search-input"
              value={rating}
              onChange={(e) =>
                setRating(e.target.value)
              }
            >
              <option value="5">
                5 ⭐⭐⭐⭐⭐
              </option>
              <option value="4">
                4 ⭐⭐⭐⭐
              </option>
              <option value="3">
                3 ⭐⭐⭐
              </option>
              <option value="2">
                2 ⭐⭐
              </option>
              <option value="1">
                1 ⭐
              </option>
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
              onChange={(e) =>
                setComment(e.target.value)
              }
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
                onClick={() =>
                  setSelectedRequest(null)
                }
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