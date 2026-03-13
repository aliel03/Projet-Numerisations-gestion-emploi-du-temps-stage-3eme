import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../config/axiosConfig";
import ProfesseurFichier from "../../components/Professeurs/ProfesseurFichier";

function ProfForm() {
  const userRole = localStorage.getItem("userRole");
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
  const [successMessage, setSuccessMessage] = useState("");

  const isRoleWithActivity =
    role === "Encadrant" || role === "Encadrant et Tuteur";

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

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

        setSuccessMessage("Inscription enregistrée avec succès.");
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
    <div>
      <h3>Formulaire accueillant</h3>

      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
      {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}

      <form onSubmit={handleSubmit}>
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
          <label>Prénom</label>
          <input
            type="text"
            value={prenom}
            onChange={(e) => setPrenom(e.target.value)}
            placeholder="Prénom"
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
          <label>Numéro de téléphone</label>
          <input
            type="text"
            value={numero_tel}
            onChange={(e) => setNum(e.target.value)}
            placeholder="Numéro de téléphone"
            required
          />
        </div>

        <div className="label-form">
          <label>Métier</label>
          <input
            type="text"
            value={metier}
            onChange={(e) => setMetier(e.target.value)}
            placeholder="Métier"
            required
          />
        </div>

        <div className="label-form">
          <label>Établissement/labo/...</label>
          <input
            type="text"
            value={etablissement}
            onChange={(e) => setEtablissement(e.target.value)}
            placeholder="Établissement..."
            required
          />
        </div>

        <div className="label-form">
          <label>Je souhaite être...</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
          >
            <option value="Encadrant">Encadrant d'une activité</option>
            <option value="Tuteur">Tuteur d'un élève</option>
            <option value="Encadrant et Tuteur">Tuteur et encadrant</option>
            {userRole === "Admin" && <option value="Admin">Admin</option>}
          </select>
        </div>

        {(role === "Tuteur" ||
          role === "Encadrant et Tuteur" ||
          role === "Admin") && (
          <div className="label-form">
            <label>Je souhaite être tuteur de combien d'élèves ?</label>
            <input
              type="number"
              min="0"
              value={nb_eleve_tuteur}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>
        )}

        <button className="btn" type="submit">
          {isRoleWithActivity
            ? "Continuer vers la création d'activité"
            : "Valider"}
        </button>
      </form>

      {userRole === "Admin" && <ProfesseurFichier />}
    </div>
  );
}

export default ProfForm;