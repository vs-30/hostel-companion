import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { Link } from "react-router-dom";
import PostCard from "../components/PostCard";
import SearchBar from "../components/SearchBar";
import CreatePost from "../components/CreatePost";
import "../styles/travel.css";

function THome() {
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "travelPosts"),
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setPosts(data);
      }
    );

    return () => unsubscribe();
  }, []);

  const filtered = posts.filter(post =>
    post.destination?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    // THome.jsx return
<div className="travel-container">
    <nav className="sub-nav">
        <Link to="/travelbuddy" className="nav-btn" title="Home">🏠</Link>
        <Link to="/history" className="nav-btn" title="Travel History">📜</Link>
        <Link to="/profile/testUser" className="nav-btn" title="Profile">👤</Link>
    </nav>

    <h1 className="page-title" style={{ textAlign: 'center', color: 'white' }}>Explore Journeys</h1>
    <SearchBar setSearch={setSearch} />
    
    <div className="posts-list">
        {filtered.map(post => <PostCard key={post.id} post={post} />)}
    </div>
    <CreatePost />
</div>

  );
}

export default THome;
