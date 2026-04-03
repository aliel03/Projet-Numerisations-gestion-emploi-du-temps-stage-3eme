import { useEffect } from "react";
import { useState } from "react";
import axiosInstance from "../../config/axiosConfig";

function QuestionRep(props) {
  const question = props.data.question;
  const repondantProfId = props.data.repondantProfId;
  const repondantEleveId = props.data.repondantEleveId;
  const activiteId = props.data.activiteId;
  const eleveConcerneId = props.data.eleveConcerneId;
  const indexMoment = props.data.indexMoment;

  const [contenuRep, setContenuRep] = useState("");
  const [repondu, setRepondu] = useState(false);
  const [reponseId, setRepId] = useState(0);
  const [savedContenu, setSavedContenu] = useState("");
  const [isEditingResponse, setIsEditingResponse] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");

  useEffect(() => {
    const params = {
      repondantEleveId,
      repondantProfId,
      eleveConcerneId,
      questionId: question.id,
      activiteId: activiteId,
      indexMoment: indexMoment,
    };
    axiosInstance
      .get(`/reponses/unique`, { params })
      .then((res) => {
        if (res.data) {
          setRepondu(true);
          setSavedContenu(res.data.contenu);
          setContenuRep("");
          setRepId(res.data.id);
        }
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  const handleReponse = (questionId, e) => {
    e.preventDefault();
    setFeedbackMessage("");
    const dataRep = {
      contenu: contenuRep,
      repondantEleveId,
      repondantProfId,
      eleveConcerneId,
      questionId,
      activiteId,
      indexMoment,
    };

    axiosInstance
      .post(`/reponses`, dataRep)
      .then((res) => {
        setRepondu(true);
        setRepId(res.data.id);
        setSavedContenu(res.data.contenu);
        setContenuRep("");
        setIsEditingResponse(false);
        setFeedbackMessage("Reponse enregistree.");
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const updateReponse = (e) => {
    e.preventDefault();
    setFeedbackMessage("");

    const data = {
      contenu: contenuRep,
    };

    axiosInstance
      .put(`/reponses/${reponseId}`, data)
      .then((res) => {
        setSavedContenu(res.data.contenu);
        setContenuRep("");
        setIsEditingResponse(false);
        setFeedbackMessage("Reponse mise a jour.");
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const handleStartUpdate = () => {
    setFeedbackMessage("");
    setContenuRep(savedContenu);
    setIsEditingResponse(true);
  };

  return (
    <form className="question-rep-form">
      <label>{question.contenu}</label>
      <p className="question-rep-note">Cette reponse n&apos;est pas anonyme.</p>
      <textarea
        className="question-rep-input"
        value={contenuRep}
        onChange={(e) => setContenuRep(e.target.value)}
        placeholder={
          repondu && !isEditingResponse
            ? "Une reponse a deja ete enregistree pour cette question."
            : "Ecris ta reponse ici."
        }
        readOnly={repondu && !isEditingResponse}
        required={!repondu || isEditingResponse}
      />
      {repondu && !isEditingResponse ? (
        <button className="btn" type="button" onClick={handleStartUpdate}>
          Modifier ma reponse
        </button>
      ) : (
        <button
          className="btn"
          type="button"
          onClick={(e) =>
            repondu ? updateReponse(e) : handleReponse(question.id, e)
          }
        >
          {repondu ? "Enregistrer la modification" : "Valider ma reponse"}
        </button>
      )}
      {feedbackMessage && (
        <p className="question-rep-feedback">{feedbackMessage}</p>
      )}
      {repondu && !isEditingResponse && !feedbackMessage && (
        <p className="question-rep-feedback">Reponse deja enregistree.</p>
      )}
    </form>
  );
}

export default QuestionRep;
