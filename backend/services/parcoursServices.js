const Parcours = require("../models/Parcours");
const Activite = require("../models/Activite");
const ActiviteParcours = require("../models/ActiviteParcours");
const Eleve = require("../models/Eleve");
const Professeur = require("../models/Professeur");
const associeParcoursActivite = require("../utilities/GénérationParcours/parcoursFunctions");
const planningWeekServices = require("./planningWeekServices");
const planningFixedActivityServices = require("./planningFixedActivityServices");
const { Op } = require("sequelize");

const MOMENT_FIELDS = ["l1", "l2", "ma1", "ma2", "me1", "me2", "j1", "j2", "v1", "v2"];
const MOMENT_LABELS = [
  "Lundi matin",
  "Lundi apres-midi",
  "Mardi matin",
  "Mardi apres-midi",
  "Mercredi matin",
  "Mercredi apres-midi",
  "Jeudi matin",
  "Jeudi apres-midi",
  "Vendredi matin",
  "Vendredi apres-midi",
];
const ENCADRANT_ROLES = ["Encadrant", "Encadrant et Tuteur"];

const parsePositiveInteger = (value) => {
  const parsedValue = Number.parseInt(value, 10);

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    return null;
  }

  return parsedValue;
};

const parseDateOnly = (dateString) => {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const isValidDateOnly = (dateString) => {
  if (!dateString) {
    return false;
  }

  const parsedDate = parseDateOnly(dateString);
  return !Number.isNaN(parsedDate.getTime());
};

const isMonday = (dateString) => {
  if (!isValidDateOnly(dateString)) {
    return false;
  }

  return parseDateOnly(dateString).getDay() === 1;
};

const formatGenerationAlerts = ({
  weekStart,
  nbParcours,
  nbEleveMax,
  elevesCount,
  activitesCount,
  encadrantsCount,
  compatibleActivitesCount,
  emptyMomentLabels,
  totalGroupCapacity,
  totalCompatibleSessions,
  existingParcoursCount,
  weekStatus,
  hasManualAdjustments,
}) => {
  const alerts = [];

  if (!weekStart) {
    alerts.push({
      type: "warning",
      message: "Choisissez une semaine de stage avant de lancer la generation.",
    });
  } else if (!isValidDateOnly(weekStart)) {
    alerts.push({
      type: "warning",
      message: "La date de semaine choisie est invalide.",
    });
  } else if (!isMonday(weekStart)) {
    alerts.push({
      type: "warning",
      message: "La semaine doit commencer un lundi pour rester coherente avec le planning.",
    });
  }

  if (!nbParcours) {
    alerts.push({
      type: "warning",
      message: "Indiquez un nombre de parcours strictement positif.",
    });
  }

  if (!nbEleveMax) {
    alerts.push({
      type: "warning",
      message: "Indiquez une taille maximale de groupe strictement positive.",
    });
  }

  if (elevesCount === 0) {
    alerts.push({
      type: "warning",
      message: "Aucun eleve n'est inscrit pour le moment.",
    });
  }

  if (activitesCount === 0) {
    alerts.push({
      type: "warning",
      message: "Aucune activite n'est disponible pour construire un planning.",
    });
  }

  if (encadrantsCount === 0) {
    alerts.push({
      type: "warning",
      message: "Aucun encadrant n'est disponible pour les activites.",
    });
  }

  if (nbEleveMax && compatibleActivitesCount === 0) {
    alerts.push({
      type: "warning",
      message:
        "Aucune activite n'a une capacite suffisante pour la taille de groupe choisie.",
    });
  }

  if (nbEleveMax && emptyMomentLabels.length > 0) {
    alerts.push({
      type: "warning",
      message: `Des creneaux risquent d'etre vides : ${emptyMomentLabels.join(", ")}.`,
    });
  }

  if (totalGroupCapacity !== null && elevesCount > totalGroupCapacity) {
    alerts.push({
      type: "warning",
      message:
        "La capacite totale des groupes est inferieure au nombre d'eleves inscrits.",
    });
  }

  if (
    nbParcours &&
    totalCompatibleSessions !== null &&
    totalCompatibleSessions < nbParcours * MOMENT_FIELDS.length
  ) {
    alerts.push({
      type: "warning",
      message:
        "Le nombre de realisations compatibles semble insuffisant pour remplir tous les creneaux de tous les parcours.",
    });
  }

  if (existingParcoursCount > 0) {
    alerts.push({
      type: "info",
      message:
        "Cette semaine possede deja un planning genere. Utilisez le bouton de regeneration si vous voulez le recalculer.",
    });
  }

  if (weekStatus === "valide") {
    alerts.push({
      type: "info",
      message:
        "Cette semaine est actuellement marquee comme validee. Toute retouche manuelle la fera repasser en brouillon.",
    });
  }

  if (hasManualAdjustments) {
    alerts.push({
      type: "info",
      message:
        "Le planning de cette semaine a deja ete modifie manuellement apres generation.",
    });
  }

  if (alerts.length === 0) {
    alerts.push({
      type: "success",
      message:
        "Les informations de base sont suffisantes pour lancer une premiere generation automatique.",
    });
  }

  return alerts;
};

exports.validateGenerationPayload = async ({
  nbParcours,
  nbEleveMax,
  weekStart,
  mode = "generate",
}) => {
  const normalizedNbParcours = parsePositiveInteger(nbParcours);
  const normalizedNbEleveMax = parsePositiveInteger(nbEleveMax);

  if (!normalizedNbParcours) {
    throw new Error("Le nombre de parcours doit etre un entier strictement positif.");
  }

  if (!normalizedNbEleveMax) {
    throw new Error(
      "La taille maximale des groupes doit etre un entier strictement positif."
    );
  }

  if (!weekStart || !isValidDateOnly(weekStart)) {
    throw new Error("La semaine choisie est invalide.");
  }

  if (!isMonday(weekStart)) {
    throw new Error("La semaine de stage doit commencer un lundi.");
  }

  const planningWeek = await planningWeekServices.getPlanningWeekByStart(weekStart);
  const existingParcoursCount = planningWeek
    ? await Parcours.count({
        where: {
          planningWeekId: planningWeek.id,
        },
      })
    : 0;

  if (mode === "generate" && existingParcoursCount > 0) {
    throw new Error(
      "Un planning existe deja pour cette semaine. Utilisez la regeneration pour le recalculer."
    );
  }

  if (mode === "regenerate" && existingParcoursCount === 0) {
    throw new Error("Aucun planning existant n'a ete trouve pour cette semaine.");
  }

  return {
    nbParcours: normalizedNbParcours,
    nbEleveMax: normalizedNbEleveMax,
    weekStart,
  };
};

exports.getAllParcours = async (weekStart) => {
  const where = {};

  if (weekStart) {
    const planningWeek = await planningWeekServices.getPlanningWeekByStart(
      weekStart
    );

    if (!planningWeek) {
      return [];
    }

    where.planningWeekId = planningWeek.id;
  }

  const allParcours = await Parcours.findAll({
    where,
    order: [["id", "ASC"]],
  });
  return allParcours;
};

//les activités d'un parcours
exports.getActivitesByParcours = async (parcoursId) => {
  const actOfParcours = await Activite.findAll({
    where: {
      parcoursId: parcoursId,
    },
  });
  return actOfParcours;
};

exports.getGenerationSummary = async (nbParcours, nb_eleve_max, weekStart) => {
  const normalizedNbParcours = parsePositiveInteger(nbParcours);
  const normalizedNbEleveMax = parsePositiveInteger(nb_eleve_max);

  const [elevesCount, activites, encadrantsCount] = await Promise.all([
    Eleve.count(),
    Activite.findAll(),
    Professeur.count({
      where: {
        role: {
          [Op.in]: ENCADRANT_ROLES,
        },
      },
    }),
  ]);
  const fixedActivities = weekStart
    ? await planningFixedActivityServices.getFixedActivitiesByWeekStart(weekStart)
    : [];

  const compatibleActivites = normalizedNbEleveMax
    ? activites.filter(
        (activite) => activite.nb_eleve_max >= normalizedNbEleveMax
      )
    : [];

  const perMomentCompatibleCounts = MOMENT_FIELDS.map((momentField, index) => {
    const compatibleCount = compatibleActivites.filter(
      (activite) => Number(activite[momentField]) === 1
    ).length;

    return {
      key: momentField,
      label: MOMENT_LABELS[index],
      compatibleCount,
    };
  });

  const emptyMomentLabels = perMomentCompatibleCounts
    .filter((moment) => moment.compatibleCount === 0)
    .map((moment) => moment.label);

  const totalCompatibleSessions = normalizedNbEleveMax
    ? compatibleActivites.reduce((total, activite) => {
        const availableMomentsCount = MOMENT_FIELDS.reduce((count, momentField) => {
          return count + (Number(activite[momentField]) === 1 ? 1 : 0);
        }, 0);

        return total + Math.min(activite.nb_realisations, availableMomentsCount);
      }, 0)
    : null;

  const planningWeek =
    weekStart && isValidDateOnly(weekStart)
      ? await planningWeekServices.getPlanningWeekByStart(weekStart)
      : null;

  const existingParcoursCount = planningWeek
    ? await Parcours.count({
        where: {
          planningWeekId: planningWeek.id,
        },
      })
    : 0;

  const totalGroupCapacity =
    normalizedNbParcours && normalizedNbEleveMax
      ? normalizedNbParcours * normalizedNbEleveMax
      : null;

  let fixedActivitiesError = "";
  if (weekStart && normalizedNbParcours && normalizedNbEleveMax) {
    const planningWeek =
      weekStart && isValidDateOnly(weekStart)
        ? await planningWeekServices.getPlanningWeekByStart(weekStart)
        : null;

    if (planningWeek) {
      try {
        await planningFixedActivityServices.getResolvedFixedActivitiesForGeneration(
          planningWeek.id,
          normalizedNbParcours,
          normalizedNbEleveMax
        );
      } catch (error) {
        fixedActivitiesError = error.message;
      }
    }
  }

  return {
    requestedWeekStart: weekStart || "",
    requestedNbParcours: normalizedNbParcours,
    requestedNbEleveMax: normalizedNbEleveMax,
    week: {
      exists: Boolean(planningWeek),
      status: planningWeek?.status || (existingParcoursCount > 0 ? "genere" : "brouillon"),
      hasManualAdjustments: planningWeek?.hasManualAdjustments || false,
      existingParcoursCount,
    },
    counts: {
      eleves: elevesCount,
      activites: activites.length,
      activitesCompatibles: compatibleActivites.length,
      encadrants: encadrantsCount,
      capaciteGroupes: totalGroupCapacity,
      realisationsCompatibles: totalCompatibleSessions,
      activitesFixees: fixedActivities.length,
    },
    fixedActivities,
    fixedActivitiesError,
    perMomentCompatibleCounts,
    alerts: formatGenerationAlerts({
      weekStart,
      nbParcours: normalizedNbParcours,
      nbEleveMax: normalizedNbEleveMax,
      elevesCount,
      activitesCount: activites.length,
      encadrantsCount,
      compatibleActivitesCount: compatibleActivites.length,
      emptyMomentLabels,
      totalGroupCapacity,
      totalCompatibleSessions,
      existingParcoursCount,
      weekStatus: planningWeek?.status,
      hasManualAdjustments: planningWeek?.hasManualAdjustments,
    }),
  };
};

//supprime les parcours déja existant et retourne nbParcours parcours
//nbParcours : nombre de parcours voulu par l'admin
//nb_eleve_max : nombre d'élèves au minimum par parcours
exports.generateParcours = async (nbParcours, nb_eleve_max, weekStart) => {
  try {
    const planningWeek = await planningWeekServices.ensurePlanningWeek(
      weekStart
    );
    const fixedActivities =
      await planningFixedActivityServices.getResolvedFixedActivitiesForGeneration(
        planningWeek.id,
        nbParcours,
        nb_eleve_max
      );

    const existingParcours = await Parcours.findAll({
      where: {
        planningWeekId: planningWeek.id,
      },
      attributes: ["id"],
    });

    const parcoursIds = existingParcours.map((parcours) => parcours.id);

    if (parcoursIds.length > 0) {
      await ActiviteParcours.destroy({
        where: {
          parcoursId: {
            [Op.in]: parcoursIds,
          },
        },
      });

      await Eleve.update(
        { parcoursId: null },
        {
          where: {
            parcoursId: {
              [Op.in]: parcoursIds,
            },
          },
        }
      );

      await Parcours.destroy({
        where: {
          planningWeekId: planningWeek.id,
        },
      });
    }

    await associeParcoursActivite(
      nbParcours,
      nb_eleve_max,
      planningWeek.id,
      fixedActivities
    );
    await planningWeekServices.markWeekGenerated(weekStart);
  } catch (err) {
    throw new Error(err.message || "Error Parcours non réalisé");
  }
};
