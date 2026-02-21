import { useEffect, useState } from "react";
import { collection, onSnapshot, doc, getDoc } from "firebase/firestore";
import { auth } from "../firebase";
import { db } from "../firebase";
import { Link } from "react-router-dom";
import PostCard from "../components/PostCard";
import SearchBar from "../components/SearchBar";
import CreatePost from "../components/CreatePost";
import "../styles/travel.css";

function THome() {
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState("");
  const [userGender, setUserGender] = useState(null);  // 🔥 ADD
  const [companionFilter, setCompanionFilter] = useState("all");

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
  useEffect(() => {
  const fetchGender = async () => {
    if (!auth.currentUser) return;

    const userRef = doc(db, "users", auth.currentUser.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      setUserGender(userSnap.data().gender);
    }
  };

  fetchGender();
}, []);

  const filtered = posts.filter(post => {

  // 1️⃣ Search
  const matchesSearch = post.destination
    ?.toLowerCase()
    .includes(search.toLowerCase());

  // 2️⃣ Visibility (allowedGender logic)
  const matchesVisibility =
    post.userId === auth.currentUser?.uid || // creator always sees own
    post.allowedGender === "all" ||
    post.allowedGender === userGender;

  // 3️⃣ Poster gender dropdown filter
  const matchesPosterFilter =
    companionFilter === "all" ||
    post.userGender === companionFilter;
  
  const isNotMine = post.userId !== auth.currentUser?.uid;

  return matchesSearch && matchesVisibility && matchesPosterFilter && isNotMine;
});

  return (
    // THome.jsx return
<div className="travel-container">
    <nav className="sub-nav">
        <Link to="/travelbuddy" className="nav-btn" title="Home">🏠</Link>
        <Link to="/history" className="nav-btn" title="Travel History">📜</Link>
        <Link to="/profile/testUser" className="nav-btn" title="Profile">👤</Link>
        <Link to="/myposts" className="nav-btn" title="My Posts">📍</Link>
    </nav>

    <h1 className="page-title" style={{ textAlign: 'center', color: 'white' }}>Explore Journeys</h1>
    <SearchBar setSearch={setSearch} />
    <div style={{ marginBottom: "15px", textAlign: "center" }}>
      <select
        className="custom-search-input"
        value={companionFilter}
        onChange={(e) => setCompanionFilter(e.target.value)}
      >
        <option value="all">Show All</option>
        <option value="male">Show Male Companion Posts</option>
        <option value="female">Show Female Companion Posts</option>
      </select>
    </div>

    
    <div className="posts-list">
        {filtered.map(post => <PostCard key={post.id} post={post} />)}
    </div>
    <CreatePost />
</div>

  );
}

export default THome;
