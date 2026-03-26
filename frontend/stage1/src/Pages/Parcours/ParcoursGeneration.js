import { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../config/axiosConfig";
import { useNavigate } from "react-router-dom";
import "../../style/Parcours/Parcours.css";
import {
  getPlanningWeekStatusLabel,
  getPlanningWeekStatusMessage,
} from "../../utils/planningWeekStatus";
import { getAlphabetLabel } from "../../utils/parcoursLabels";

const MOMENT_LABELS = [
  "Lundi Matin",
  "Lundi Apres-midi",
  "Mardi Matin",
  "Mardi Apres-midi",
  "Mercredi Matin",
  "Mercredi Apres-midi",
  "Jeudi Matin",
  "Jeudi Apres-midi",
  "Vendredi Matin",
  "Vendredi Apres-midi",
];

const formatDateLabel = (date) => {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
  }).format(date);
};

const getWeekRangeLabel = (weekStart) => {
  if (!weekStart) {
    return "Aucune semaine selectionnee";
  }

  const startDate = new Date(`${weekStart}T00:00:00`);
  if (Number.isNaN(startDate.getTime())) {
    return "Semaine invalide";
  }

  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 6);

  return `du ${formatDateLabel(startDate)} au ${formatDateLabel(endDate)}`;
};

const isMonday = (weekStart) => {
  if (!weekStart) {
    return false;
  }

  const date = new Date(`${weekStart}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  return date.getDay() === 1;
};

const getParcoursOptionLabel = (index) => {
  return `Parcours ${getAlphabetLabel(index)}`;
};

function ParcoursGeneration(props) {
  const semaine = props.semaine;
  const setSemaine = props.setSemaine;
  const nbEleveMax = props.nbEleveMax;
  const setNbEleveMax = props.setNbEleveMax;

  const [nbParcours, setNbParcours] = useState(() => {
    return localStorage.getItem("nbParcoursGeneration") || "";
  });
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState("");
  const [actionError, setActionError] = useState("");
  const [submittingMode, setSubmittingMode] = useState("");
  const [allActivites, setAllActivites] = useState([]);
  const [fixedActivities, setFixedActivities] = useState([]);
  const [fixedActivitiesError, setFixedActivitiesError] = useState("");
  const [fixedActivitiesLoading, setFixedActivitiesLoading] = useState(false);
  const [fixedActivityForm, setFixedActivityForm] = useState({
    activiteId: "",
    indexMoment: "0",
    scopeType: "all",
    targetParcoursIndexes: [],
  });
  const [fixedActivityActionError, setFixedActivityActionError] = useState("");
  const [fixedActivitySubmitting, setFixedActivitySubmitting] = useState(false);
  const [fixedActivityRefreshKey, setFixedActivityRefreshKey] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem("nbParcoursGeneration", nbParcours);
  }, [nbParcours]);

  useEffect(() => {
    axiosInstance
      .get("/activites")
      .then((response) => {
        setAllActivites(response.data || []);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  useEffect(() => {
    setSummaryLoading(true);
    setSummaryError("");

    axiosInstance
      .get("/parcours/summary", {
        params: {
          nbParcours,
          nbEleveMax,
          weekStart: semaine,
        },
      })
      .then((response) => {
        setSummary(response.data);
      })
      .catch((error) => {
        console.error(error);
        setSummaryError("Le resume de generation n'a pas pu etre charge.");
      })
      .finally(() => {
        setSummaryLoading(false);
      });
  }, [nbParcours, nbEleveMax, semaine, fixedActivityRefreshKey]);

  useEffect(() => {
    if (!semaine) {
      setFixedActivities([]);
      setFixedActivitiesError("");
      return;
    }

    setFixedActivitiesLoading(true);
    setFixedActivitiesError("");

    axiosInstance
      .get("/planningfixedactivities", {
        params: {
          weekStart: semaine,
        },
      })
      .then((response) => {
        setFixedActivities(response.data || []);
      })
      .catch((error) => {
        console.error(error);
        setFixedActivitiesError(
          "Les activites fixees de cette semaine n'ont pas pu etre chargees."
        );
      })
      .finally(() => {
        setFixedActivitiesLoading(false);
      });
  }, [semaine, fixedActivityRefreshKey]);

  const handleGenerate = async (mode) => {
    setActionError("");

    if (mode === "regenerate") {
      const shouldContinue = window.confirm(
        "Cette action va recalculer les parcours de la semaine choisie. Voulez-vous continuer ?"
      );

      if (!shouldContinue) {
        return;
      }
    }

    setSubmittingMode(mode);

    try {
      await axiosInstance.post("/parcours", {
        nbParcours,
        nbEleveMax,
        weekStart: semaine,
        mode,
      });
      navigate("/parcours");
    } catch (error) {
      console.error(error);
      setActionError(
        error.response?.data?.message ||
          "La generation des parcours n'a pas pu etre lancee."
      );
    } finally {
      setSubmittingMode("");
    }
  };

  const handleFixedParcoursToggle = (parcoursIndex) => {
    setFixedActivityForm((currentForm) => {
      const alreadySelected = currentForm.targetParcoursIndexes.includes(
        parcoursIndex
      );

      return {
        ...currentForm,
        targetParcoursIndexes: alreadySelected
          ? currentForm.targetParcoursIndexes.filter(
              (currentIndex) => currentIndex !== parcoursIndex
            )
          : [...currentForm.targetParcoursIndexes, parcoursIndex].sort(
              (a, b) => a - b
            ),
      };
    });
  };

  const handleAddFixedActivity = async (event) => {
    event.preventDefault();
    setFixedActivityActionError("");
    setFixedActivitySubmitting(true);

    try {
      await axiosInstance.post("/planningfixedactivities", {
        weekStart: semaine,
        activiteId: fixedActivityForm.activiteId,
        indexMoment: fixedActivityForm.indexMoment,
        scopeType: fixedActivityForm.scopeType,
        targetParcoursIndexes: fixedActivityForm.targetParcoursIndexes,
        nbParcours,
        nbEleveMax,
      });

      setFixedActivityForm({
        activiteId: "",
        indexMoment: "0",
        scopeType: "all",
        targetParcoursIndexes: [],
      });
      setFixedActivityRefreshKey((currentValue) => currentValue + 1);
    } catch (error) {
      console.error(error);
      setFixedActivityActionError(
        error.response?.data?.message ||
          "L'activite fixee n'a pas pu etre ajoutee."
      );
    } finally {
      setFixedActivitySubmitting(false);
    }
  };

  const handleDeleteFixedActivity = async (fixedActivityId) => {
    const shouldContinue = window.confirm(
      "Voulez-vous supprimer cette activite fixee ?"
    );

    if (!shouldContinue) {
      return;
    }

    setFixedActivityActionError("");

    try {
      await axiosInstance.delete(`/planningfixedactivities/${fixedActivityId}`);
      setFixedActivityRefreshKey((currentValue) => currentValue + 1);
    } catch (error) {
      console.error(error);
      setFixedActivityActionError(
        error.response?.data?.message ||
          "L'activite fixee n'a pas pu etre supprimee."
      );
    }
  };

  const hasWeekPlanning = (summary?.week?.existingParcoursCount || 0) > 0;
  const hasPositiveParcours = Number.parseInt(nbParcours, 10) > 0;
  const hasPositiveGroupSize = Number.parseInt(nbEleveMax, 10) > 0;
  const isFormReady =
    Boolean(semaine) &&
    isMonday(semaine) &&
    hasPositiveParcours &&
    hasPositiveGroupSize;
  const canManageFixedActivities = Boolean(semaine) && hasPositiveParcours && hasPositiveGroupSize;
  const weekStatusLabel = hasWeekPlanning
    ? `${summary?.week?.existingParcoursCount || 0} parcours deja generes pour cette semaine`
    : "Aucun planning genere pour cette semaine";
  const firstEmptyMoment = (summary?.perMomentCompatibleCounts || []).find(
    (moment) => moment.compatibleCount === 0
  );
  const parcoursOptions = useMemo(() => {
    const total = Number.parseInt(nbParcours, 10);

    if (!Number.isInteger(total) || total <= 0) {
      return [];
    }

    return Array.from({ length: total }, (_, index) => index);
  }, [nbParcours]);

  let helperMessage = "Vous pouvez lancer la generation pour cette semaine.";
  let helperTone = "is-info";

  if (!semaine) {
    helperMessage = "Choisissez d'abord la semaine de stage a preparer.";
    helperTone = "is-warning";
  } else if (!isMonday(semaine)) {
    helperMessage =
      "La date choisie n'est pas un lundi. Selectionnez le premier lundi de la semaine.";
    helperTone = "is-warning";
  } else if (!hasPositiveParcours) {
    helperMessage = "Indiquez le nombre de parcours a creer.";
    helperTone = "is-warning";
  } else if (!hasPositiveGroupSize) {
    helperMessage = "Indiquez la taille max par groupe avant de continuer.";
    helperTone = "is-warning";
  } else if (summary?.fixedActivitiesError) {
    helperMessage = summary.fixedActivitiesError;
    helperTone = "is-warning";
  } else if (summary?.counts?.activites === 0) {
    helperMessage =
      "Aucune activite n'est disponible pour le moment. Ajoutez des activites avant de generer.";
    helperTone = "is-warning";
  } else if (summary?.counts?.activitesCompatibles === 0) {
    helperMessage =
      "Les activites existantes ne sont pas compatibles avec la taille de groupe choisie.";
    helperTone = "is-warning";
  } else if (
    summary?.counts?.capaciteGroupes &&
    summary?.counts?.eleves > summary?.counts?.capaciteGroupes
  ) {
    helperMessage =
      "La capacite totale des groupes est insuffisante par rapport au nombre d'eleves inscrits.";
    helperTone = "is-warning";
  } else if (firstEmptyMoment) {
    helperMessage = `Le creneau ${firstEmptyMoment.label} risque d'etre vide avec les parametres actuels.`;
    helperTone = "is-warning";
  } else if (hasWeekPlanning) {
    helperMessage =
      "Cette semaine a deja un planning. Utilisez Regenerer si vous voulez le recalculer.";
    helperTone = "is-info";
  }

  return (
    <div className="generation-page">
      <div className="generation-header">
        <h1>Generer des parcours</h1>
        <p className="generation-subtitle">
          Choisissez les parametres de la semaine, fixez si besoin certains
          creneaux obligatoires, puis laissez l'application completer le reste
          automatiquement.
        </p>
      </div>

      <div className="generation-layout">
        <section className="generation-panel">
          <h2>Pilotage de la semaine</h2>
          <div className="generation-form-grid">
            <div className="label-form">
              <label htmlFor="generation-week-start">
                Semaine choisie (premier lundi)
              </label>
              <input
                id="generation-week-start"
                type="date"
                value={semaine}
                onChange={(e) => setSemaine(e.target.value)}
              />
              <p className="generation-help">{getWeekRangeLabel(semaine)}</p>
            </div>

            <div className="label-form">
              <label htmlFor="generation-nb-parcours">
                Nombre de parcours a creer
              </label>
              <input
                id="generation-nb-parcours"
                type="number"
                min="1"
                value={nbParcours}
                onChange={(e) => setNbParcours(e.target.value)}
              />
            </div>

            <div className="label-form">
              <label htmlFor="generation-nb-eleves">
                Taille max par groupe
              </label>
              <input
                id="generation-nb-eleves"
                type="number"
                min="1"
                value={nbEleveMax}
                onChange={(e) => setNbEleveMax(e.target.value)}
              />
            </div>
          </div>

          <div className="generation-actions">
            <button
              className="btn"
              type="button"
              onClick={() => handleGenerate("generate")}
              disabled={!isFormReady || hasWeekPlanning || submittingMode !== ""}
            >
              {submittingMode === "generate"
                ? "Generation en cours..."
                : "Generer les plannings"}
            </button>

            <button
              className="btn btn-secondary"
              type="button"
              onClick={() => handleGenerate("regenerate")}
              disabled={!isFormReady || !hasWeekPlanning || submittingMode !== ""}
            >
              {submittingMode === "regenerate"
                ? "Regeneration en cours..."
                : "Regenerer les parcours de la semaine"}
            </button>
          </div>

          <p className={`generation-feedback ${helperTone}`}>{helperMessage}</p>

          {actionError && (
            <p className="generation-feedback is-error">{actionError}</p>
          )}
        </section>

        <section className="generation-panel">
          <h2>Etat avant generation</h2>

          {summaryLoading ? (
            <p className="generation-help">Chargement du resume en cours...</p>
          ) : summaryError ? (
            <p className="generation-feedback is-error">{summaryError}</p>
          ) : (
            <>
              <div className="generation-summary-grid">
                <article className="generation-summary-card">
                  <span className="generation-summary-label">Semaine cible</span>
                  <strong>{getWeekRangeLabel(semaine)}</strong>
                  <p>{weekStatusLabel}</p>
                </article>

                <article className="generation-summary-card">
                  <span className="generation-summary-label">Eleves inscrits</span>
                  <strong>{summary?.counts?.eleves ?? 0}</strong>
                  <p>Capacite cible : {summary?.counts?.capaciteGroupes ?? 0}</p>
                </article>

                <article className="generation-summary-card">
                  <span className="generation-summary-label">Activites</span>
                  <strong>{summary?.counts?.activites ?? 0}</strong>
                  <p>
                    Compatibles avec la taille du groupe :{" "}
                    {summary?.counts?.activitesCompatibles ?? 0}
                  </p>
                </article>

                <article className="generation-summary-card">
                  <span className="generation-summary-label">Etat de semaine</span>
                  <strong>
                    {getPlanningWeekStatusLabel(summary?.week?.status)}
                  </strong>
                  <p>{getPlanningWeekStatusMessage(summary?.week)}</p>
                </article>

                <article className="generation-summary-card">
                  <span className="generation-summary-label">Encadrants</span>
                  <strong>{summary?.counts?.encadrants ?? 0}</strong>
                  <p>
                    Realisations compatibles :{" "}
                    {summary?.counts?.realisationsCompatibles ?? 0}
                  </p>
                </article>

                <article className="generation-summary-card">
                  <span className="generation-summary-label">
                    Activites fixees
                  </span>
                  <strong>{summary?.counts?.activitesFixees ?? 0}</strong>
                  <p>Ajoutez des creneaux imposes avant de generer le reste.</p>
                </article>
              </div>

              <div className="generation-moments-card">
                <h3>Disponibilite par creneau</h3>
                <div className="generation-moments-grid">
                  {(summary?.perMomentCompatibleCounts || []).map((moment) => (
                    <div className="generation-moment-pill" key={moment.key}>
                      <span>{moment.label}</span>
                      <strong>{moment.compatibleCount} activite(s)</strong>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </section>
      </div>

      <section className="generation-panel">
        <h2>Activites fixees avant generation</h2>
        <p className="generation-help">
          Utilisez cette zone pour imposer un creneau comme une visite de
          campus ou un atelier obligatoire, puis laissez l'application
          completer les autres cases.
        </p>

        <div className="generation-fixed-layout">
          <div className="generation-fixed-column">
            <h3>Ajouter une activite fixee</h3>
            {canManageFixedActivities ? (
              <form
                className="generation-fixed-form"
                onSubmit={handleAddFixedActivity}
              >
                <div className="label-form">
                  <label htmlFor="fixed-activity-id">Activite</label>
                  <select
                    id="fixed-activity-id"
                    value={fixedActivityForm.activiteId}
                    onChange={(event) =>
                      setFixedActivityForm((currentForm) => ({
                        ...currentForm,
                        activiteId: event.target.value,
                      }))
                    }
                  >
                    <option value="">Choisir une activite</option>
                    {allActivites.map((activite) => (
                      <option key={activite.id} value={activite.id}>
                        {activite.nom}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="label-form">
                  <label htmlFor="fixed-activity-moment">Creneau</label>
                  <select
                    id="fixed-activity-moment"
                    value={fixedActivityForm.indexMoment}
                    onChange={(event) =>
                      setFixedActivityForm((currentForm) => ({
                        ...currentForm,
                        indexMoment: event.target.value,
                      }))
                    }
                  >
                    {MOMENT_LABELS.map((moment, index) => (
                      <option key={moment} value={index}>
                        {moment}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="label-form">
                  <label>Portee</label>
                  <div className="generation-fixed-scope">
                    <label className="generation-radio-option">
                      <input
                        type="radio"
                        name="fixed-scope"
                        checked={fixedActivityForm.scopeType === "all"}
                        onChange={() =>
                          setFixedActivityForm((currentForm) => ({
                            ...currentForm,
                            scopeType: "all",
                            targetParcoursIndexes: [],
                          }))
                        }
                      />
                      Tous les parcours
                    </label>

                    <label className="generation-radio-option">
                      <input
                        type="radio"
                        name="fixed-scope"
                        checked={fixedActivityForm.scopeType === "selected"}
                        onChange={() =>
                          setFixedActivityForm((currentForm) => ({
                            ...currentForm,
                            scopeType: "selected",
                          }))
                        }
                      />
                      Certains parcours
                    </label>
                  </div>
                </div>

                {fixedActivityForm.scopeType === "selected" && (
                  <div className="label-form">
                    <label>Parcours concernes</label>
                    <div className="generation-fixed-checkboxes">
                      {parcoursOptions.map((parcoursIndex) => (
                        <label
                          key={parcoursIndex}
                          className="generation-checkbox-option"
                        >
                          <input
                            type="checkbox"
                            checked={fixedActivityForm.targetParcoursIndexes.includes(
                              parcoursIndex
                            )}
                            onChange={() =>
                              handleFixedParcoursToggle(parcoursIndex)
                            }
                          />
                          {getParcoursOptionLabel(parcoursIndex)}
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  className="btn"
                  type="submit"
                  disabled={fixedActivitySubmitting}
                >
                  {fixedActivitySubmitting
                    ? "Ajout en cours..."
                    : "Ajouter l'activite fixee"}
                </button>
              </form>
            ) : (
              <p className="generation-feedback is-info">
                Choisissez d'abord la semaine, le nombre de parcours et la taille
                max des groupes pour preparer des activites fixees.
              </p>
            )}

            {fixedActivityActionError && (
              <p className="generation-feedback is-error">
                {fixedActivityActionError}
              </p>
            )}
          </div>

          <div className="generation-fixed-column">
            <h3>Activites deja fixees</h3>
            {fixedActivitiesLoading ? (
              <p className="generation-help">
                Chargement des activites fixees...
              </p>
            ) : fixedActivitiesError ? (
              <p className="generation-feedback is-error">
                {fixedActivitiesError}
              </p>
            ) : fixedActivities.length === 0 ? (
              <p className="generation-feedback is-info">
                Aucune activite n'est encore fixee pour cette semaine.
              </p>
            ) : (
              <div className="generation-fixed-list">
                {fixedActivities.map((fixedActivity) => (
                  <article
                    className="generation-fixed-item"
                    key={fixedActivity.id}
                  >
                    <div>
                      <strong>
                        {fixedActivity.activite?.nom || "Activite"}
                      </strong>
                      <p>{MOMENT_LABELS[fixedActivity.indexMoment]}</p>
                      <p>
                        {fixedActivity.scopeType === "all"
                          ? "Tous les parcours"
                          : fixedActivity.targetParcoursIndexes
                              .map((parcoursIndex) =>
                                getParcoursOptionLabel(parcoursIndex)
                              )
                              .join(", ")}
                      </p>
                    </div>
                    <button
                      className="btn btn-secondary"
                      type="button"
                      onClick={() => handleDeleteFixedActivity(fixedActivity.id)}
                    >
                      Supprimer
                    </button>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default ParcoursGeneration;
