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
import { db, auth } from "../firebase"; // 🔥 Added auth import
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

    if (!text.trim() || !auth.currentUser) return;

    await addDoc(collection(db, "chats", postId, "messages"), {
      text,
      senderId: auth.currentUser.uid, // 🔥 Store real UID instead of "User"
      createdAt: serverTimestamp()
    });

    setText("");
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>Private Chat</h2>
      </div>

      <div className="message-box" style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "10px" }}>
        {messages.map(msg => {
          // Check if the message was sent by the current logged-in user
          const isMe = msg.senderId === auth.currentUser?.uid;

          return (
            <div 
              key={msg.id} 
              style={{
                display: "flex",
                justifyContent: isMe ? "flex-end" : "flex-start", // 🔥 Right for you, Left for partner
                width: "100%"
              }}
            >
              <div 
                className={`msg-bubble ${isMe ? "sent" : "received"}`}
                style={{
                  maxWidth: "70%",
                  padding: "10px 15px",
                  borderRadius: "15px",
                  backgroundColor: isMe ? "#007bff" : "#f1f0f0", // Blue vs Grey
                  color: isMe ? "white" : "black",
                  borderBottomRightRadius: isMe ? "2px" : "15px",
                  borderBottomLeftRadius: isMe ? "15px" : "2px",
                }}
              >
                <strong>{isMe ? "You" : "Partner"}:</strong> {msg.text}
              </div>
            </div>
          );
        })}
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