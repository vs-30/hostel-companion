import { Link, useLocation } from "react-router-dom";
import { MdHistory } from "react-icons/md";
import { BiAddToQueue } from "react-icons/bi";
import { GiPayMoney } from "react-icons/gi";
import "../styles/travel.css";

function HelpHubSidebar() {
  const location = useLocation();

  const navItems = [
    { path: "/helphub/answered", icon: <MdHistory />, label: "Answered By You" },
    { path: "/helphub/myposts", icon: <BiAddToQueue />, label: "Your Posts" },
    { path: "/helphub/credits", icon: <GiPayMoney />, label: "Credits" },
  ];

  return (
    <div className="sidebar">
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`sidebar-link ${
              location.pathname === item.path ? "active" : ""
            }`}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}

export default HelpHubSidebar;