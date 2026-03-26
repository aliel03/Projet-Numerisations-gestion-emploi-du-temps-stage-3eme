import { useState, useEffect, useContext } from "react";
import axiosInstance from "../../config/axiosConfig";
import { useNavigate } from "react-router-dom";
import { MomentsContext } from "../../utils/tabMoments";
import {
  buildParcoursLabelMap,
  getParcoursDisplayName,
} from "../../utils/parcoursLabels";

function AjoutActParc(props) {
  const activiteId = props.activiteId;
  const semaine = props.semaine;

  const { tab_moments } = useContext(MomentsContext);

  const [indexMoment, setIndexMoment] = useState(0);
  const [parcoursId, setParcoursId] = useState(0);
  const [parcours, setParcours] = useState(null);
  const [etat, setEtat] = useState(false);

  const navigate = useNavigate();

  const handleAfficherParc = () => {
    setEtat(!etat);
  };

  useEffect(() => {
    axiosInstance
      .get(`/activiteparcours/parcours`, {
        params: {
          weekStart: semaine,
        },
      })
      .then((res) => {
        setParcours(res.data);
        const parcoursIds = Object.keys(res.data || {});
        if (parcoursIds.length > 0) {
          setParcoursId(parcoursIds[0]);
        }
      })
      .catch((err) => {
        console.error(err);
      });
  }, [semaine]);

  const parcoursLabelMap = buildParcoursLabelMap(
    parcours ? Object.keys(parcours) : []
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    const confirmation = tab_moments
        ? window.confirm(
          "Êtes-vous sûr de vouloir ajouter cette activité au parcours " +
            getParcoursDisplayName(parcoursId, parcoursLabelMap) +
            " le " +
            tab_moments[indexMoment] +
            " ?"
        )
      : false;

    if (confirmation) {
      const data = {
        parcoursId,
        activiteId,
        indexMoment,
        weekStart: semaine,
      };

      axiosInstance
        .post(`/activiteparcours`, data)
        .then((res) => {
          navigate("/parcours");
        })
        .catch((err) => {
          console.error(err);
        });
    }
  };

  return (
    <div>
      <button className="btn" onClick={() => handleAfficherParc()}>
        {etat ? (
          <i className="fa-solid fa-play fa-rotate-270 fa-lg"></i>
        ) : (
          <i className="fa-solid fa-play fa-rotate-90 fa-lg"></i>
        )}{" "}
        Ajouter l'activité à un parcours
      </button>
      {etat && (
        <form onSubmit={(e) => handleSubmit(e)}>
          <div>
            <label>
              Entrez le moment de la semaine durant lequel vous souhaitez
              ajouter cette activité
            </label>
            <select
              value={indexMoment}
              onChange={(e) => setIndexMoment(e.target.value)}
            >
              {tab_moments &&
                tab_moments.map((mom, index) => (
                  <option key={index} value={index}>
                    {mom}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label>
              Entrez les parcours sur le quel vous voulez rajouter l'activité{" "}
            </label>
            <select
              value={parcoursId}
              onChange={(e) => setParcoursId(e.target.value)}
            >
              {parcours &&
                Object.keys(parcours).map((parc) => (
                  <option key={parc} value={parc}>
                    {getParcoursDisplayName(parc, parcoursLabelMap)}
                  </option>
                ))}
            </select>
          </div>
          <button className="btn">Ajouter</button>
        </form>
      )}
    </div>
  );
}

export default AjoutActParc;
