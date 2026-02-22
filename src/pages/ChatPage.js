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
import { db, auth } from "../firebase";
import { BiSend } from "react-icons/bi";
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
      senderId: auth.currentUser.uid,
      createdAt: serverTimestamp()
    });

    setText("");
  };

  return (
    <div className="travel-container">
    <div className="chat-container">
      <div className="chat-header">
        <h2>Private Chat</h2>
      </div>

      <div className="message-box">
        {messages.map((msg) => {
          const isMe = msg.senderId === auth.currentUser?.uid;

          return (
            <div
              key={msg.id}
              className={`message-row ${isMe ? "sent-row" : "received-row"}`}
            >
              <div className={`msg-bubble ${isMe ? "sent" : "received"}`}>
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
        />
        <button type="submit" className="send-btn">
          <BiSend />
        </button>
      </form>
    </div>
    </div>
  );
}

export default ChatPage;