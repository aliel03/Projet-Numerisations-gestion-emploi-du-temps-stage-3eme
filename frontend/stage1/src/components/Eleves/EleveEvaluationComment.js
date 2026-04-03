import { useEffect, useState } from "react";
import axiosInstance from "../../config/axiosConfig";
import "../../style/Questions/Questions.css";

function EleveEvaluationComment(props) {
  const eleveId = props.eleveId;
  const professeurId = props.professeurId;
  const evaluationType = props.evaluationType || "Tuteur";
  const buttonLabel = props.buttonLabel || "Evaluation de l'eleve";
  const viewerTitle = props.viewerTitle || "Commentaire";
  const viewerMode = props.viewerMode || "editor";
  const [comment, setComment] = useState("");
  const [savedComment, setSavedComment] = useState("");
  const [isOpen, setIsOpen] = useState(viewerMode === "viewer");
  const [isEditing, setIsEditing] = useState(viewerMode !== "viewer");
  const [feedbackMessage, setFeedbackMessage] = useState("");

  useEffect(() => {
    const route =
      viewerMode === "viewer"
        ? evaluationType === "Encadrant"
          ? `/reponses/evaluation/eleve/encadrant/${eleveId}`
          : `/reponses/evaluation/eleve/${eleveId}`
        : evaluationType === "Encadrant"
          ? `/reponses/evaluation/encadrant/${eleveId}`
          : `/reponses/evaluation/tuteur/${eleveId}`;

    const requestConfig =
      viewerMode === "viewer"
        ? undefined
        : {
            params: {
              ...(evaluationType === "Encadrant"
                ? { encadrantId: professeurId }
                : { tuteurId: professeurId }),
            },
          };

    axiosInstance
      .get(route, requestConfig)
      .then((res) => {
        if (res.data?.contenu) {
          setSavedComment(res.data.contenu);
          if (viewerMode === "viewer") {
            setComment(res.data.contenu);
          }
        }
      })
      .catch((err) => {
        console.error(err);
      });
  }, [eleveId, evaluationType, professeurId, viewerMode]);

  const handleSave = async () => {
    setFeedbackMessage("");

    try {
      const response = await axiosInstance.put(
        evaluationType === "Encadrant"
          ? `/reponses/evaluation/encadrant/${eleveId}`
          : `/reponses/evaluation/tuteur/${eleveId}`,
        {
          contenu: comment,
          ...(evaluationType === "Encadrant"
            ? { encadrantId: professeurId }
            : { tuteurId: professeurId }),
        }
      );

      setSavedComment(response.data.contenu);
      setComment(response.data.contenu);
      setIsEditing(false);
      setFeedbackMessage("Evaluation enregistree.");
    } catch (error) {
      console.error(error);
      setFeedbackMessage("L'evaluation n'a pas pu etre enregistree.");
    }
  };

  if (viewerMode === "viewer") {
    if (!savedComment) {
      return null;
    }

    return (
      <div className="contain-questionnaire">
        <h1>{viewerTitle}</h1>
        <p>{savedComment}</p>
      </div>
    );
  }

  return (
    <div className="internal-mentor-questionnaire-card">
      <button className="btn" onClick={() => setIsOpen(!isOpen)} type="button">
        {isOpen ? "Masquer l'evaluation" : buttonLabel}
      </button>

      {isOpen && (
        <div className="internal-mentor-questionnaire-body">
          <p className="internal-card-text">
            Laissez ici un commentaire libre a destination de l&apos;eleve.
          </p>

          {savedComment && !isEditing ? (
            <>
              <p>{savedComment}</p>
              <button
                className="btn"
                type="button"
                onClick={() => {
                  setComment(savedComment);
                  setIsEditing(true);
                  setFeedbackMessage("");
                }}
              >
                Modifier l&apos;evaluation
              </button>
            </>
          ) : (
            <>
              <textarea
                className="question-rep-input"
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="Ecrivez ici votre evaluation pour cet eleve."
              />
              <button
                className="btn"
                type="button"
                onClick={handleSave}
                disabled={!comment.trim()}
              >
                Enregistrer l&apos;evaluation
              </button>
            </>
          )}

          {feedbackMessage && (
            <p className="question-rep-feedback">{feedbackMessage}</p>
          )}
        </div>
      )}
    </div>
  );
}

export default EleveEvaluationComment;
