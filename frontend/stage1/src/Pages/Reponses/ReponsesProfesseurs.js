import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../../config/axiosConfig";
import ReponsesEncadrant from "../../components/Reponses/ReponsesEncadrant";
import ReponsesTuteur from "../../components/Reponses/ReponsesTuteur";

function ReponsesProfesseurs() {
  const { role, profId } = useParams();

  const [professeurs, setProfesseurs] = useState(null);

  useEffect(() => {
    if (profId) {
      axiosInstance
        .get(`/professeurs/${profId}`)
        .then((res) => {
          setProfesseurs([res.data]);
        })
        .catch((err) => {
          console.error(err);
        });
    } else {
      axiosInstance
        .get(`/professeurs/role/${role}`)
        .then((res) => {
          setProfesseurs(res.data);
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }, [profId, role]);

  const titre =
    role === "Tuteur"
      ? "Les réponses des tuteurs"
      : "Les réponses des encadrants";

  return (
    professeurs &&
    professeurs.length > 0 && (
      <div>
        <h1>{titre}</h1>
        {professeurs.map((prof) => (
          <div key={prof.id}>
            <h3>
              Réponse de {prof.nom} {prof.prenom}
            </h3>
            {role === "Encadrant" ? (
              <ReponsesEncadrant key={prof.id} encadrantId={prof.id} />
            ) : (
              <ReponsesTuteur key={prof.id} tuteurId={prof.id} />
            )}
          </div>
        ))}
      </div>
    )
  );
}

export default ReponsesProfesseurs;
