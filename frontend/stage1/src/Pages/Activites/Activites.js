import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../../config/axiosConfig";
import "../../style/Activites/Activites.css";
import "../../style/InternalPages.css";

function Activtes() {
  const userRole = localStorage.getItem("userRole");
  const userId = localStorage.getItem("userId");

  const [activites, setActivites] = useState(null);

  useEffect(() => {
    if (userRole === "Admin") {
      axiosInstance
        .get("/activites")
        .then((res) => {
          setActivites(res.data);
        })
        .catch((err) => {
          console.error(err);
        });
    } else if (userRole !== "Tuteur") {
      axiosInstance
        .get(`/activites/encadrant/${userId}`)
        .then((res) => {
          setActivites(res.data);
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }, []);

  const handleSupprimeAll = () => {
    const confirmation = window.confirm(
      "Êtes-vous sûr de vouloir tout supprimer ?"
    );

    if (confirmation) {
      axiosInstance
        .delete("/activites")
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
    navigate(`/activite/${id}`);
  };

  return (
    <div className="internal-page">
      <div className="internal-shell">
        <div className="internal-header">
          <p className="internal-eyebrow">Gestion activites</p>
          <h1 className="internal-title">Liste des activites</h1>
          <p className="internal-subtitle">
            Consultez les activites existantes et ouvrez leur fiche pour gerer les parcours, les eleves et les details.
          </p>
        </div>

        {activites && activites.length > 0 ? (
          <div className="internal-card-grid">
            {activites.map((activite) => (
              <div
                key={activite.id}
                className="internal-list-card"
                onClick={() => handleClick(activite.id)}
              >
                <span className="internal-card-label">Activite</span>
                <h2>{activite.nom}</h2>
              </div>
            ))}
          </div>
        ) : (
          <div className="internal-empty">
            Aucune activite n&apos;est disponible pour le moment.
          </div>
        )}

        {userRole === "Admin" && (
          <div className="internal-actions">
            <Link className="btn internal-action-link" to="/activiteForm">
              Ajouter une activite
            </Link>
            <button className="btn" onClick={handleSupprimeAll}>
              Supprimer les activites
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Activtes;
