import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../config/axiosConfig";
import EleveFichier from "../../components/Eleves/EleveFichier";
import "../../style/EntryPages.css";

function EleveForm() {
  const userRole = localStorage.getItem("userRole");

  const [eleve, setEleve] = useState(null);
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [numero_tel, setNum] = useState("");
  const [numero_tel_parent, setNumParent] = useState("");
  const [adress, setAdress] = useState("");
  const [etablissement, setEtablissement] = useState("");
  const [password, setPassword] = useState("");

  const history = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    const data = {
      nom,
      prenom,
      email,
      numero_tel,
      numero_tel_parent,
      adress,
      etablissement,
      password
    };

    axiosInstance
      .post("/eleves", data)
      .then((response) => {
        setNom("");
        setPrenom("");
        setEmail("");
        setNum("");
        setNumParent("");
        setAdress("");
        setEtablissement("");
        setPassword("");

        setEleve(response.data);

        history("/eleveCreation");
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <div className="entry-page">
      <div className="entry-shell">
        <div className="entry-header">
          <span className="entry-accent is-student">Espace eleve</span>
          <h1 className="entry-title is-student">Inscription eleve</h1>
          <p className="entry-subtitle">
            Renseignez vos informations pour creer votre acces a l&apos;application.
          </p>
        </div>

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
                <label>Numero de telephone d&apos;un parent</label>
                <input
                  type="text"
                  value={numero_tel_parent}
                  onChange={(e) => setNumParent(e.target.value)}
                  placeholder="Numero parent"
                  required
                />
              </div>
              <div className="label-form full-width">
                <label>Adresse</label>
                <input
                  type="text"
                  value={adress}
                  onChange={(e) => setAdress(e.target.value)}
                  placeholder="Adresse"
                  required
                />
              </div>
              <div className="label-form full-width">
                <label>Etablissement</label>
                <input
                  type="text"
                  value={etablissement}
                  onChange={(e) => setEtablissement(e.target.value)}
                  placeholder="Etablissement"
                  required
                />
              </div>
            </div>

            <div className="entry-form-actions">
              <button className="btn" type="submit">
                Valider
              </button>
            </div>
          </form>
        </div>
      </div>
      {userRole && userRole === "Admin" && <EleveFichier />}
    </div>
  );
}

export default EleveForm;
