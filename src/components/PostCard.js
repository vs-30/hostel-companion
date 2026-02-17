import { addDoc, collection } from "firebase/firestore";
import { db } from "../firebase";
import "../styles/travel.css";

function PostCard({ post, averageRating }) {

  const handleRequest = async () => {

    console.log("FULL POST OBJECT:", post);
    console.log("post.userId:", post.userId);

    if (!post.userId) {
      alert("Post owner not found. Create a new post after adding userId.");
      return;
    }

    await addDoc(collection(db, "joinRequests"), {
      postId: post.id,
      postDestination: post.destination,
      postOwnerId: post.userId,
      status: "pending"
    });

    alert("Request Sent!");
  };

  return (
    // ... inside return
<div className="travel-card">
  <div className="card-header">
    <h3 className="destination-title">{post.destination}</h3>
    <span className="travel-date">📅 {post.date}</span>
  </div>
  <p className="description-text">{post.description}</p>
  <div className="rating-badge">⭐ {averageRating || "New User"}</div>
  <button className="action-btn" onClick={handleRequest}>Request to Join</button>
</div>
  );
}

export default PostCard;
