/*import React, { useEffect } from "react";
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

export default Home;*/
import React, { useEffect } from "react";
import { useNavigate} from "react-router-dom";
import "../styles/style.css"; // Ensure you use the new CSS file
 
 
// Placeholder cat images - replace with your actual URLs!
const catImages = {
    travel: '/images/cat-travel.jpeg',
    peerhelp: '/images/cat-help.jpeg',
    task: '/images/car-task.jpeg',
    library: '/images/cat-lib2.webp'
};

// Data structure for cards with new color classes - Settings card removed
const dashboardItems = [
    {
        title: "Travel Buddy",
        description:" Plan trips together and travel safer with verified students heading to the same destination.",
        route: "/travelbuddy",
        className: "travel-card image-first", // Dark background, Image right
        imageSrc: catImages.travel,
    },
    {
        title: "Help Hub",
        description: "Connect with peers who are ready to help. Collaborate and support each other in real-time.",
        route: "/help-hub",
        className: "peerhelp-card text-first", // White background, Image left
        imageSrc: catImages.peerhelp,
    },
    {
        title: "TaskAssist",
        description: "Request everyday tasks and get them done by people already at the right place.",
        route: "/task-assist",
        className: "task-card image-first", // White background, Image right
        imageSrc: catImages.task,
    },
    {
        title: "LibLive",
        description: "Stay updated with real-time library occupancy and seat availability.",
        route: "/lib-live",
        className: "library-card text-first", // Dark background, Image left
        imageSrc: catImages.library,
    },
    
  
];

export default function Home() {
    
    // Inside your functional component (e.g., Home or Navbar):
const navigate = useNavigate();
    // Scroll Reveal Animation (Intersection Observer)
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        observer.unobserve(entry.target); 
                    }
                });
            },
            {
                root: null,
                rootMargin: '0px 0px -100px 0px',
                threshold: 0.1
            }

        );

        const sections = document.querySelectorAll('.reveal');
        sections.forEach(section => {
            observer.observe(section);
        });

        return () => sections.forEach(section => observer.unobserve(section));
    }, []);


    return (
        <div className="home-container">

            <div className="main-content">

                <main className="dashboard">
                    

                    {dashboardItems.map((item, index) => (
                        <div
                            key={index}
                            className={`card-section reveal ${item.className}`}
                            onClick={() => navigate(item.route)}
                        >
                            <div className="card-text">
                                <h2 className="card-title">{item.title}</h2>
                                <p className="card-description">{item.description}</p>
                            </div>
                            <div className="card-image-container">
                                <img
                                    src={item.imageSrc}
                                    alt={`${item.title} icon cat`}
                                    className="cat-image"
                                    onError={(e) => { e.target.onerror = null; e.target.src="https://via.placeholder.com/150/2A3644/FFFFFF?text=CAT"; }} 
                                />
                            </div>
                        </div>
                    ))}
                </main>
            </div>
        </div>
    );
}