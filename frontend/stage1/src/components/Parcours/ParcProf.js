import { useState, useEffect, useContext } from "react";
import axiosInstance from "../../config/axiosConfig";
import ActiviteDescr from "../Activites/ActiviteDescr";
import ParcProfPdf from "./ParcProfPdf";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { MomentsContext } from "../../utils/tabMoments";
import {
  buildParcoursLabelMap,
  getParcoursDisplayName,
} from "../../utils/parcoursLabels";

function ParcProf(props) {
  const id = props.profId;
  const professeur = props.professeur;

  const { tab_moments } = useContext(MomentsContext);

  const [etat, setEtat] = useState(false);
  const [parcoursLabelMap, setParcoursLabelMap] = useState({});

  const handleAfficherParc = () => {
    setEtat(!etat);
  };

  const [activites, setActivites] = useState(null);

  useEffect(() => {
    const semaine = localStorage.getItem("semaineStage");

    axiosInstance
      .get(`/activiteparcours/professeur/${id}`, {
        params: semaine
          ? {
              weekStart: semaine,
            }
          : undefined,
      })
      .then((res) => {
        setActivites(res.data);
        const parcoursIds = [];

        Object.values(res.data || {}).forEach((moments) => {
          (moments || []).forEach((moment) => {
            (moment || []).forEach((activite) => {
              if (activite && activite.parcoursId) {
                parcoursIds.push(activite.parcoursId);
              }
            });
          });
        });

        setParcoursLabelMap(buildParcoursLabelMap(parcoursIds));
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  return (
    <div>
      <button className="btn" onClick={() => handleAfficherParc()}>
        {etat ? (
          <i className="fa-solid fa-play fa-rotate-270 fa-lg"></i>
        ) : (
          <i className="fa-solid fa-play fa-rotate-90 fa-lg"></i>
        )}
      </button>
      {activites &&
        etat &&
        Object.entries(activites).map(([index, moments]) => (
          <div key={index}>
            <h3> {moments.length > 0 && tab_moments && tab_moments[index]} </h3>
            {moments.length > 0 &&
              moments.map((moment, momentIndex) => (
                <ul key={momentIndex} className="contain-activite-prof">
                  {moment &&
                    moment.map((activite, activiteIndex) => (
                      <div className="activite-prof">
                        <ActiviteDescr
                          key={activiteIndex}
                          id={activite.activiteId}
                        />
                        <h3>
                          {getParcoursDisplayName(
                            activite.parcoursId,
                            parcoursLabelMap
                          )}
                        </h3>
                      </div>
                    ))}
                </ul>
              ))}
          </div>
        ))}
      <PDFDownloadLink
        className="link"
        document={
          <ParcProfPdf
            activites={activites}
            nom={professeur.nom}
            tab_moments={tab_moments}
            prenom={professeur.prenom}
          />
        }
        fileName={"parcours" + id + ".pdf"}
      >
        {({ blob, url, loading, error }) =>
          loading ? "Téléchargement en cours..." : "Télécharger le parcours"
        }
      </PDFDownloadLink>
    </div>
  );
}

export default ParcProf;
