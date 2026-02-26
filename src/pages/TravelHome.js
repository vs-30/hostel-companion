
import { useEffect, useState } from "react";
import { collection, onSnapshot, doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import PostCard from "../components/PostCard";
import CreatePost from "../components/CreatePost";
import { IoIosSearch } from "react-icons/io";
import "../styles/travel.css";

function THome() {
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState("");
  const [userGender, setUserGender] = useState(null);
  const [companionFilter, setCompanionFilter] = useState("all");

  // 🔹 Listen to Posts
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

  // 🔹 Fetch Logged User Gender
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
    const matchesSearch =
      post.destination?.toLowerCase().includes(search.toLowerCase());

    const matchesVisibility =
      post.userId === auth.currentUser?.uid ||
      post.allowedGender === "all" ||
      post.allowedGender === userGender;

    const matchesPosterFilter =
      companionFilter === "all" ||
      post.userGender === companionFilter;

    return (
      matchesSearch &&
      matchesVisibility &&
      matchesPosterFilter &&
      post.userId !== auth.currentUser?.uid
    );
  });

  return (
    <div className="travel-container">
      <header className="top-search-bar">
        <div className="search-input-container">
          <IoIosSearch className="search-icon-inside" />
          <input
            type="text"
            placeholder="Search destination..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <CreatePost />
      </header>

      <div className="category-tabs">
        {["all", "male", "female"].map((tab) => (
          <button
            key={tab}
            className={`tab-btn ${
              companionFilter === tab ? "active" : ""
            }`}
            onClick={() => setCompanionFilter(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="posts-grid">
        {filtered.map(post => (
          <PostCard
            key={post.id}
            post={post}
          />
        ))}
      </div>
    </div>
  );
}

export default THome;