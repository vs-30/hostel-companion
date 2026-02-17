import { Routes, Route } from "react-router-dom";
import Layout from "./Layout";
import Login from "./auth/Login";
import Signup from "./auth/Signup";
import Home  from "./components/Home";
import THome from "./pages/TravelHome";
import ChatPage from "./pages/ChatPage";
import Profile from "./pages/Profile";
import TravelHistory from "./pages/TravelHistory";
/*import CreatePost from "./components/CreatePost";*/

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
      <Route path="/" element={<Home/>} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/travelbuddy" element={<THome />} />
      <Route path="/chat/:postId" element={<ChatPage />} />
      <Route path="/profile/:userId" element={<Profile />} />
      <Route path="/history" element={<TravelHistory />} />
      
      </Route>
    </Routes>
  );
}

export default App;
