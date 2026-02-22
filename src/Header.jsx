import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase";
import "./styles/style.css";
import { VscHome, VscSettingsGear, VscColorMode, VscVerified, VscCalendar, VscSignOut } from "react-icons/vsc";

const Header = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const menuRef = useRef(null);

  // 🔐 Listen for login/logout state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // 🌙 Theme switcher
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  // ❌ Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setShowMenu(false);
    navigate("/");
  };

  const navItems = [
    {
      icon: <VscColorMode size={19} />,
      label: "Theme",
      onClick: toggleTheme
    },
    {
      icon: <VscHome size={19} />,
      label: "Home",
      onClick: () => navigate("/")
    },
    {
      icon: <VscSettingsGear size={19} />,
      label: "Settings",
      onClick: () => navigate("/settings")
    }
    
  ];

  const userInitial =
    user?.displayName?.charAt(0).toUpperCase() ||
    user?.email?.charAt(0).toUpperCase();

  return (
    <header className="navbar">
      <h1 className="logo" onClick={() => navigate("/home")}>
        Campus Connect
      </h1>

      <div className="navbar-icons">

        {/* Navigation */}
        {navItems.map((item) => (
          <button
            key={item.label}
            className="nav-item"
            onClick={item.onClick}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}

        {/* 🔁 Auth UI */}
        {!user ? (
          <button
            className="login-btn"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
        ) : (
          <div className="avatar-wrapper" ref={menuRef}>

            {/* Small Avatar in Navbar */}
            <div
              className="avatar-circle"
              onClick={() => setShowMenu(!showMenu)}
            >
              {userInitial}
            </div>

            {showMenu && (
              <div className="account-popup">
                <div className="popup-header">
                  <div className="popup-avatar-large">{userInitial}</div>
                  <h3 style={{ margin: 0 }}>{user.displayName || "User"}</h3>
                  <small style={{ opacity: 0.9 }}>{user.email}</small>
                  <p style={{ fontSize: '10px', marginTop: '5px', opacity: 0.8 }}>SASTRA University</p>
                </div>

                <div className="popup-body">
                  <div className="popup-item">
                    <VscVerified color="#4caf50" size={18} />
                    <span>Verified College Account</span>
                  </div>
                  <div className="popup-item">
                    <VscCalendar size={18} />
                    <span>Logged in: {new Date().toLocaleDateString()}</span>
                  </div>
                  <button className="popup-logout" onClick={handleLogout}>
                    <VscSignOut /> Sign Out
                  </button>
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
