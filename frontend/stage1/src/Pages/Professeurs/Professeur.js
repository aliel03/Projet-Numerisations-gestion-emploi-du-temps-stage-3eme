import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../../config/axiosConfig";
import ParcProf from "../../components/Parcours/ParcProf";
import "../../style/Professeurs/Professeurs.css";
import ProfesseurDescr from "../../components/Professeurs/ProfesseurDescr";

function Professeur() {
  const { id } = useParams();

  const userRole = localStorage.getItem("userRole");
  const userId = localStorage.getItem("userId");

  const [professeur, setProfesseur] = useState(null);

  useEffect(() => {
    axiosInstance
      .get(`/professeurs/${id}`)
      .then((res) => {
        setProfesseur(res.data);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  const handleSupprime = () => {
    const confirmation = window.confirm(
      "Êtes-vous sûr de vouloir supprimer ce professeur ?"
    );
    if (confirmation) {
      axiosInstance
        .delete(`professeurs/${id}`)
        .then((res) => {
          window.location.reload();
        })
        .catch((err) => {
          console.error(err);
        });
    }
  };

  return (
    professeur && (
      <div className="contain-professeur">
        <div className="professeur-profile-panel">
            <ProfesseurDescr id={id} />

          {userRole && userRole === "Admin" && (
            <button className="btn" onClick={() => handleSupprime()}>
              Supprimer
            </button>
          )}
        </div>

        {((userRole !== "Tuteur" && userId === id) || userRole === "Admin") && (
          <div className="parcours-prof">
            <h2>Mes parcours</h2>
            <ParcProf profId={id} professeur={professeur} />
          </div>
        )}
      </div>
    )
  );
}

export default Professeur;
