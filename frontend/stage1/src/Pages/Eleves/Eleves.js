import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../../config/axiosConfig";
import EleveDescr from "../../components/Eleves/EleveDescr";
import "../../style/InternalPages.css";

function Eleves() {
  const userRole = localStorage.getItem("userRole");
  const userId = localStorage.getItem("userId");
  const isAdmin = userRole === "Admin";
  const hasTuteurRole = userRole === "Tuteur" || userRole === "Encadrant et Tuteur";
  const isEvaluationView = hasTuteurRole;

  const [eleves, setEleves] = useState(null);
  const [semaine, setSemaine] = useState(() => {
    return localStorage.getItem("semaineStage") || "";
  });
  const [nbEleveMax, setNbEleveMax] = useState(() => {
    return localStorage.getItem("nbEleveMax") || "";
  });
  const [weekParcoursIds, setWeekParcoursIds] = useState([]);
  const [actionMessage, setActionMessage] = useState("");
  const [actionError, setActionError] = useState("");
  const [submittingAction, setSubmittingAction] = useState("");

  const navigate = useNavigate();

  const buildActionMessage = (actionKey, response) => {
    const summary = response.data?.summary;

    if (!summary) {
      return response.data?.message || "Action terminee.";
    }

    if (actionKey === "validate-all") {
      return `${summary.assignedCount} eleve(s) ont recu un tuteur. ${summary.unavailableCount} eleve(s) restent en attente faute de capacite.`;
    }

    if (actionKey === "assign-parcours-all") {
      return `${summary.assignedCount} eleve(s) ont ete relies a la semaine ${semaine}.`;
    }

    if (actionKey === "prepare-week") {
      return `${summary.readyCount} eleve(s) sur ${summary.totalEleves} sont maintenant prets pour la connexion a la semaine ${semaine}.`;
    }

    return response.data?.message || "Action terminee.";
  };

  const loadEleves = useCallback(() => {
    if (isAdmin) {
      axiosInstance
        .get("/eleves")
        .then((res) => {
          setEleves(res.data);
        })
        .catch((err) => {
          console.error(err);
        });
      return;
    }

    if (userRole === "Tuteur") {
      axiosInstance
        .get(`/professeurs/tuteur/${userId}`)
        .then((res) => {
          setEleves(res.data);
        })
        .catch((err) => {
          console.error(err);
        });
      return;
    }

    if (!isAdmin && !hasTuteurRole) {
      setEleves([]);
    }
  }, [hasTuteurRole, isAdmin, userId, userRole]);

  useEffect(() => {
    loadEleves();
  }, [loadEleves]);

  useEffect(() => {
    localStorage.setItem("semaineStage", semaine);
  }, [semaine]);

  useEffect(() => {
    if (nbEleveMax) {
      localStorage.setItem("nbEleveMax", nbEleveMax);
    }
  }, [nbEleveMax]);

  useEffect(() => {
    if (!isAdmin || !semaine) {
      setWeekParcoursIds([]);
      return;
    }

    axiosInstance
      .get("/activiteparcours/parcours", {
        params: {
          weekStart: semaine,
        },
      })
      .then((res) => {
        setWeekParcoursIds(Object.keys(res.data || {}));
      })
      .catch((err) => {
        console.error(err);
        setWeekParcoursIds([]);
      });
  }, [isAdmin, semaine]);

  const handleSupprimeAll = () => {
    const confirmation = window.confirm(
      "Êtes-vous sûr de vouloir tout supprimer ?"
    );

    if (confirmation) {
      axiosInstance
        .delete("/eleves")
        .then(() => {
          window.location.reload();
        })
        .catch((err) => {
          console.error(err);
        });
    }
  };

  const handleClick = (id) => {
    navigate(`/eleve/${id}`);
  };

  const runAdminAction = async (actionKey, actionLabel, request) => {
    setActionMessage("");
    setActionError("");
    setSubmittingAction(actionKey);

    try {
      const response = await request();
      setActionMessage(buildActionMessage(actionKey, response));
      loadEleves();
    } catch (error) {
      console.error(error);
      setActionError(
        error.response?.data?.message ||
          `${actionLabel} n'a pas pu etre finalisee.`
      );
    } finally {
      setSubmittingAction("");
    }
  };

  const handleValidateAll = () => {
    const shouldContinue = window.confirm(
      "Attribuer automatiquement un tuteur a tous les eleves qui n'en ont pas ?"
    );

    if (!shouldContinue) {
      return;
    }

    runAdminAction("validate-all", "La validation globale", () =>
      axiosInstance.put("/eleves/confirmation")
    );
  };

  const handleAssignParcoursAll = () => {
    const shouldContinue = window.confirm(
      "Attribuer les parcours de la semaine choisie a tous les eleves eligibles ?"
    );

    if (!shouldContinue) {
      return;
    }

    runAdminAction("assign-parcours-all", "L'attribution globale des parcours", () =>
      axiosInstance.put("/eleves/parcours", {
        nbEleveMax,
        weekStart: semaine,
      })
    );
  };

  const handlePrepareWeek = () => {
    const shouldContinue = window.confirm(
      "Preparer la semaine des eleves : attribuer les tuteurs manquants puis les parcours de la semaine choisie ?"
    );

    if (!shouldContinue) {
      return;
    }

    runAdminAction("prepare-week", "La preparation de semaine", () =>
      axiosInstance.put("/eleves/prepare-week", {
        nbEleveMax,
        weekStart: semaine,
      })
    );
  };

  const statusSummary = useMemo(() => {
    const weekParcoursIdSet = new Set(weekParcoursIds.map((id) => Number.parseInt(id, 10)));
    const allEleves = eleves || [];

    return {
      total: allEleves.length,
      withTutor: allEleves.filter((eleve) => Boolean(eleve.professeurId)).length,
      withWeekParcours: allEleves.filter((eleve) =>
        weekParcoursIdSet.has(Number.parseInt(eleve.parcoursId, 10))
      ).length,
      ready: allEleves.filter((eleve) => {
        return (
          Boolean(eleve.professeurId) &&
          weekParcoursIdSet.has(Number.parseInt(eleve.parcoursId, 10))
        );
      }).length,
    };
  }, [eleves, weekParcoursIds]);

  const isWeekReady = Boolean(semaine) && Number.parseInt(nbEleveMax, 10) > 0;
  const weekParcoursIdSet = new Set(weekParcoursIds.map((id) => Number.parseInt(id, 10)));

  return (
    <div className="internal-page">
      <div className="internal-shell">
        <div className="internal-header">
          <p className="internal-eyebrow">Gestion eleves</p>
          <h1 className="internal-title">
            {isAdmin ? "Liste des eleves" : "Mes eleves"}
          </h1>
          <p className="internal-subtitle">
            {isAdmin
              ? "Consultez la liste, ouvrez une fiche eleve ou preparez une semaine complete en quelques clics."
              : "Retrouvez ici les eleves qui vous sont rattaches et consultez simplement leur fiche."}
          </p>
        </div>

        {isAdmin && (
          <section className="internal-admin-panel">
            <div className="internal-admin-panel-header">
              <div>
                <p className="internal-eyebrow">Pilotage admin</p>
                <h2 className="internal-panel-title">Preparation globale des eleves</h2>
              </div>
              <p className="internal-card-text">
                Conservez les actions individuelles sur chaque fiche eleve, mais
                pilotez aussi la semaine dans son ensemble depuis cette page.
              </p>
            </div>

            <div className="internal-form-grid">
              <div className="internal-form-field">
                <label htmlFor="eleves-week-start">Semaine cible</label>
                <input
                  id="eleves-week-start"
                  type="date"
                  value={semaine}
                  onChange={(event) => setSemaine(event.target.value)}
                />
              </div>

              <div className="internal-form-field">
                <label htmlFor="eleves-group-size">Taille max par groupe</label>
                <input
                  id="eleves-group-size"
                  type="number"
                  min="1"
                  value={nbEleveMax}
                  onChange={(event) => setNbEleveMax(event.target.value)}
                />
              </div>
            </div>

            <div className="internal-summary-grid">
              <article className="internal-summary-card">
                <span className="internal-card-label">Eleves</span>
                <strong>{statusSummary.total}</strong>
                <p className="internal-card-text">Profils disponibles dans la liste.</p>
              </article>

              <article className="internal-summary-card">
                <span className="internal-card-label">Tuteurs</span>
                <strong>{statusSummary.withTutor}</strong>
                <p className="internal-card-text">Eleves avec un tuteur attribue.</p>
              </article>

              <article className="internal-summary-card">
                <span className="internal-card-label">Parcours</span>
                <strong>{statusSummary.withWeekParcours}</strong>
                <p className="internal-card-text">
                  Eleves relies a la semaine {semaine || "selectionnee"}.
                </p>
              </article>

              <article className="internal-summary-card">
                <span className="internal-card-label">Prets</span>
                <strong>{statusSummary.ready}</strong>
                <p className="internal-card-text">
                  Eleves prets pour se connecter a la semaine cible.
                </p>
              </article>
            </div>

            <div className="internal-actions">
              <button
                className="btn"
                type="button"
                disabled={submittingAction !== ""}
                onClick={handleValidateAll}
              >
                {submittingAction === "validate-all"
                  ? "Validation en cours..."
                  : "Valider tous les eleves"}
              </button>

              <button
                className="btn"
                type="button"
                disabled={!isWeekReady || submittingAction !== ""}
                onClick={handleAssignParcoursAll}
              >
                {submittingAction === "assign-parcours-all"
                  ? "Attribution en cours..."
                  : "Attribuer les parcours a tous les eleves"}
              </button>

              <button
                className="btn"
                type="button"
                disabled={!isWeekReady || submittingAction !== ""}
                onClick={handlePrepareWeek}
              >
                {submittingAction === "prepare-week"
                  ? "Preparation en cours..."
                  : "Preparer la semaine des eleves"}
              </button>
            </div>

            {!isWeekReady && (
              <p className="internal-feedback">
                Choisis d'abord une semaine et une taille max par groupe pour les
                actions de parcours.
              </p>
            )}

            {actionMessage && (
              <p className="internal-feedback is-success">{actionMessage}</p>
            )}

            {actionError && (
              <p className="internal-feedback is-error">{actionError}</p>
            )}
          </section>
        )}

        {eleves && eleves.length > 0 && isAdmin ? (
          <div className="internal-card-grid">
            {eleves.map((eleve) => {
              const hasTutor = Boolean(eleve.professeurId);
              const hasWeekParcours = weekParcoursIdSet.has(
                Number.parseInt(eleve.parcoursId, 10)
              );
              const isReadyForConnexion = hasTutor && hasWeekParcours;

              return (
                <div
                  className="internal-list-card"
                  key={eleve.id}
                  onClick={() => handleClick(eleve.id)}
                >
                  <span className="internal-card-label">Eleve</span>
                  <h3>
                    {eleve.nom} {eleve.prenom}
                  </h3>
                  <p className="internal-card-text">Identifiant : {eleve.id}</p>
                  <div className="internal-status-list">
                    <span
                      className={`internal-status-pill ${
                        hasTutor ? "is-ready" : "is-pending"
                      }`}
                    >
                      {hasTutor ? "Tuteur attribue" : "Tuteur a attribuer"}
                    </span>

                    <span
                      className={`internal-status-pill ${
                        hasWeekParcours ? "is-ready" : "is-pending"
                      }`}
                    >
                      {hasWeekParcours
                        ? "Parcours attribue"
                        : "Parcours a attribuer"}
                    </span>

                    <span
                      className={`internal-status-pill ${
                        isReadyForConnexion ? "is-ready" : "is-pending"
                      }`}
                    >
                      {isReadyForConnexion
                        ? "Pret pour connexion"
                        : "Preparation incomplete"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : eleves && eleves.length > 0 && isEvaluationView ? (
          <section className="internal-mentor-panel">
            <div className="internal-mentor-grid">
              {eleves.map((eleve) => (
                <article className="internal-mentor-card" key={eleve.id}>
                  <EleveDescr id={eleve.id} />
                </article>
              ))}
            </div>
          </section>
        ) : (
          <div className="internal-empty">
            Aucun eleve a afficher pour le moment.
          </div>
        )}

        {isAdmin && (
          <div className="internal-actions">
            <Link className="btn internal-action-link" to="/eleveForm">
              Ajouter un eleve
            </Link>

            <button className="btn" onClick={handleSupprimeAll}>
              Supprimer les eleves
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Eleves;
