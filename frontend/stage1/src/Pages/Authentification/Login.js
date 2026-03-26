import { useState } from "react";
import axiosInstance from "../../config/axiosConfig.js";
import { useParams, useNavigate } from "react-router-dom";
import "../../style/Authentification/Authentification.css";
import "../../style/EntryPages.css";

function Login() {
  const { personne } = useParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const isEleve = personne === "eleves";
  const titre = isEleve ? "Connexion eleve" : "Connexion encadrant-tuteur";
  const accentClass = isEleve ? "is-student" : "is-mentor";

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const data = {
      email: email,
      password: password,
    };

    axiosInstance
      .post(`/authentification/login/${personne}`, data)
      .then((response) => {
        const token = response.data.token;
        const userId = response.data.eleveId
          ? response.data.eleveId
          : response.data.profId;
        localStorage.setItem("token", token);
        localStorage.setItem("userId", userId);
        localStorage.setItem("personne", personne);
        navigate("/");
        window.location.reload();
      })
      .catch((error) => {
        console.error(error);
      });

    setEmail("");
    setPassword("");
  };

  return (
    <div className="entry-page">
      <div className="entry-shell">
        <div className="entry-header">
          <span className={`entry-accent ${accentClass}`}>
            {isEleve ? "Espace eleve" : "Espace encadrant"}
          </span>
          <h1 className={`entry-title ${accentClass}`}>{titre}</h1>
          <p className="entry-subtitle">
            Connectez-vous pour retrouver votre espace personnel et acceder aux
            informations de votre stage.
          </p>
        </div>

        <div className="entry-card is-form contain-form-auth">
          <form onSubmit={handleSubmit} className="entry-form contain-auth">
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={handleEmailChange}
                placeholder="Email"
              />
            </div>

            <div className="form-group">
              <label>Mot de passe</label>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={handlePasswordChange}
                placeholder="Mot de passe"
              />
            </div>

            <div className="entry-form-actions">
              <button className="btn" type="submit">
                Se connecter
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
