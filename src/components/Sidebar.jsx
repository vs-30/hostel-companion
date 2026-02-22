import { Link, useLocation } from "react-router-dom";
import { MdPersonSearch, MdHistory } from "react-icons/md";
import { BiAddToQueue } from "react-icons/bi";
import "../styles/travel.css";

function Sidebar() {
  const location = useLocation();

  const navItems = [
    { path: "/travelbuddy", icon: <MdPersonSearch />, label: "Explore" },
    { path: "/history", icon: <MdHistory />, label: "History" },
    { path: "/myposts", icon: <BiAddToQueue />, label: "My Posts" },
  ];

  return (
    <div className="sidebar">
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`sidebar-link ${location.pathname === item.path ? "active" : ""}`}
            title={item.label}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}

export default Sidebar;