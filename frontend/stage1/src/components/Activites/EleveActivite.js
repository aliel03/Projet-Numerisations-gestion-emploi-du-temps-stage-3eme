import { useState, useEffect, useContext } from "react";
import axiosInstance from "../../config/axiosConfig";
import EleveDescr from "../Eleves/EleveDescr";
import ListeEleves from "../Eleves/ListeElevesPdf";
import QuestionQuestionnaire from "../Questions/QuestionQuestionnaire";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { MomentsContext } from "../../utils/tabMoments";

function EleveActivite(props) {
  const { tab_moments } = useContext(MomentsContext);

  const userId = localStorage.getItem("userId");
  const userRole = localStorage.getItem("userRole");

  const indexMoment = props.indexMoment;
  const activiteId = props.activiteId;
  const professeurId = props.professeurId;
  const semaine = props.semaine;

  const [etat, setEtat] = useState(false);
  const [eleves, setEleves] = useState(null);

  const handleAfficherParc = () => {
    setEtat(!etat);
  };

  useEffect(() => {
    axiosInstance
      .get(`/eleves/activite/${activiteId}/${indexMoment}`, {
        params: {
          weekStart: semaine,
        },
      })
      .then((res) => {
        setEleves(res.data);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [activiteId, indexMoment, semaine]);

  return (
    eleves &&
    eleves.length > 0 && (
      <div>
        <h3>{tab_moments && tab_moments[indexMoment]}</h3>
        <button className="btn" onClick={() => handleAfficherParc()}>
          {etat ? (
            <i className="fa-solid fa-play fa-rotate-270 fa-lg"></i>
          ) : (
            <i className="fa-solid fa-play fa-rotate-90 fa-lg"></i>
          )}{" "}
          Liste des élèves
        </button>

        <div className="liste-eleves">
          {etat &&
            eleves &&
            Object.values(eleves).map((eleve) => (
              <div key={eleve.id}>
                <EleveDescr id={eleve.id} />
                {etat && userId && professeurId === userId && (
                  <QuestionQuestionnaire
                    questionnaire="Encadrant"
                    repondantProfId={professeurId}
                    activiteId={activiteId}
                    indexMoment={indexMoment}
                    eleveConcerneId={eleve.id}
                  />
                )}
              </div>
            ))}
        </div>
        {etat &&
          tab_moments &&
          (userId === professeurId || userRole === "Admin") && (
            <PDFDownloadLink
              className="link"
              document={
                <ListeEleves
                  eleves={eleves}
                  moment={tab_moments && tab_moments[indexMoment]}
                  activiteId={activiteId}
                />
              }
              fileName={"activite" + activiteId + ".pdf"}
            >
              {({ blob, url, loading, error }) =>
                loading ? (
                  "Téléchargement en cours..."
                ) : (
                  <>
                    <i className="fa-solid fa-circle-down fa-xl"></i>{" "}
                    Télécharger la liste des élèves
                  </>
                )
              }
            </PDFDownloadLink>
          )}
      </div>
    )
  );
}

export default EleveActivite;
