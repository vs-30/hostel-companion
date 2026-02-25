import { NavLink } from "react-router-dom";

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
}