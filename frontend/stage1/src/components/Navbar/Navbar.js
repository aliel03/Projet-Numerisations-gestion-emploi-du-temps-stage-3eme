import "../../style/Navbar/Navbar.css";
import "@fortawesome/fontawesome-svg-core";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

function Navbar(props) {
  const user = props.user;
  const setUser = props.setUser;
  const personne = props.personne;

  const navigate = useNavigate();

  const [open, setEtat] = useState(true); //Pour l'ouverture de la navbar

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("personne");
    localStorage.removeItem("userId");
    setUser(null);
    navigate("/");
  };

  return (
    <nav className="nav">
      <Link className="link logo" to="/" aria-label="DigiFilles">
        <img className="logo-image" src="/digifilles.png" alt="DigiFilles" />
      </Link>

      <div>
        <ul id="navbar" className={open ? "navbar active" : "navbar"}>
          {!user ? (
            <>
              <li>
                <Link className="link" to="/login/professeurs">
                  Se connecter : Encadrant-tuteur
                </Link>
              </li>
              <li>
                <Link className="link" to="/login/eleves">
                  Se connecter : Élève
                </Link>
              </li>
            </>
          ) : personne === "professeurs" ? (
            user && user.role && user.role === "Admin" ? (
              <>
                <li>
                  <Link className="link" to="/eleves">
                    Liste des élèves
                  </Link>
                </li>
                <li>
                  <Link className="link" to="/professeurs">
                    Liste des encadrants
                  </Link>
                </li>
                <li>
                  <Link className="link" to="/activites">
                    Liste des Activités
                  </Link>
                </li>
                <li>
                  <Link className="link" to="/parcoursGeneration">
                    Générer des parcours
                  </Link>
                </li>
                <li>
                  <Link className="link" to="/parcours">
                    Liste des Parcours
                  </Link>
                </li>
                <li>
                  <button className="btn nav-logout-btn" onClick={handleSignOut}>
                    Se deconnecter
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link className="link" to={`/professeur/${user.id}`}>
                    Profil
                  </Link>
                </li>
                {user.role !== "Tuteur" && (
                  <li>
                    <Link className="link" to="/activites">
                      Mes activites
                    </Link>
                  </li>
                )}
                <li>
                  <button className="btn nav-logout-btn" onClick={handleSignOut}>
                    Se deconnecter
                  </button>
                </li>
              </>
            )
          ) : (
            <>
              <li>
                <Link className="link" to={`/eleve/${user.id}`}>
                  Profil
                </Link>
              </li>
              <li>
                <Link className="link" to={`/eleve/${user.id}/parcours-groupe`}>
                  Parcours et groupe
                </Link>
              </li>
              <li>
                <Link className="link" to={`/professeur/${user.professeurId}`}>
                  Mon tuteur
                </Link>
              </li>
              <li>
                <button className="btn nav-logout-btn" onClick={handleSignOut}>
                  Se deconnecter
                </button>
              </li>
            </>
          )}
        </ul>
      </div>

      <div className="mobile">
        <i
          id="bar"
          className={open ? "fa-solid fa-bars" : "fas fa-times"}
          onClick={() => setEtat(!open)}
        ></i>
      </div>
    </nav>
  );
}

export default Navbar;
