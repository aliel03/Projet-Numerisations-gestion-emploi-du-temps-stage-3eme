import axiosInstance from "../../config/axiosConfig";
import { useCallback, useEffect, useState } from "react";
import "../../style/Parcours/Parcours.css";
import PlanningGlobal from "./PlanningGlobal";
import PlanningParcours from "./PlanningParcours";
import {
  buildParcoursLabelMap,
  getParcoursDisplayName,
} from "../../utils/parcoursLabels";
import {
  getPlanningWeekStatusLabel,
  getPlanningWeekStatusMessage,
} from "../../utils/planningWeekStatus";

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

function Parcours(props) {
  const semaine = props.semaine;
  const setSemaine = props.setSemaine;
  const [parcours, setParcours] = useState(null);
  const [planningWeeks, setPlanningWeeks] = useState([]);
  const [vueActive, setVueActive] = useState("globale");
  const [parcoursSelectionne, setParcoursSelectionne] = useState("");
  const [statusActionLoading, setStatusActionLoading] = useState(false);
  const [statusActionError, setStatusActionError] = useState("");

  const loadPlanningWeeks = useCallback(() => {
    axiosInstance
      .get("/planningweeks")
      .then((response) => {
        const weeks = response.data || [];
        setPlanningWeeks(weeks);

        if (!semaine && weeks.length > 0 && setSemaine) {
          setSemaine(weeks[0].weekStart);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }, [setSemaine, semaine]);

  useEffect(() => {
    loadPlanningWeeks();
  }, [loadPlanningWeeks]);

  useEffect(() => {
    if (!semaine) {
      setParcours({});
      return;
    }

    axiosInstance
      .get("/activiteparcours/parcours", {
        params: {
          weekStart: semaine,
        },
      })
      .then((response) => {
        setParcours(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [semaine]);

  useEffect(() => {
    if (!parcours) {
      return;
    }

    const parcoursIds = Object.keys(parcours);
    if (parcoursIds.length > 0 && !parcoursIds.includes(parcoursSelectionne)) {
      setParcoursSelectionne(parcoursIds[0]);
      return;
    }

    if (parcoursIds.length === 0) {
      setParcoursSelectionne("");
    }
  }, [parcours, parcoursSelectionne]);

  const parcoursIds = parcours ? Object.keys(parcours) : [];
  const selectedPlanningWeek =
    planningWeeks.find((planningWeek) => planningWeek.weekStart === semaine) ||
    null;
  const parcoursLabelMap = buildParcoursLabelMap(parcoursIds);
  const hasActivites =
    parcours && Object.values(parcours).some((activites) => activites.length > 0);
  const titreSemaine = semaine
    ? `Les parcours pour la semaine ${getWeekRangeLabel(semaine)}`
    : "Les parcours de la semaine";

  const handleUpdateWeekStatus = (nextStatus) => {
    if (!semaine) {
      return;
    }

    const shouldContinue =
      nextStatus === "valide"
        ? window.confirm(
            "Voulez-vous marquer cette semaine comme validee ?"
          )
        : window.confirm(
            "Voulez-vous repasser cette semaine en brouillon ?"
          );

    if (!shouldContinue) {
      return;
    }

    setStatusActionLoading(true);
    setStatusActionError("");

    axiosInstance
      .put(`/planningweeks/${semaine}/status`, {
        status: nextStatus,
      })
      .then(() => {
        loadPlanningWeeks();
      })
      .catch((error) => {
        console.error(error);
        setStatusActionError(
          error.response?.data?.message ||
            "Le statut de la semaine n'a pas pu etre mis a jour."
        );
      })
      .finally(() => {
        setStatusActionLoading(false);
      });
  };

  return (
    <div className="parcours-page">
      <div className="parcours-header">
        <h1>{titreSemaine}</h1>
        <p className="parcours-subtitle">
          Visualisez la semaine dans une vue globale des activites ou dans une
          vue centree sur un seul parcours.
        </p>
      </div>

      <div className="parcours-week-picker">
        <label htmlFor="planning-week-start">
          Choisir la semaine a afficher :
        </label>
        <input
          id="planning-week-start"
          type="date"
          value={semaine}
          onChange={(e) => setSemaine?.(e.target.value)}
        />
        <p className="parcours-week-help">
          Semaine affichee : {getWeekRangeLabel(semaine)}
        </p>
        {planningWeeks.length > 0 && (
          <p className="parcours-week-help">
            Semaines generees : {planningWeeks.length}
          </p>
        )}
      </div>

      {selectedPlanningWeek && (
        <section className="planning-week-status-card">
          <div>
            <p className="planning-week-status-tag">
              {getPlanningWeekStatusLabel(selectedPlanningWeek.status)}
            </p>
            <h2>Etat de la semaine</h2>
            <p className="planning-week-status-text">
              {getPlanningWeekStatusMessage(selectedPlanningWeek)}
            </p>
          </div>
          <div className="planning-week-status-actions">
            {selectedPlanningWeek.status !== "valide" ? (
              <button
                className="btn"
                type="button"
                disabled={statusActionLoading}
                onClick={() => handleUpdateWeekStatus("valide")}
              >
                Marquer comme validee
              </button>
            ) : (
              <button
                className="btn btn-secondary"
                type="button"
                disabled={statusActionLoading}
                onClick={() => handleUpdateWeekStatus("brouillon")}
              >
                Repasser en brouillon
              </button>
            )}
          </div>
          {statusActionError && (
            <p className="generation-feedback is-error">{statusActionError}</p>
          )}
        </section>
      )}

      <div className="parcours-view-switch">
        <button
          className={`btn ${vueActive === "globale" ? "is-active" : ""}`}
          onClick={() => setVueActive("globale")}
          type="button"
        >
          Vue globale
        </button>
        <button
          className={`btn ${vueActive === "parcours" ? "is-active" : ""}`}
          onClick={() => setVueActive("parcours")}
          type="button"
        >
          Vue parcours
        </button>
      </div>

      {vueActive === "parcours" && (
        <div className="parcours-selection-zone">
          <label htmlFor="parcours-select">Choisir un parcours :</label>
          <select
            id="parcours-select"
            value={parcoursSelectionne}
            onChange={(e) => setParcoursSelectionne(e.target.value)}
          >
            {parcoursIds.map((parcoursId) => (
              <option key={parcoursId} value={parcoursId}>
                {getParcoursDisplayName(parcoursId, parcoursLabelMap)}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="parcours-content-zone">
        {vueActive === "globale" &&
          (hasActivites ? (
            <PlanningGlobal
              parcours={parcours}
              parcoursLabelMap={parcoursLabelMap}
            />
          ) : (
            <section className="parcours-placeholder-zone">
              <h2>Planning global des activites</h2>
              <p>
                Le tableau apparaitra ici des qu&apos;au moins une activite sera
                associee a un parcours depuis la fiche d&apos;une activite.
              </p>
            </section>
          ))}

        {vueActive === "parcours" && (
          parcoursSelectionne ? (
            <PlanningParcours
              parcours={parcours}
              parcoursSelectionne={parcoursSelectionne}
              parcoursLabelMap={parcoursLabelMap}
            />
          ) : (
            <section className="parcours-placeholder-zone">
              <h2>Planning par parcours</h2>
              <p>
                Choisissez un parcours pour afficher son emploi du temps dans le
                tableau.
              </p>
            </section>
          )
        )}

        {parcoursIds.length === 0 && (
          <section className="parcours-placeholder-zone">
            <h2>Aucun parcours exploitable pour le moment</h2>
            <p>
              Aucun parcours n&apos;est encore pret a etre affiche. Verifiez la
              generation des parcours puis associez au moins une activite.
            </p>
          </section>
        )}
      </div>
    </div>
  );
}

export default Parcours;
