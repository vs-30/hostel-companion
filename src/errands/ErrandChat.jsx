import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "../firebase";
import { BiSend } from "react-icons/bi";
import "../styles/travel.css";

export default function ErrandChat() {
  const { chatId } = useParams(); // ✅ get chatId from route
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const bottomRef = useRef(null);

  /* ---------------- FETCH MESSAGES ---------------- */
  useEffect(() => {
    if (!chatId) return;

    const q = query(
      collection(db, "errandChats", chatId, "messages"),
      orderBy("createdAt")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setMessages(data);
    });

    return () => unsubscribe();
  }, [chatId]);

  /* ---------------- AUTO SCROLL ---------------- */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ---------------- SEND MESSAGE ---------------- */
  const sendMessage = async (e) => {
    e.preventDefault();

    if (!text.trim()) return;
    if (!auth.currentUser) return;

    try {
      await addDoc(
        collection(db, "errandChats", chatId, "messages"),
        {
          text: text.trim(),
          senderId: auth.currentUser.uid,
          createdAt: serverTimestamp(),
        }
      );

      setText("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="travel-container">
      <div className="chat-container">
        <div className="chat-header">
          <h2>Private Chat</h2>
        </div>

        {/* Message Area */}
        <div className="message-box">
          {messages.map((msg) => {
            const isMe =
              msg.senderId === auth.currentUser?.uid;

            return (
              <div
                key={msg.id}
                className={`message-row ${
                  isMe ? "sent-row" : "received-row"
                }`}
              >
                <div
                  className={`msg-bubble ${
                    isMe ? "sent" : "received"
                  }`}
                >
                  <strong>
                    {isMe ? "You" : "Partner"}:
                  </strong>{" "}
                  {msg.text}
                </div>
              </div>
            );
          })}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form
          onSubmit={sendMessage}
          className="chat-input-area"
        >
          <input
            type="text"
            className="custom-search-input"
            value={text}
            onChange={(e) =>
              setText(e.target.value)
            }
            placeholder="Type a message..."
          />
          <button
            type="submit"
            className="send-btn"
          >
            <BiSend />
          </button>
        </form>
      </div>
    </div>
  );
}