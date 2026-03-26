import React from "react";
import { Link } from "react-router-dom";
import "../../style/EntryPages.css";

function Home(props) {
  const user = props.user;
  if (!user) {
    return (
      <div className="entry-page">
        <div className="entry-shell">
          <div className="entry-header">
            <p className="entry-eyebrow">DigiFilles</p>
            <h1 className="entry-title">Choisissez votre espace</h1>
            <p className="entry-subtitle">
              Retrouvez un point d&apos;entree commun pour les inscriptions et
              les connexions, avec une experience plus lisible pour les eleves
              comme pour les encadrants et tuteurs.
            </p>
          </div>

          <div className="entry-grid">
            <section className="entry-card entry-option">
              <span className="entry-accent is-mentor">Espace encadrant</span>
              <h2 className="entry-option-title is-mentor">
                Encadrants et tuteurs
              </h2>
              <p className="entry-option-text">
                Creez un compte pour proposer une activite, suivre des eleves
                ou acceder a votre espace professionnel.
              </p>
              <div className="entry-option-actions">
                <Link className="entry-link-btn is-secondary" to="/profForm">
                  S&apos;inscrire
                </Link>
                <Link
                  className="entry-link-btn is-ghost"
                  to="/login/professeurs"
                >
                  Se connecter
                </Link>
              </div>
            </section>

            <section className="entry-card entry-option">
              <span className="entry-accent is-student">Espace eleve</span>
              <h2 className="entry-option-title is-student">Eleves</h2>
              <p className="entry-option-text">
                Inscrivez-vous pour consulter vos informations, votre groupe,
                votre emploi du temps et votre tuteur.
              </p>
              <div className="entry-option-actions">
                <Link className="entry-link-btn is-primary" to="/eleveForm">
                  S&apos;inscrire
                </Link>
                <Link className="entry-link-btn is-ghost" to="/login/eleves">
                  Se connecter
                </Link>
              </div>
            </section>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="entry-page">
      <div className="entry-shell">
        <section className="entry-card entry-user-home">
          <p className="entry-eyebrow">Tableau de bord</p>
          <h1 className="entry-title">Salut {user.prenom}</h1>
          <p className="entry-subtitle">
            Bienvenue sur votre espace. Utilisez la navigation pour acceder a
            vos informations, vos activites, vos parcours ou vos questionnaires.
          </p>
        </section>
      </div>
    </div>
  );
}

export default Home;
