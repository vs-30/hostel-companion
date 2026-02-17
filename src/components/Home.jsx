import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/style.css";

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.display = "block";
    document.body.style.justifyContent = "unset";
    document.body.style.alignItems = "unset";

    return () => {
      document.body.style.display = "flex";
      document.body.style.justifyContent = "center";
      document.body.style.alignItems = "center";
    };
  }, []);

  const features = [
    { id: "travelbuddy", title: "TravelBuddy", desc: "Find companions for your journey.", icon: "🚗" },
    { id: "helphub", title: "HelpHub", desc: "Get assistance from the community.", icon: "🤝" },
    { id: "taskassist", title: "TaskAssist", desc: "Manage and delegate your tasks.", icon: "📋" },
    { id: "liblive", title: "LibLive", desc: "Real-time library occupancy updates.", icon: "📚" },
  ];

  return (
    <div className="home-wrapper">
      <main className="content-container">
        <div className="features-grid">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="feature-card"
              onClick={() => navigate(`/${feature.id}`)}
            >
              <span className="feature-icon">{feature.icon}</span>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Home;