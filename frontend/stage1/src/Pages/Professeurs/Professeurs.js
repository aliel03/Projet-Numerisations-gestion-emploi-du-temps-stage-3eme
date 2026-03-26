import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosInstance from "../../config/axiosConfig";
import "../../style/InternalPages.css";

function Professeurs() {
  const [professeurs, setProfesseurs] = useState(null);

  useEffect(() => {
    axiosInstance
      .get(`/professeurs`)
      .then((res) => {
        setProfesseurs(res.data);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  const handleSupprimeAll = () => {
    const confirmation = window.confirm(
      "Êtes-vous sûr de vouloir tout supprimer ?"
    );

    if (confirmation) {
      axiosInstance
        .delete("/professeurs")
        .then((res) => {
          window.location.reload();
        })
        .catch((err) => {
          console.error(err);
        });
    }
  };

  const navigate = useNavigate();

  const handleClick = (id) => {
    navigate(`/professeur/${id}`);
  };

  return (
    <div className="internal-page">
      <div className="internal-shell">
        <div className="internal-header">
          <p className="internal-eyebrow">Gestion encadrants</p>
          <h1 className="internal-title">Liste des encadrants et tuteurs</h1>
          <p className="internal-subtitle">
            Retrouvez tous les profils adultes et accedez rapidement a leur fiche detaillee.
          </p>
        </div>

        {professeurs && professeurs.length > 0 ? (
          <div className="internal-card-grid">
            {professeurs.map((prof) => (
              <div
                key={prof.id}
                className="internal-list-card"
                onClick={() => handleClick(prof.id)}
              >
                <span className="internal-card-label">{prof.role}</span>
                <h3>
                  {prof.nom} {prof.prenom}
                </h3>
                <p className="internal-card-text">{prof.email}</p>
                <p className="internal-card-text">Role : {prof.role}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="internal-empty">
            Aucun encadrant ou tuteur n&apos;est disponible pour le moment.
          </div>
        )}

        <div className="internal-actions">
          <Link className="btn internal-action-link" to="/profForm">
            Ajouter un encadrant
          </Link>
          <button className="btn" onClick={handleSupprimeAll}>
            Supprimer les encadrants
          </button>
        </div>
      </div>
    </div>
  );
}

export default Professeurs;
