import { Routes, Route } from "react-router-dom";
import TaskAssistSidebar from "../components/TaskAssistSidebar";
import ErrandFeed from "../components/ErrandFeed";
import Shops from "../components/Shops";
import Requests from "../components/Requests";

export default function ErrandsHome() {
  return (
    <div className="taskassist-layout">
      <TaskAssistSidebar />

      <div className="taskassist-content">
        <Routes>
          <Route index element={<ErrandFeed />} />
          <Route path="shops" element={<Shops />} />
          <Route path="requests" element={<Requests />} />
        </Routes>
      </div>
    </div>
  );
}