import { CgTime } from "react-icons/cg";

export default function ErrandCard({ errand, onAccept, currentUser }) {
  return (
    <div className="travel-card">
      <div className="card-header">
        <h3>{errand.type}</h3>
        <span className={`status-badge ${errand.status?.toLowerCase()}`}>
          {errand.status}
        </span>
      </div>

      <p>{errand.description}</p>

      {currentUser?.uid !== errand.requesterId &&
        errand.status === "pending" && (
          <button
            className="action-btn"
            onClick={() => onAccept(errand)}
          >
            Accept (+10 Credits)
          </button>
        )}

      {currentUser?.uid === errand.requesterId && (
        <div className="owner-status">✨ Your Request</div>
      )}
    </div>
  );
}