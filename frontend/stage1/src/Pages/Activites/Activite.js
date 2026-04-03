import { useEffect, useReducer, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axiosInstance from "../../config/axiosConfig";
import ActiviteDescr from "../../components/Activites/ActiviteDescr";
import AjoutActAllParc from "../../components/Activites/AjoutActAllParc";
import AjoutActParc from "../../components/Activites/AjoutActParc";
import SupprimeActParc from "../../components/Activites/SupprimeActParc";
import EleveActivite from "../../components/Activites/EleveActivite";

function Activite(props) {
  let { id } = useParams();

  const userRole = localStorage.getItem("userRole");
  const userId = localStorage.getItem("userId");

  const [activite, setActivite] = useState(null);
  const [commentaireAdmin, setCommentaireAdmin] = useState("");
  const [commentaireFeedback, setCommentaireFeedback] = useState("");

  const handleSupprime = (id) => {
    const confirmation = window.confirm(
      "Êtes-vous sûr de vouloir supprimer cette activité ?"
    );
    if (confirmation) {
      axiosInstance
        .delete(`activites/${id}`)
        .then((res) => {
          window.location.reload();
        })
        .catch((err) => {
          console.error(err);
        });
    }
  };

  useEffect(() => {
    axiosInstance
      .get(`/activites/${id}`)
      .then((res) => {
        setActivite(res.data);
        setCommentaireAdmin(res.data.commentaire_admin || "");
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  const handleSaveCommentaireAdmin = () => {
    if (!activite) {
      return;
    }

    setCommentaireFeedback("");

    axiosInstance
      .put(`/activites/${id}`, {
        ...activite,
        commentaire_admin: commentaireAdmin,
      })
      .then((res) => {
        setActivite(res.data.activite);
        setCommentaireFeedback("Commentaire admin enregistre.");
      })
      .catch((err) => {
        console.error(err);
        setCommentaireFeedback("Impossible d'enregistrer le commentaire admin.");
      });
  };

  return (
    activite && (
      <div className="contain-activite">
        <div className="contain-act-descr">
          <div>
            <ActiviteDescr className="contain-act-descr" id={id} />
            {userRole && userRole === "Admin" && (
              <button
                className="btn supp-act"
                onClick={() => handleSupprime(id)}
              >
                Supprimer l'activité
              </button>
            )}
            {userRole === "Admin" && (
              <div className="label-form">
                <label>Commentaire logistique admin</label>
                <textarea
                  value={commentaireAdmin}
                  onChange={(e) => setCommentaireAdmin(e.target.value)}
                  placeholder="Exemple : carte d'identite obligatoire, rendez-vous devant tel batiment, consigne particuliere..."
                />
                <button className="btn" onClick={handleSaveCommentaireAdmin}>
                  Enregistrer le commentaire
                </button>
                {commentaireFeedback && <p>{commentaireFeedback}</p>}
              </div>
            )}
          </div>
        </div>
        {userRole === "Admin" && (
          <div className="ajout-activite">
            <h2> Ajouter l'activité </h2>
            <div className="ajout-act-parc">
              <AjoutActParc activiteId={id} semaine={props.semaine} />
            </div>
            <div className="ajout-act-parc">
              <AjoutActAllParc activiteId={id} semaine={props.semaine} />
            </div>
            <div className="ajout-act-parc">
              <SupprimeActParc activiteId={id} semaine={props.semaine} />
            </div>
          </div>
        )}
        {((userId && parseInt(userId) === activite.professeurId) ||
          userRole === "Admin") && (
          <div className="elevesActivite">
            <h2>Parcours de l'activité</h2>
            <div className="parc-de-activite">
              {Array.from({ length: 10 }, (_, i) => (
                <div key={i}>
                  <EleveActivite
                    activiteId={id}
                    indexMoment={i}
                    professeurId={activite.professeurId}
                    semaine={props.semaine}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  );
}

export default Activite;
