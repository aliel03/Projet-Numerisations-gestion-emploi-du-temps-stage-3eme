import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "../../config/axiosConfig";
import "../../style/Activites/Activites.css";

function ActiviteForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const userRole = localStorage.getItem("userRole");

  const injectedProfesseurId = Number(location.state?.professeurId || 0);

  const [nom, setNom] = useState("");
  const [description, setDescription] = useState("");
  const [nbRealisations, setNbRealisations] = useState(0);
  const [nbEleveMax, setNbEleveMax] = useState(0);

  const [l1, setL1] = useState(0);
  const [l2, setL2] = useState(0);
  const [ma1, setMa1] = useState(0);
  const [ma2, setMa2] = useState(0);
  const [me1, setMe1] = useState(0);
  const [me2, setMe2] = useState(0);
  const [j1, setJ1] = useState(0);
  const [j2, setJ2] = useState(0);
  const [v1, setV1] = useState(0);
  const [v2, setV2] = useState(0);

  const [lieu, setLieu] = useState("");
  const [lieuRdv, setLieuRdv] = useState("");
  const [commentaireAdmin, setCommentaireAdmin] = useState("");
  const [professeurId, setProfesseurId] = useState(injectedProfesseurId);

  const [allProfs, setAllProfs] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    axiosInstance
      .get("/professeurs")
      .then((res) => {
        setAllProfs(res.data || []);
      })
      .catch((err) => {
        console.error("Erreur lors du chargement des professeurs :", err);
        setErrorMessage("Impossible de charger la liste des encadrants.");
      });
  }, []);

  const encadrants = useMemo(() => {
    return allProfs.filter(
      (prof) =>
        prof.role === "Encadrant" || prof.role === "Encadrant et Tuteur"
    );
  }, [allProfs]);

  const selectedEncadrant = useMemo(() => {
    return encadrants.find((prof) => prof.id === Number(professeurId));
  }, [encadrants, professeurId]);

  const showEncadrantSelect = !injectedProfesseurId;

  const disponibilites = [
    {
      jour: "Lundi",
      matin: l1,
      setMatin: setL1,
      apresMidi: l2,
      setApresMidi: setL2,
    },
    {
      jour: "Mardi",
      matin: ma1,
      setMatin: setMa1,
      apresMidi: ma2,
      setApresMidi: setMa2,
    },
    {
      jour: "Mercredi",
      matin: me1,
      setMatin: setMe1,
      apresMidi: me2,
      setApresMidi: setMe2,
    },
    {
      jour: "Jeudi",
      matin: j1,
      setMatin: setJ1,
      apresMidi: j2,
      setApresMidi: setJ2,
    },
    {
      jour: "Vendredi",
      matin: v1,
      setMatin: setV1,
      apresMidi: v2,
      setApresMidi: setV2,
    },
  ];

  const toggleDisponibilite = (setter, currentValue) => {
    setter(currentValue === 1 ? 0 : 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!nom.trim()) {
      setErrorMessage("Veuillez renseigner le nom de l'activité.");
      return;
    }

    if (!description.trim()) {
      setErrorMessage("Veuillez renseigner la description de l'activité.");
      return;
    }

    if (!lieu.trim()) {
      setErrorMessage("Veuillez renseigner le lieu de l'activité.");
      return;
    }

    if (!lieuRdv.trim()) {
      setErrorMessage("Veuillez renseigner le lieu de rendez-vous.");
      return;
    }

    if (!professeurId || professeurId === 0) {
      setErrorMessage("Veuillez choisir un encadrant.");
      return;
    }

    const data = {
      nom,
      description,
      nb_realisations: Number(nbRealisations),
      nb_eleve_max: Number(nbEleveMax),
      l1: Number(l1),
      l2: Number(l2),
      ma1: Number(ma1),
      ma2: Number(ma2),
      me1: Number(me1),
      me2: Number(me2),
      j1: Number(j1),
      j2: Number(j2),
      v1: Number(v1),
      v2: Number(v2),
      lieu,
      lieu_rdv: lieuRdv,
      commentaire_admin: commentaireAdmin,
      professeurId: Number(professeurId),
    };

    console.log("DATA ACTIVITE ENVOYEE =", data);

    axiosInstance
      .post("/activites", data)
      .then(() => {
        setSuccessMessage("Activité créée avec succès.");
        navigate("/activites");
      })
      .catch((error) => {
        console.error("Erreur lors de la création de l'activité :", error);

        const backendMessage =
          error?.response?.data?.message ||
          "Impossible de créer l'activité. Vérifiez les champs saisis.";

        setErrorMessage(backendMessage);
      });
  };

  return (
    <div className="activite-form-page">
      <h2>Formulaire d'activité</h2>

      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
      {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}

      <form onSubmit={handleSubmit} className="activite-form">
        <div className="label-form">
          <label>Nom de l'activité</label>
          <input
            type="text"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
          />
        </div>

        <div className="label-form">
          <label>Description de l'activité</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="label-form">
          <label>Nombre de fois que je peux réaliser l'activité</label>
          <input
            type="number"
            min="0"
            value={nbRealisations}
            onChange={(e) => setNbRealisations(e.target.value)}
          />
        </div>

        <div className="label-form">
          <label>
            Nombre d'élèves maximum que je peux accepter à chaque fois
          </label>
          <input
            type="number"
            min="0"
            value={nbEleveMax}
            onChange={(e) => setNbEleveMax(e.target.value)}
          />
        </div>

        <div className="activite-dispo-block">
          <h3 className="activite-dispo-title">Mes disponibilités générales</h3>
          <p className="activite-dispo-subtitle">
            Indiquez les créneaux où cette activité peut être proposée. Le
            planning de la semaine sera construit ensuite à partir de ces
            disponibilités.
          </p>

          <div className="activite-dispo-table-container">
            <table className="activite-dispo-table">
              <thead>
                <tr>
                  <th>Jour</th>
                  <th>Matin</th>
                  <th>Après-midi</th>
                </tr>
              </thead>
              <tbody>
                {disponibilites.map((item) => (
                  <tr key={item.jour}>
                    <td className="activite-dispo-jour">{item.jour}</td>

                    <td className="activite-dispo-cell">
                      <button
                        type="button"
                        className={`activite-dispo-square ${
                          item.matin === 1 ? "is-active" : ""
                        }`}
                        onClick={() =>
                          toggleDisponibilite(item.setMatin, item.matin)
                        }
                        aria-label={`${item.jour} matin`}
                      >
                        {item.matin === 1 ? "✓" : ""}
                      </button>
                    </td>

                    <td className="activite-dispo-cell">
                      <button
                        type="button"
                        className={`activite-dispo-square ${
                          item.apresMidi === 1 ? "is-active" : ""
                        }`}
                        onClick={() =>
                          toggleDisponibilite(
                            item.setApresMidi,
                            item.apresMidi
                          )
                        }
                        aria-label={`${item.jour} après-midi`}
                      >
                        {item.apresMidi === 1 ? "✓" : ""}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="label-form">
          <label>Lieu exact du déroulement de l'activité</label>
          <textarea value={lieu} onChange={(e) => setLieu(e.target.value)} />
        </div>

        <div className="label-form">
          <label>Lieu de rendez-vous avec les stagiaires</label>
          <textarea
            value={lieuRdv}
            onChange={(e) => setLieuRdv(e.target.value)}
          />
        </div>

        {userRole === "Admin" && (
          <div className="label-form">
            <label>Commentaire logistique admin</label>
            <textarea
              value={commentaireAdmin}
              onChange={(e) => setCommentaireAdmin(e.target.value)}
              placeholder="Exemple : carte d'identite obligatoire, rendez-vous devant tel batiment, consigne particuliere..."
            />
          </div>
        )}

        {showEncadrantSelect ? (
          <div className="label-form">
            <label>Encadrant :</label>
            <select
              value={professeurId}
              onChange={(e) => setProfesseurId(Number(e.target.value))}
            >
              <option value={0}>Choisir un encadrant</option>
              {encadrants.map((prof) => (
                <option key={prof.id} value={prof.id}>
                  {prof.nom} {prof.prenom}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="label-form">
            <label>Encadrant sélectionné :</label>
            <input
              type="text"
              value={
                selectedEncadrant
                  ? `${selectedEncadrant.nom} ${selectedEncadrant.prenom}`
                  : `ID ${professeurId}`
              }
              readOnly
            />
          </div>
        )}

        <button className="btn" type="submit">
          Valider
        </button>
      </form>
    </div>
  );
}

export default ActiviteForm;
