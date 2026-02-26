import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { auth, db } from "../firebase";
import PostCard from "../components/PostCard";
import "../styles/travel.css";

function MyPosts() {
  const [myPosts, setMyPosts] = useState([]);

  useEffect(() => {
    if (!auth.currentUser) return;

    // Query Firestore for posts where userId matches current user
    const q = query(
      collection(db, "travelPosts"),
      where("userId", "==", auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMyPosts(data);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="travel-container">
      <h1 className="travel-page-title">My Travel Posts</h1>

      <div className="posts-grid">
        {myPosts.length > 0 ? (
          myPosts.map(post => (
            <PostCard key={post.id} post={post} />
          ))
        ) : (
          <p style={{ color: "white", textAlign: "center" }}>You haven't posted any journeys yet.</p>
        )}
      </div>
    </div>
  );
}

export default MyPosts;