import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";

const QuestionCard = ({ question }) => {
  const navigate = useNavigate();
  const isOwner = auth.currentUser?.uid === question.userId;

  return (
    <div className="travel-card">
      <div className="card-header">
        <h3 className="destination-title">{question.courseCode}</h3>
      </div>

      <p>{question.text}</p>

      <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
        <button
          className="action-btn"
          onClick={() =>
            navigate(`/helphub/question/${question.id}`)
          }
        >
          View Answers
        </button>

        {!isOwner && (
          <button
            className="secondary-btn action-btn"
            onClick={() =>
              navigate(`/helphub/question/${question.id}`, {
                state: { openAnswerBox: true },
              })
            }
          >
            Answer
          </button>
        )}
      </div>
    </div>
  );
};

export default QuestionCard;