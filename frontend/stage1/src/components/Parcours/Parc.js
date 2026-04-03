import { useEffect, useState, useContext } from "react";
import axiosInstance from "../../config/axiosConfig";
import ActiviteDescr from "../Activites/ActiviteDescr";
import { MomentsContext } from "../../utils/tabMoments";
import {
  buildParcoursLabelMap,
  getParcoursDisplayName,
} from "../../utils/parcoursLabels";
import { downloadEleveParcoursSpreadsheet } from "../../utils/eleveParcoursSpreadsheet";

function Parc(props) {
  const parcoursId = props.parcoursId;
  const prof = props.profId;
  const eleve = props.eleve;
  const semaine = props.semaine || localStorage.getItem("semaineStage");

  const { tab_moments } = useContext(MomentsContext);

  const [etat, setEtat] = useState(false);
  const [parcoursLabelMap, setParcoursLabelMap] = useState({});
  const [tuteur, setTuteur] = useState(null);

  const handleAfficherParc = () => {
    setEtat(!etat);
  };

  const [activites, setActivites] = useState(null);

  let route;
  if (prof) {
    route = `/activiteparcours/professeur/${prof}`;
  } else {
    route = `/activiteparcours/${parcoursId}`;
  }
  useEffect(() => {
    axiosInstance
      .get(route)
      .then((res) => {
        setActivites(res.data);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  useEffect(() => {
    if (prof || !semaine) {
      return;
    }

    axiosInstance
      .get("/activiteparcours/parcours", {
        params: {
          weekStart: semaine,
        },
      })
      .then((res) => {
        setParcoursLabelMap(buildParcoursLabelMap(Object.keys(res.data || {})));
      })
      .catch((err) => {
        console.error(err);
      });
  }, [prof, semaine]);

  useEffect(() => {
    if (!eleve?.professeurId) {
      setTuteur(null);
      return;
    }

    axiosInstance
      .get(`/professeurs/${eleve.professeurId}`)
      .then((res) => {
        setTuteur(res.data);
      })
      .catch((err) => {
        console.error(err);
        setTuteur(null);
      });
  }, [eleve]);

  const parcoursDisplayName = getParcoursDisplayName(
    parcoursId,
    parcoursLabelMap
  );

  const handleDownloadSpreadsheet = () => {
    downloadEleveParcoursSpreadsheet({
      eleve,
      tuteur,
      activites,
      weekStart: semaine,
      parcoursLabel: parcoursDisplayName,
    });
  };

  return (
    <div>
      <button className="btn" onClick={() => handleAfficherParc()}>
        {etat ? (
          <i className="fa-solid fa-play fa-rotate-270 fa-lg"></i>
        ) : (
          <i className="fa-solid fa-play fa-rotate-90 fa-lg"></i>
        )}{" "}
        {parcoursDisplayName}
      </button>
      <ul className="container liste-activite">
        {activites &&
          etat &&
          tab_moments &&
          activites.map((act) => (
            <li key={act.activiteId}>
              <h3>{tab_moments && tab_moments[act.indexMoment]} :</h3>
              <ActiviteDescr id={act.activiteId} />
            </li>
          ))}
      </ul>
      <button
        className="btn pdf"
        type="button"
        onClick={handleDownloadSpreadsheet}
      >
        <i className="fa-solid fa-circle-down fa-xl"></i> Telecharger le
        planning Excel
      </button>
    </div>
  );
}

export default Parc;
