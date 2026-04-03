import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../config/axiosConfig";
import "../../style/EntryPages.css";

function ProfForm() {
  const navigate = useNavigate();

  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [numero_tel, setNum] = useState("");
  const [metier, setMetier] = useState("");
  const [etablissement, setEtablissement] = useState("");
  const [role, setRole] = useState("Tuteur");
  const [nb_eleve_tuteur, setNombre] = useState(0);
  const [password, setPassword] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const isRoleWithActivity =
    role === "Encadrant" || role === "Encadrant et Tuteur";

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage("");

    const data = {
      nom,
      prenom,
      email,
      numero_tel,
      metier,
      etablissement,
      role,
      nb_eleve_tuteur: Number(nb_eleve_tuteur),
      password,
    };

    console.log("DATA PROF ENVOYEE =", data);

    axiosInstance
      .post("/professeurs", data)
      .then((response) => {
        const createdProf = response.data;
        const createdProfId = createdProf?.id;

        if (isRoleWithActivity && createdProfId) {
          navigate("/activiteForm", {
            state: { professeurId: createdProfId },
          });
          return;
        }

        navigate("/", {
          state: {
            successMessage: "Inscription enregistrée avec succès.",
          },
        });
      })
      .catch((error) => {
        console.error("Erreur lors de la création du professeur :", error);

        const backendMessage =
          error?.response?.data?.message ||
          "Impossible d'enregistrer ce professeur.";

        setErrorMessage(backendMessage);
      });
  };

  return (
    <div className="entry-page">
      <div className="entry-shell">
        <div className="entry-header">
          <span className="entry-accent is-mentor">Espace encadrant</span>
          <h1 className="entry-title is-mentor">Inscription encadrant</h1>
          <p className="entry-subtitle">
            Creez votre profil pour accompagner des eleves, proposer une
            activite ou suivre des eleves selon votre role dans l&apos;appli.
          </p>
        </div>

        {errorMessage && <p className="entry-message is-error">{errorMessage}</p>}

        <div className="entry-card is-form">
          <form onSubmit={handleSubmit} className="entry-form">
            <div className="entry-form-grid">
              <div className="label-form">
                <label>Nom</label>
                <input
                  type="text"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  placeholder="Nom"
                  required
                />
              </div>

              <div className="label-form">
                <label>Prenom</label>
                <input
                  type="text"
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                  placeholder="Prenom"
                  required
                />
              </div>

              <div className="label-form">
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  required
                />
              </div>

              <div className="label-form">
                <label>Mot de passe</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mot de passe"
                  required
                />
              </div>

              <div className="label-form">
                <label>Numero de telephone</label>
                <input
                  type="text"
                  value={numero_tel}
                  onChange={(e) => setNum(e.target.value)}
                  placeholder="Numero de telephone"
                  required
                />
              </div>

              <div className="label-form">
                <label>Metier</label>
                <input
                  type="text"
                  value={metier}
                  onChange={(e) => setMetier(e.target.value)}
                  placeholder="Metier"
                  required
                />
              </div>

              <div className="label-form full-width">
                <label>Etablissement / labo / structure</label>
                <input
                  type="text"
                  value={etablissement}
                  onChange={(e) => setEtablissement(e.target.value)}
                  placeholder="Etablissement..."
                  required
                />
              </div>

              <div className="label-form full-width">
                <label>Je souhaite etre...</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                >
                  <option value="Encadrant">Encadrant d&apos;une activite</option>
                  <option value="Tuteur">Tuteur d&apos;un eleve</option>
                  <option value="Encadrant et Tuteur">
                    Tuteur et encadrant
                  </option>
                </select>
              </div>

              {(role === "Tuteur" || role === "Encadrant et Tuteur") && (
                <div className="label-form full-width">
                  <label>Je souhaite etre tuteur de combien d&apos;eleves ?</label>
                  <input
                    type="number"
                    min="0"
                    value={nb_eleve_tuteur}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                  />
                </div>
              )}
            </div>

            <div className="entry-form-actions">
              <button className="btn" type="submit">
                {isRoleWithActivity
                  ? "Continuer vers la creation d'activite"
                  : "Valider"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ProfForm;
