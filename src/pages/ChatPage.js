import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from "firebase/firestore";
import { db } from "../firebase";
import "../styles/travel.css";

function ChatPage() {
  const { postId } = useParams();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    const q = query(
      collection(db, "chats", postId, "messages"),
      orderBy("createdAt")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(data);
    });

    return () => unsubscribe();
  }, [postId]);

  const sendMessage = async (e) => {
    e.preventDefault();

    if (!text.trim()) return;

    await addDoc(collection(db, "chats", postId, "messages"), {
      text,
      sender: "User", // later we connect auth
      createdAt: serverTimestamp()
    });

    setText("");
  };

  return (
    // ChatPage.jsx return
<div className="chat-container">
    <div className="chat-header">
        <h2>Private Chat</h2>
    </div>

    <div className="message-box">
        {messages.map(msg => (
            <div key={msg.id} className={`msg-bubble ${msg.sender === "User" ? "sent" : "received"}`}>
                <strong>{msg.sender}:</strong> {msg.text}
            </div>
        ))}
    </div>

    <form onSubmit={sendMessage} className="chat-input-area">
        <input
            type="text"
            className="custom-search-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message..."
            style={{ width: "100%", margin: 0 }}
        />
        <button type="submit" className="action-btn" style={{ marginTop: 0 }}>Send</button>
    </form>
</div>
  );
}

export default ChatPage;
