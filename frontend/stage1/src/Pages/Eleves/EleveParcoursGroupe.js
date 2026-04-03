import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../../config/axiosConfig";
import EleveGroupe from "../../components/Eleves/EleveGroupe";
import Parc from "../../components/Parcours/Parc";
import "../../style/InternalPages.css";
import "../../style/Eleves/Eleves.css";

function EleveParcoursGroupe(props) {
  const { id } = useParams();
  const semaine = props.semaine;
  const [eleve, setEleve] = useState(null);

  useEffect(() => {
    axiosInstance
      .get(`/eleves/${id}`)
      .then((res) => {
        setEleve(res.data);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [id]);

  return (
    <div className="internal-page">
      <div className="internal-shell">
        <div className="internal-header">
          <p className="internal-eyebrow">Semaine</p>
          <h1 className="internal-title">Parcours et groupe</h1>
          <p className="internal-subtitle">
            Retrouvez ici votre groupe et le detail de votre parcours pour la
            semaine.
          </p>
        </div>

        {eleve?.parcoursId ? (
          <div className="internal-student-grid">
            <section className="internal-student-card">
              <div className="internal-followup-identity">
                <span className="internal-card-label">Groupe</span>
                <h2>Mon groupe</h2>
                <p className="internal-card-text">
                  Telechargez la liste des eleves de votre groupe.
                </p>
              </div>
              <div className="internal-student-card-body">
                <EleveGroupe id={id} eleve={eleve} />
              </div>
            </section>

            <section className="internal-student-card">
              <div className="internal-followup-identity">
                <span className="internal-card-label">Parcours</span>
                <h2>Mon parcours</h2>
                <p className="internal-card-text">
                  Consultez vos activites et telechargez votre planning.
                </p>
              </div>
              <div className="internal-student-card-body">
                <Parc
                  parcoursId={eleve.parcoursId}
                  eleve={eleve}
                  semaine={semaine}
                />
              </div>
            </section>
          </div>
        ) : (
          <div className="internal-empty">
            Votre parcours et votre groupe seront visibles ici une fois votre
            planning attribue.
          </div>
        )}
      </div>
    </div>
  );
}

export default EleveParcoursGroupe;
