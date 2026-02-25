import TaskAssistSidebar from "./TaskAssistSidebar";
import { Outlet } from "react-router-dom";

const TASBLayout = () => {
  return (
    <>
      <TaskAssistSidebar/>
      <main className="side-page-content">
        <Outlet />
      </main>
    </>
  );
};

export default TASBLayout;