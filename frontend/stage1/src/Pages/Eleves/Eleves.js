import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PDFDownloadLink } from '@react-pdf/renderer';
import ElevesPdf from "../../components/Eleves/ElevesPdf";
import axiosInstance from "../../config/axiosConfig";
import "../../style/InternalPages.css";

function Eleves() {
  const userRole = localStorage.getItem("userRole");
  const userId = localStorage.getItem("userId");

  const [eleves, setEleves] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (userRole === "Admin") {
      axiosInstance
        .get("/eleves")
        .then((res) => {
          setEleves(res.data);
        })
        .catch((err) => {
          console.error(err);
        });
    } else if (userRole === "Tuteur" || userRole === "Encadrant et Tuteur") {
      axiosInstance
        .get(`/professeurs/tuteur/${userId}`)
        .then((res) => {
          setEleves(res.data);
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
        .delete("/eleves")
        .then((res) => {
          window.location.reload();
        })
        .catch((err) => {
          console.error(err);
        });
    }
  };

  const handleClick = (id) => {
    navigate(`/eleve/${id}`);
  };

  return (
    <div className="internal-page">
      <div className="internal-shell">
        <div className="internal-header">
          <p className="internal-eyebrow">Gestion eleves</p>
          <h1 className="internal-title">Liste des eleves</h1>
          <p className="internal-subtitle">
            Consultez la liste, ouvrez une fiche eleve ou ajoutez de nouveaux profils.
          </p>
        </div>

        {eleves && eleves.length > 0 ? (
          <div className="internal-card-grid">
            {eleves.map((eleve) => (
              <div
                className="internal-list-card"
                key={eleve.id}
                onClick={() => handleClick(eleve.id)}
              >
                <span className="internal-card-label">Eleve</span>
                <h3>
                  {eleve.nom} {eleve.prenom}
                </h3>
                <p className="internal-card-text">Identifiant : {eleve.id}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="internal-empty">
            Aucun eleve a afficher pour le moment.
          </div>
        )}

        <div className="internal-actions">
          <Link className="btn internal-action-link" to="/eleveForm">
            Ajouter un eleve
          </Link>

          <button className="btn" onClick={handleSupprimeAll}>
            Supprimer les eleves
          </button>
        </div>
      </div>
    </div>
  );
}

export default Eleves;
