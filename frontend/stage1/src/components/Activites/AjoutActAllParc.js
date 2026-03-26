import { useState, useContext } from "react";
import axiosInstance from "../../config/axiosConfig";
import { useNavigate } from "react-router-dom";
import { MomentsContext } from "../../utils/tabMoments";

function AjoutActAllParc(props) {
  const activiteId = props.activiteId;
  const semaine = props.semaine;

  const { tab_moments } = useContext(MomentsContext);

  const [indexMoment, setIndexMoment] = useState(0);
  const [etat, setEtat] = useState(false);
  const navigate = useNavigate();

  const handleAfficherParc = () => {
    setEtat(!etat);
  };

  const handleSubmit = () => {
    const confirmation = tab_moments
      ? window.confirm(
          "Êtes-vous sûr de ajouter cette activité à tous les parcours le " +
            tab_moments[indexMoment] +
            " ?"
        )
      : false;

    if (confirmation) {
      const data = {
        activiteId,
        indexMoment,
        weekStart: semaine,
      };
      axiosInstance
        .post(`/activiteparcours/parcours`, data)
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
        Ajouter l'activité à tous les parcours
      </button>
      {etat && (
        <form onSubmit={handleSubmit}>
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
          <button className="btn">Ajouter</button>
        </form>
      )}
    </div>
  );
}

export default AjoutActAllParc;
