import { calculatePoints } from "./errandsService";
import { useNavigate } from "react-router-dom";

export default function ErrandCard({
  errand,
  onAccept,
  onComplete,
  currentUser,
}) {
  const navigate = useNavigate();
  if (!errand) return null;

  const creditAmount = calculatePoints(
    errand.type,
    errand.totalItems || 1
  );

  // ✅ build chatId exactly same way as in ErrandFeed
  const chatId =
    errand.id + "_" + errand.acceptedBy;

  return (
    <div className="travel-card">
      <div className="card-header">
        <h3>{errand.type}</h3>
        <span className={`status-badge ${errand.status?.toLowerCase()}`}>
          {errand.status}
        </span>
      </div>

      <p>{errand.description}</p>

      {/* Accept Button */}
      {currentUser?.uid !== errand.requesterId &&
        errand.status === "pending" && (
          <button
            className="action-btn"
            onClick={() => onAccept(errand)}
          >
            Accept (+{creditAmount} Credits)
          </button>
        )}

      {/* Complete Button */}
      {currentUser?.uid === errand.requesterId &&
        errand.status === "accepted" && (
          <button
            className="action-btn"
            onClick={() => onComplete(errand)}
          >
            Mark Completed ✅
          </button>
        )}

      {/* ✅ CHAT BUTTON */}
      {errand.status === "accepted" &&
        (currentUser?.uid === errand.requesterId ||
          currentUser?.uid === errand.acceptedBy) && (
          <button
            className="action-btn"
            onClick={() =>
              navigate(`/errand-chat/${chatId}`)
            }
          >
            Open Chat 💬
          </button>
        )}

      {/* Owner Label */}
      {currentUser?.uid === errand.requesterId &&
        errand.status === "pending" && (
          <div className="owner-status">
            ✨ Your Request
          </div>
        )}
    </div>
  );
}