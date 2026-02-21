import { addDoc, collection } from "firebase/firestore";
import { db } from "../firebase";
import { auth } from "../firebase";
import "../styles/travel.css";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";

function PostCard({ post, averageRating }) {

  // 🔥 NEW STATE for poster gender
  const [posterGender, setPosterGender] = useState(null);

  // 🔥 FETCH gender from users collection
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


  const handleRequest = async () => {

    console.log("Current User:", auth.currentUser);

    if (!auth.currentUser) {
      alert("User not logged in");
      return;
    }

    await addDoc(collection(db, "joinRequests"), {
      postId: post.id,
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
        <span className="travel-date">📅 {post.date}</span>
      </div>

      <p className="description-text">{post.description}</p>

      <div className="rating-badge">
        <p><strong>User:</strong> {post.userId}</p>

        {/* 🔥 ADDED GENDER DISPLAY */}
        <p>
          <strong>Gender:</strong>{" "}
          {posterGender
            ? posterGender === "male"
              ? "👨 Male"
              : "👩 Female"
            : "Loading..."}
        </p>

        <p>
          ⭐ {averageRating ? `${averageRating} / 5` : "No ratings yet"}
        </p>
      </div>

      <button className="action-btn" onClick={handleRequest}>
        Request to Join
      </button>
    </div>
  );
}

export default PostCard;