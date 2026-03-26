import { useState, useEffect } from "react";
import axiosInstance from "../../config/axiosConfig";
import {
  buildParcoursLabelMap,
  getParcoursDisplayName,
} from "../../utils/parcoursLabels";

function SupprimeActParc(props) {
  const activiteId = props.activiteId;
  const semaine = props.semaine;

  const [parcoursId, setParcoursId] = useState("");
  const [parcours, setParcours] = useState(null);
  const [etat, setEtat] = useState(false);

  const handleAfficherForm = () => {
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

    const confirmation = window.confirm(
      `Êtes-vous sûr de vouloir retirer cette activité du ${getParcoursDisplayName(parcoursId, parcoursLabelMap)} ?`
    );

    if (!confirmation) {
      return;
    }

    axiosInstance
      .delete(
        `/activiteparcours?parcoursId=${parcoursId}&activiteId=${activiteId}`
      )
      .then(() => {
        window.location.reload();
      })
      .catch((err) => {
        console.error(err);
      });
  };

  return (
    <div>
      <button className="btn" onClick={handleAfficherForm} type="button">
        {etat ? "Fermer" : "Retirer l'activite d'un parcours"}
      </button>

      {etat && (
        <form onSubmit={handleSubmit}>
          <div>
            <label>Choisir le parcours dont il faut retirer l'activite</label>
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
          <button className="btn" type="submit">
            Supprimer l'association
          </button>
        </form>
      )}
    </div>
  );
}

export default SupprimeActParc;
