/*import { useEffect, useState } from "react";
import { collection, onSnapshot, doc, getDoc } from "firebase/firestore";
import { auth } from "../firebase";
import { db } from "../firebase";
import { Link } from "react-router-dom";
import PostCard from "../components/PostCard";
import SearchBar from "../components/SearchBar";
import CreatePost from "../components/CreatePost";
import { TbMessageUser } from "react-icons/tb";
import { VscHistory } from "react-icons/vsc";
import { IoMdOptions } from "react-icons/io";
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
   <div className="travel-container">
    <h1 className="page-title" style={{ textAlign: 'center', color: 'white', marginTop: '20px' }}>
      Explore Journeys
    </h1>

    <div className="search-row">
      <div className="search-bar-wrapper">
        <SearchBar setSearch={setSearch} />
      </div>
      <Link to="/history" className="icon-btn" title="Travel History">
        <VscHistory />
      </Link>
      <Link to="/myposts" className="icon-btn" title="My Posts">
        <TbMessageUser />
      </Link>
    </div>


    <div className="filter-row">
      <div className="filter-container">
        <IoMdOptions className="filter-icon" />
        <select
          className="filter-select"
          value={companionFilter}
          onChange={(e) => setCompanionFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="male">Male Companion Posts</option>
          <option value="female">Female Companion Posts</option>
        </select>
      </div>
    </div>

    <div className="posts-list">
      {filtered.map(post => <PostCard key={post.id} post={post} />)}
    </div>
    
    <CreatePost />
  </div>
);
}

export default THome;*/

import { useEffect, useState } from "react";
import { collection, onSnapshot, doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import PostCard from "../components/PostCard";
import CreatePost from "../components/CreatePost";
import Sidebar from "../components/Sidebar";
import { IoIosSearch } from "react-icons/io";
import "../styles/travel.css";

function THome() {
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState("");
  const [userGender, setUserGender] = useState(null);
  const [companionFilter, setCompanionFilter] = useState("all");

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "travelPosts"), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPosts(data);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchGender = async () => {
      if (!auth.currentUser) return;
      const userRef = doc(db, "users", auth.currentUser.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) setUserGender(userSnap.data().gender);
    };
    fetchGender();
  }, []);

  const filtered = posts.filter(post => {
    const matchesSearch = post.destination?.toLowerCase().includes(search.toLowerCase());
    const matchesVisibility = post.userId === auth.currentUser?.uid || post.allowedGender === "all" || post.allowedGender === userGender;
    const matchesPosterFilter = companionFilter === "all" || post.userGender === companionFilter;
    return matchesSearch && matchesVisibility && matchesPosterFilter && post.userId !== auth.currentUser?.uid;
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
          <CreatePost /> {/* This now triggers the modal from the top */}
        </header>

        <div className="category-tabs">
          {["all", "male", "female"].map((tab) => (
            <button
              key={tab}
              className={`tab-btn ${companionFilter === tab ? "active" : ""}`}
              onClick={() => setCompanionFilter(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="posts-grid">
          {filtered.map(post => <PostCard key={post.id} post={post} />)}
        </div>
    </div>
  );
}

export default THome;