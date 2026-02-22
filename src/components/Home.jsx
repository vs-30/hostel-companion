import React, { useEffect } from "react";
import { useNavigate} from "react-router-dom";
import "../styles/style.css"; 
 

const catImages = {
    travel: '/images/cat-travel.jpeg',
    peerhelp: '/images/cat-help.jpeg',
    task: '/images/car-task.jpeg',
    library: '/images/cat-lib2.webp'
};

const dashboardItems = [
    {
        title: "Travel Buddy",
        description:" Plan trips together and travel safer with verified students heading to the same destination.",
        route: "/travelbuddy",
        className: "travel-card image-first",
        imageSrc: catImages.travel,
    },
    {
        title: "Help Hub",
        description: "Connect with peers who are ready to help. Collaborate and support each other in real-time.",
        route: "/help-hub",
        className: "peerhelp-card text-first", 
        imageSrc: catImages.peerhelp,
    },
    {
        title: "TaskAssist",
        description: "Request everyday tasks and get them done by people already at the right place.",
        route: "/task-assist",
        className: "task-card image-first", 
        imageSrc: catImages.task,
    },
    {
        title: "LibLive",
        description: "Stay updated with real-time library occupancy and seat availability.",
        route: "/lib-live",
        className: "library-card text-first",
        imageSrc: catImages.library,
    },
    
  
];

export default function Home() {
const navigate = useNavigate();
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