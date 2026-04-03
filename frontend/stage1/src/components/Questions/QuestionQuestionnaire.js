import { useEffect } from "react";
import { useState } from "react";
import axiosInstance from "../../config/axiosConfig";
import QuestionRep from "./QuestionRep";
import { PDFDownloadLink } from "@react-pdf/renderer";
import QuestionPdf from "./QuestionPdf";

function QuestionQuestionnaire(props) {
  const questionnaire = props.questionnaire;
  const title = props.title;
  const repondantProfId = props.repondantProfId;
  const repondantEleveId = props.repondantEleveId;
  const activiteId = props.activiteId;
  const eleveConcerneId = props.eleveConcerneId;
  const indexMoment = props.indexMoment;

  const [questions, setQuestions] = useState(null);
  const [etat, setEtat] = useState(false);

  useEffect(() => {
    axiosInstance
      .get(`/questions/questionnaire/${questionnaire}`)
      .then((res) => {
        setQuestions(res.data);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  const handleAfficherQuestionnaire = () => {
    setEtat(!etat);
  };

  return (
    questions && (
      <div>
        <button className="btn" onClick={() => handleAfficherQuestionnaire()}>
          {etat ? (
            <i className="fa-solid fa-play fa-rotate-270 fa-lg"></i>
          ) : (
            <i className="fa-solid fa-play fa-rotate-90 fa-lg"></i>
          )}{" "}
          {title || `Questionnaire pour ${questionnaire}`}
        </button>
        <ul>
          {etat &&
            questions &&
            questions.map((question) => (
              <QuestionRep
                key={question.id}
                question={question}
                data={{
                  repondantEleveId,
                  repondantProfId,
                  eleveConcerneId,
                  activiteId,
                  question,
                  indexMoment,
                }}
              />
            ))}
        </ul>
        {/*<PDFDownloadLink className="link"  document={<QuestionPdf questionnaire={questionnaire} />} fileName={"questions"+questionnaire+".pdf"}>
                            {({ blob, url, loading, error }) =>
                                loading ? 'Téléchargement en cours...' : (
                                    <>
                                        <i className="fa-solid fa-circle-down fa-xl"></i> Télécharger les questions
                                    </>
                                )                            
                            }
                </PDFDownloadLink>*/}
      </div>
    )
  );
}

export default QuestionQuestionnaire;
