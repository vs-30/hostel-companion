import { Routes, Route } from "react-router-dom";
import Layout from "./Layout";
import Login from "./auth/Login";
import Signup from "./auth/Signup";
import Home  from "./components/Home";
import Profile from "./UserProfile";
import SBLayout from "./Sbarlayout";
import THome from "./pages/TravelHome";
import ChatPage from "./pages/ChatPage";
import TravelHistory from "./pages/TravelHistory";
import MyPosts from "./pages/MyPosts"; 
import LibraryMap from "./SeatComponent";
import HelpHubHome from "./pages/HelpHubHome";
import QuestionDetail from "./pages/QuestionDetail";
import AnsweredByYou from "./pages/AnsweredByYou";
import YourPosts from "./pages/YourPosts";
import CreditsPage from "./pages/CreditsPage";
import TaskAssist from "./pages/TaskAssist";
function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
      <Route path="/" element={<Home/>} />
      <Route path ="/user-profile" element={<Profile />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route element={<SBLayout />}>
      <Route path="/travelbuddy" element={<THome />} />
      <Route path="/chat/:postId" element={<ChatPage />} />
      <Route path="/task-assist/*" element={<TaskAssist />} />
      <Route path="/history" element={<TravelHistory />} />
      <Route path="/myposts" element={<MyPosts />} />
      </Route>
      <Route path="/lib-live" element={<LibraryMap />} />
      <Route path="/help-hub" element={<HelpHubHome />} />
      <Route path="/helphub/question/:id" element={<QuestionDetail />} />
      <Route path="/helphub/answered" element={<AnsweredByYou />} />
      <Route path="/helphub/credits" element={<CreditsPage />} />
      <Route path="/helphub/myposts" element={<YourPosts />} />
      </Route>
    </Routes>
  );
}

export default App;
