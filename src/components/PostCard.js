import { 
  addDoc, 
  collection, 
  query, 
  where, 
  onSnapshot, 
  deleteDoc, 
  doc, 
  getDoc 
} from "firebase/firestore";
import { db } from "../firebase";
import { auth } from "../firebase";
import "../styles/travel.css";
import { useEffect, useState } from "react";
import { IoFemaleSharp ,IoMaleSharp} from "react-icons/io5";
import { CgCalendarDates } from "react-icons/cg";

function PostCard({ post, averageRating }) {
  // 🔥 EXISTING STATE
  const [posterGender, setPosterGender] = useState(null);
  
  // 🔥 NEW STATE for request tracking
  const [existingRequest, setExistingRequest] = useState(null);

  // 1️⃣ Determine if the logged-in user is the one who created this post
  const isMyPost = auth.currentUser?.uid === post.userId;

  // 🔥 EXISTING EFFECT: Fetch gender
  useEffect(() => {
    const fetchGender = async () => {
      if (!post.userId) return;
      try {
        const userRef = doc(db, "users", post.userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setPosterGender(userSnap.data().gender);
        }
      } catch (error) {
        console.log("Error fetching gender:", error);
      }
    };
    fetchGender();
  }, [post.userId]);

  // 🔥 NEW EFFECT: Check if user already requested this post
  useEffect(() => {
    if (!auth.currentUser || !post.id) return;

    const q = query(
      collection(db, "joinRequests"),
      where("postId", "==", post.id),
      where("requesterId", "==", auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setExistingRequest({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
      } else {
        setExistingRequest(null);
      }
    });

    return () => unsubscribe();
  }, [post.id]);

  // 🔥 NEW LOGIC: Handle Revoke
  const handleRevoke = async () => {
    if (window.confirm("Do you want to revoke your request?")) {
      await deleteDoc(doc(db, "joinRequests", existingRequest.id));
      alert("Request revoked.");
    }
  };

  // 🔥 UPDATED LOGIC: Handle Request (with safety check)
  const handleRequest = async () => {
    if (!auth.currentUser) {
      alert("User not logged in");
      return;
    }

    if (isMyPost) {
      alert("You cannot request to join your own post.");
      return;
    }

    await addDoc(collection(db, "joinRequests"), {
      postId: post.id,
      postDate: post.date,
      postDestination: post.destination,
      postOwnerId: post.userId,
      requesterId: auth.currentUser.uid,
      status: "pending"
    });

    alert("Request Sent!");
  };

  return (
    <div className="travel-card">
      <div className="card-header">
        <h3 className="destination-title">{post.destination}</h3>
        <span className="travel-date"><CgCalendarDates className="postcard-icon" /> {post.date}</span>
      </div>

      <p className="description-text">{post.description}</p>

      <div className="rating-badge">
        <p><strong>User:</strong> {post.userId}</p>
        <p>
          <strong>Gender:</strong>{" "}
          {posterGender
            ? posterGender === "male"
              ? <><IoMaleSharp className="postcard-icon" />Male</>
              : <><IoFemaleSharp className="postcard-icon" />Female</>
            : "Loading..."}
        </p>
        <p>
          ⭐ {averageRating ? `${averageRating} / 5` : "No ratings yet"}
        </p>
      </div>

      {/* 2️⃣ LOGIC: Handle Button Display based on Ownership and Request Status */}
      {isMyPost ? (
        <div className="owner-status" style={{ 
          marginTop: "10px", 
          color: "#aaa", 
          fontSize: "0.9rem", 
          fontStyle: "italic" 
        }}>
          ✨ This is your journey
        </div>
      ) : existingRequest ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "10px" }}>
          <button className="action-btn" style={{ background: "#6c757d" }} disabled>
            Requested ({existingRequest.status})
          </button>
          <button className="action-btn secondary-btn" onClick={handleRevoke}>
            Revoke Request
          </button>
        </div>
      ) : (
        <button className="action-btn" onClick={handleRequest}>
          Request to Join
        </button>
      )}
    </div>
  );
}

export default PostCard;