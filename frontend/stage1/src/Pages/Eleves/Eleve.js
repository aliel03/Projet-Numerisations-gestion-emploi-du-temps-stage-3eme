import { useEffect, useState } from "react";
import axiosInstance from "../../config/axiosConfig";
import { useParams } from "react-router-dom";
import Parc from "../../components/Parcours/Parc";
import EleveDescr from "../../components/Eleves/EleveDescr";
import EleveGroupe from "../../components/Eleves/EleveGroupe";
import ElevePdf from "../../components/Eleves/ElevePdf";
import { PDFDownloadLink } from "@react-pdf/renderer";
import "../../style/Eleves/Eleves.css";
import EleveTuteur from "../../components/Eleves/EleveTuteur";

function Eleve(props) {
  const userId = localStorage.getItem("userId");
  const userRole = localStorage.getItem("userRole");
  const personne = localStorage.getItem("personne");

  const nbEleveMax = props.nbEleveMax;
  const semaine = props.semaine;

  let { id } = useParams();
  const isOwnStudentView = personne === "eleves" && String(userId) === String(id);

  const [eleve, setEleve] = useState(null);

  useEffect(() => {
    axiosInstance
      .get(`/eleves/${id}`)
      .then(async (res) => {
        setEleve(res.data);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  const profLien = () => {
    if (eleve && eleve.professeurId) {
      return eleve.professeurId === userId;
    }
    return false;
  };

  const handleValide = (id) => {
    const confirm = window.confirm(
      "Êtes-vous sûr de vouloir valider cet élève ?"
    );

    if (confirm) {
      axiosInstance
        .put(`eleves/confirmation/${id}`)
        .then((res) => {
          window.location.reload();
        })
        .catch((err) => {
          console.error(err);
        });
    }
  };

  const handleSupprime = (id) => {
    const confirmation = window.confirm(
      "Êtes-vous sûr de vouloir supprimer cet élève ?"
    );

    if (confirmation) {
      axiosInstance
        .delete(`eleves/${id}`)
        .then((res) => {
          window.location.reload();
        })
        .catch((err) => {
          console.error(err);
        });
    }
  };

  const handleParcours = (id) => {
    const confirmation = window.confirm(
      "Êtes-vous sûr de vouloir attribuer un parcours à cet élève ?"
    );

    if (confirmation) {
      const data = {
        nbEleveMax: parseInt(nbEleveMax),
        weekStart: semaine,
      };

      axiosInstance
        .put(`eleves/parcours/${id}`, data)
        .then((res) => {
          window.location.reload();
        })
        .catch((err) => {
          console.error(err);
        });
    }
  };

  return (
    eleve && (
      <div className="global-eleve">
        <div className="contain-eleve">
          <div className="contain-eleve-descr">
            <EleveDescr id={id} />
            {userRole === "Admin" && (
              <button className="btn" onClick={() => handleSupprime(eleve.id)}>
                Supprimer
              </button>
            )}
            {((personne === "eleves" && userId === id) ||
              userRole === "Admin" ||
              parseInt(userId) === eleve.professeurId) && (
              <PDFDownloadLink
                className="link pdf"
                document={<ElevePdf id={eleve.id} />}
                fileName={"eleve" + eleve.id + ".pdf"}
              >
                {({ blob, url, loading, error }) =>
                  loading ? (
                    "Téléchargement en cours..."
                  ) : (
                    <>
                      <i className="fa-solid fa-circle-down fa-xl"></i>{" "}
                      Télécharger la fiche élève
                    </>
                  )
                }
              </PDFDownloadLink>
            )}
          </div>

          {userRole === "Admin" && (
            <div className="contain-parcours">
              <h1>Choisir ou modifier le tuteur de l'élève</h1>
              <EleveTuteur id={id} />
            </div>
          )}

          {!isOwnStudentView &&
            ((personne === "eleves" && userId === id) ||
            userRole === "Admin" ||
            parseInt(userId) === eleve.professeurId) &&
            eleve.parcoursId && (
              <div className="groupe-questions">
                <div>
                  <EleveGroupe id={id} eleve={eleve} />
                </div>
              </div>
            )}

          {userRole === "Admin" && (
            <div className="all-btn">
              {!eleve.professeurId && (
                <button className="btn" onClick={() => handleValide(eleve.id)}>
                  Valider
                </button>
              )}

              {!eleve.parcoursId && eleve.professeurId && (
                <button
                  className="btn"
                  onClick={() => handleParcours(eleve.id)}
                >
                  Attribuer un parcours
                </button>
              )}
            </div>
          )}
        </div>
        {!isOwnStudentView && eleve.parcoursId && (
          <div className="contain-parcours">
            <h1>Mon parcours :</h1>
            <Parc parcoursId={eleve.parcoursId} eleve={eleve} semaine={semaine} />
          </div>
        )}
      </div>
    )
  );
}

export default Eleve;
