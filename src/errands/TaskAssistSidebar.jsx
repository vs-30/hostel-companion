/*import { NavLink } from "react-router-dom";

export default function TaskAssistSidebar() {
  return (
    <div className="sidebar">
      <h2>TaskAssist</h2>

      <nav>
        <NavLink
          to=""
          end
          className={({ isActive }) =>
            isActive ? "sidebar-link active" : "sidebar-link"
          }
        >
          Feed
        </NavLink>

        <NavLink
          to="shops"
          className={({ isActive }) =>
            isActive ? "sidebar-link active" : "sidebar-link"
          }
        >
          Shops
        </NavLink>

        <NavLink
          to="requests"
          className={({ isActive }) =>
            isActive ? "sidebar-link active" : "sidebar-link"
          }
        >
          Requests
        </NavLink>
      </nav>
    </div>
  );
}*/
import { Link, useLocation } from "react-router-dom";
import { MdPersonSearch, MdHistory } from "react-icons/md";
import { BiAddToQueue } from "react-icons/bi";

import "../styles/travel.css";

function TaskAssistSidebar() {
  const location = useLocation();

  const navItems = [
    { path: "/task-assist", icon: <MdPersonSearch />, label: "Feed" },
    { path: "/shops", icon: <MdHistory />, label: "Shops" },
    { path: "/requests", icon: <BiAddToQueue />, label: "Requests" },
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

export default TaskAssistSidebar;