import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../config/axiosConfig";

function ActiviteDescr(props) {
  const id = props.id;

  const [activite, setActivite] = useState(null);

  useEffect(() => {
    axiosInstance
      .get(`/activites/${id}`)
      .then((res) => {
        setActivite(res.data);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  return (
    activite && (
      <div className="contain-act-descr">
        <ul className="activite-descr">
          <li>
            <h3>{activite.nom}</h3>
          </li>
          <li>Description: {activite.description}</li>
          <li>Nombre de réalisation: {activite.nb_realisations}</li>
          <li>Nombre d'élèves au maximum: {activite.nb_eleve_max}</li>
          <li>Lieu du déroulement de l'activité : {activite.lieu}</li>
          <li>
            Lieu de rendez-vous (là ou je dois me rendre): {activite.lieu_rdv}
          </li>
          {activite.commentaire_admin && (
            <li>Commentaire admin : {activite.commentaire_admin}</li>
          )}
          <li>id : {activite.id}</li>
          <li>
            <button>
              <Link className="link" to={`/activite/${id}`}>
                Voir activité
              </Link>
            </button>
          </li>
          <div>
            <p>Encadrant respo: {activite.professeurId}</p>
            <li>
              <button>
                <Link
                  className="link"
                  to={`/professeur/${activite.professeurId}`}
                >
                  Voir accueillant
                </Link>
              </button>
            </li>
            <li>
              <h3>Disponibilités</h3>
              {activite.l1 === 1 && (
                <p>Lundi matin</p>
              )}
              {activite.l2 === 1  && (
                <p>Lundi après-midi</p>
              )}
              {activite.ma1 === 1  && (
                <p>Mardi matin</p>
              )}
              {activite.ma2 === 1  && (
                <p>Mardi après-midi</p>
              )}
              {activite.me1 === 1  && (
                <p>Mercredi matin</p>
              )}
              {activite.me2  === 1 && (
                <p>Mercredi après-midi</p>
              )}
              {activite.j1  === 1 && (
                <p>Jeudi matin</p>
              )}
              {activite.j2  === 1 && (
                <p>Jeudi après-midi</p>
              )}
              {activite.v1  === 1 && (
                <p>Vendredi matin</p>
              )}
              {activite.v2  === 1 && (
                <p>Vendredi après-midi</p>
              )}
            </li>
          </div>
        </ul>
      </div>
    )
  );
}

export default ActiviteDescr;
