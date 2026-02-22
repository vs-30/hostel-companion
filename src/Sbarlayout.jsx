import Sidebar from "./components/Sidebar";
import { Outlet } from "react-router-dom";

const SBLayout = () => {
  return (
    <>
      <Sidebar/>
      <main className="side-page-content">
        <Outlet />
      </main>
    </>
  );
};

export default SBLayout;