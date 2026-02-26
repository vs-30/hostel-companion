import { CgTime } from "react-icons/cg";

export default function ErrandCard({
  errand,
  onAccept,
  onComplete,
  currentUser,
}) {
  const creditAmount = (errand.totalItems || 1) * 10;

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

      {/* Complete Button (Only Requester Sees This) */}
      {currentUser?.uid === errand.requesterId &&
        errand.status === "accepted" && (
          <button
            className="action-btn"
            onClick={() => onComplete(errand)}
          >
            Mark Completed ✅
          </button>
        )}

      {currentUser?.uid === errand.requesterId &&
        errand.status === "pending" && (
          <div className="owner-status">✨ Your Request</div>
        )}
    </div>
  );
}