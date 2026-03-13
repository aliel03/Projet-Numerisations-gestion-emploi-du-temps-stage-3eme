import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "../../config/axiosConfig";
import ActiviteFichier from "../../components/Activites/ActiviteFichier";

function ActiviteForm(props) {
  const userRole = localStorage.getItem("userRole");
  const semaine = props.semaine;
  const navigate = useNavigate();
  const location = useLocation();

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
    <div>
      <h2>Formulaire d'activité</h2>

      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
      {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}

      <form onSubmit={handleSubmit}>
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

        <h3>
          Je suis disponible pour faire cette activité se déroulant la semaine du{" "}
          {semaine}
        </h3>

        <div className="label-form">
          <label>Lundi matin :</label>
          <select value={l1} onChange={(e) => setL1(e.target.value)}>
            <option value={0}>Non</option>
            <option value={1}>Oui</option>
          </select>
        </div>

        <div className="label-form">
          <label>Lundi après-midi :</label>
          <select value={l2} onChange={(e) => setL2(e.target.value)}>
            <option value={0}>Non</option>
            <option value={1}>Oui</option>
          </select>
        </div>

        <div className="label-form">
          <label>Mardi matin :</label>
          <select value={ma1} onChange={(e) => setMa1(e.target.value)}>
            <option value={0}>Non</option>
            <option value={1}>Oui</option>
          </select>
        </div>

        <div className="label-form">
          <label>Mardi après-midi :</label>
          <select value={ma2} onChange={(e) => setMa2(e.target.value)}>
            <option value={0}>Non</option>
            <option value={1}>Oui</option>
          </select>
        </div>

        <div className="label-form">
          <label>Mercredi matin :</label>
          <select value={me1} onChange={(e) => setMe1(e.target.value)}>
            <option value={0}>Non</option>
            <option value={1}>Oui</option>
          </select>
        </div>

        <div className="label-form">
          <label>Mercredi après-midi :</label>
          <select value={me2} onChange={(e) => setMe2(e.target.value)}>
            <option value={0}>Non</option>
            <option value={1}>Oui</option>
          </select>
        </div>

        <div className="label-form">
          <label>Jeudi matin :</label>
          <select value={j1} onChange={(e) => setJ1(e.target.value)}>
            <option value={0}>Non</option>
            <option value={1}>Oui</option>
          </select>
        </div>

        <div className="label-form">
          <label>Jeudi après-midi :</label>
          <select value={j2} onChange={(e) => setJ2(e.target.value)}>
            <option value={0}>Non</option>
            <option value={1}>Oui</option>
          </select>
        </div>

        <div className="label-form">
          <label>Vendredi matin :</label>
          <select value={v1} onChange={(e) => setV1(e.target.value)}>
            <option value={0}>Non</option>
            <option value={1}>Oui</option>
          </select>
        </div>

        <div className="label-form">
          <label>Vendredi après-midi :</label>
          <select value={v2} onChange={(e) => setV2(e.target.value)}>
            <option value={0}>Non</option>
            <option value={1}>Oui</option>
          </select>
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

      {userRole === "Admin" && <ActiviteFichier />}
    </div>
  );
}

export default ActiviteForm;