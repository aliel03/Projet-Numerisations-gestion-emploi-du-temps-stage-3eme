const Activite = require("../models/Activite");
const PlanningFixedActivity = require("../models/PlanningFixedActivity");
const planningWeekServices = require("./planningWeekServices");

const MOMENT_FIELDS = ["l1", "l2", "ma1", "ma2", "me1", "me2", "j1", "j2", "v1", "v2"];

const parsePositiveInteger = (value) => {
  const parsedValue = Number.parseInt(value, 10);

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    return null;
  }

  return parsedValue;
};

const parseMomentIndex = (value) => {
  const parsedValue = Number.parseInt(value, 10);

  if (!Number.isInteger(parsedValue) || parsedValue < 0 || parsedValue > 9) {
    throw new Error("Le creneau choisi est invalide.");
  }

  return parsedValue;
};

const parseTargetParcoursIndexes = (value) => {
  if (!value) {
    return [];
  }

  let rawValues = [];

  if (Array.isArray(value)) {
    rawValues = value;
  } else if (typeof value === "string") {
    try {
      rawValues = JSON.parse(value);
    } catch (error) {
      rawValues = [];
    }
  }

  const normalizedValues = rawValues
    .map((item) => Number.parseInt(item, 10))
    .filter((item, index, array) => {
      return Number.isInteger(item) && item >= 0 && array.indexOf(item) === index;
    })
    .sort((a, b) => a - b);

  return normalizedValues;
};

const serializeTargetParcoursIndexes = (indexes) => {
  if (!indexes || indexes.length === 0) {
    return null;
  }

  return JSON.stringify(indexes);
};

const formatFixedActivity = (fixedActivity) => {
  return {
    id: fixedActivity.id,
    planningWeekId: fixedActivity.planningWeekId,
    activiteId: fixedActivity.activiteId,
    indexMoment: fixedActivity.indexMoment,
    scopeType: fixedActivity.scopeType,
    targetParcoursIndexes: parseTargetParcoursIndexes(
      fixedActivity.targetParcoursIndexes
    ),
    activite: fixedActivity.activite
      ? {
          id: fixedActivity.activite.id,
          nom: fixedActivity.activite.nom,
          nb_eleve_max: fixedActivity.activite.nb_eleve_max,
          nb_realisations: fixedActivity.activite.nb_realisations,
          l1: fixedActivity.activite.l1,
          l2: fixedActivity.activite.l2,
          ma1: fixedActivity.activite.ma1,
          ma2: fixedActivity.activite.ma2,
          me1: fixedActivity.activite.me1,
          me2: fixedActivity.activite.me2,
          j1: fixedActivity.activite.j1,
          j2: fixedActivity.activite.j2,
          v1: fixedActivity.activite.v1,
          v2: fixedActivity.activite.v2,
        }
      : null,
  };
};

const resolveAffectedParcoursIndexes = (fixedActivity, nbParcours) => {
  if (fixedActivity.scopeType === "all") {
    return Array.from({ length: nbParcours }, (_, index) => index);
  }

  return parseTargetParcoursIndexes(fixedActivity.targetParcoursIndexes);
};

const buildResolvedFixedActivities = (fixedActivities, nbParcours) => {
  return fixedActivities.map((fixedActivity) => {
    const formattedActivity = formatFixedActivity(fixedActivity);

    return {
      ...formattedActivity,
      affectedParcoursIndexes: resolveAffectedParcoursIndexes(
        fixedActivity,
        nbParcours
      ),
    };
  });
};

const validateResolvedFixedActivities = (
  resolvedFixedActivities,
  nbParcours,
  nbEleveMax
) => {
  const occupiedMoments = new Map();
  const usedActivities = new Map();
  const perActivityMomentTargets = new Map();
  const perActivityMoments = new Map();
  const perActivityMomentEntries = new Map();

  resolvedFixedActivities.forEach((fixedActivity) => {
    if (!fixedActivity.activite) {
      throw new Error("Une activite fixee reference une activite inexistante.");
    }

    if (fixedActivity.affectedParcoursIndexes.length === 0) {
      throw new Error(
        "Une activite fixee doit viser tous les parcours ou au moins un parcours."
      );
    }

    fixedActivity.affectedParcoursIndexes.forEach((parcoursIndex) => {
      if (parcoursIndex >= nbParcours) {
        throw new Error(
          "Une activite fixee cible un parcours qui n'existe pas avec les parametres choisis."
        );
      }

      const occupiedKey = `${parcoursIndex}-${fixedActivity.indexMoment}`;
      if (occupiedMoments.has(occupiedKey)) {
        throw new Error(
          "Deux activites fixees se chevauchent sur le meme creneau pour un meme parcours."
        );
      }
      occupiedMoments.set(occupiedKey, fixedActivity.id);

      const activityKey = `${parcoursIndex}-${fixedActivity.activiteId}`;
      if (usedActivities.has(activityKey)) {
        throw new Error(
          "Une meme activite fixee ne peut pas apparaitre deux fois dans un meme parcours."
        );
      }
      usedActivities.set(activityKey, fixedActivity.id);
    });

    if (
      Number(fixedActivity.activite[MOMENT_FIELDS[fixedActivity.indexMoment]]) !== 1
    ) {
      throw new Error(
        `L'activite fixee "${fixedActivity.activite.nom}" n'est pas disponible sur le creneau choisi.`
      );
    }

    if (fixedActivity.activite.nb_eleve_max < nbEleveMax) {
      throw new Error(
        `L'activite fixee "${fixedActivity.activite.nom}" n'a pas une capacite suffisante pour la taille de groupe choisie.`
      );
    }

    const momentKey = `${fixedActivity.activiteId}-${fixedActivity.indexMoment}`;
    const currentEntryCount = perActivityMomentEntries.get(momentKey) || 0;
    perActivityMomentEntries.set(momentKey, currentEntryCount + 1);

    if (perActivityMomentEntries.get(momentKey) > 1) {
      throw new Error(
        `L'activite fixee "${fixedActivity.activite.nom}" est deja definie sur ce creneau. Modifiez l'entree existante au lieu d'en creer une deuxieme.`
      );
    }

    const currentTargetCount = perActivityMomentTargets.get(momentKey) || 0;
    perActivityMomentTargets.set(
      momentKey,
      currentTargetCount + fixedActivity.affectedParcoursIndexes.length
    );

    const moments = perActivityMoments.get(fixedActivity.activiteId) || new Set();
    moments.add(fixedActivity.indexMoment);
    perActivityMoments.set(fixedActivity.activiteId, moments);
  });

  resolvedFixedActivities.forEach((fixedActivity) => {
    const momentKey = `${fixedActivity.activiteId}-${fixedActivity.indexMoment}`;
    const targetCount = perActivityMomentTargets.get(momentKey) || 0;

    if (targetCount * nbEleveMax > fixedActivity.activite.nb_eleve_max) {
      throw new Error(
        `L'activite fixee "${fixedActivity.activite.nom}" ne peut pas accueillir tous les parcours choisis sur ce creneau.`
      );
    }

    const usedMomentCount =
      perActivityMoments.get(fixedActivity.activiteId)?.size || 0;

    if (usedMomentCount > fixedActivity.activite.nb_realisations) {
      throw new Error(
        `L'activite fixee "${fixedActivity.activite.nom}" est demandee sur trop de creneaux par rapport a son nombre de realisations.`
      );
    }
  });
};

exports.getFixedActivitiesByWeekStart = async (weekStart) => {
  if (!weekStart) {
    return [];
  }

  const planningWeek = await planningWeekServices.getPlanningWeekByStart(
    weekStart
  );

  if (!planningWeek) {
    return [];
  }

  const fixedActivities = await PlanningFixedActivity.findAll({
    where: {
      planningWeekId: planningWeek.id,
    },
    include: [
      {
        model: Activite,
      },
    ],
    order: [
      ["indexMoment", "ASC"],
      ["id", "ASC"],
    ],
  });

  return fixedActivities.map((fixedActivity) => formatFixedActivity(fixedActivity));
};

exports.getResolvedFixedActivitiesForGeneration = async (
  planningWeekId,
  nbParcours,
  nbEleveMax
) => {
  const normalizedNbParcours = parsePositiveInteger(nbParcours);
  const normalizedNbEleveMax = parsePositiveInteger(nbEleveMax);

  if (!normalizedNbParcours || !normalizedNbEleveMax) {
    throw new Error(
      "Le nombre de parcours et la taille de groupe doivent etre valides pour utiliser les activites fixees."
    );
  }

  const fixedActivities = await PlanningFixedActivity.findAll({
    where: {
      planningWeekId,
    },
    include: [
      {
        model: Activite,
      },
    ],
    order: [
      ["indexMoment", "ASC"],
      ["id", "ASC"],
    ],
  });

  const resolvedFixedActivities = buildResolvedFixedActivities(
    fixedActivities,
    normalizedNbParcours
  );

  validateResolvedFixedActivities(
    resolvedFixedActivities,
    normalizedNbParcours,
    normalizedNbEleveMax
  );

  return resolvedFixedActivities;
};

exports.createFixedActivity = async ({
  weekStart,
  activiteId,
  indexMoment,
  scopeType,
  targetParcoursIndexes,
  nbParcours,
  nbEleveMax,
}) => {
  const normalizedNbParcours = parsePositiveInteger(nbParcours);
  const normalizedNbEleveMax = parsePositiveInteger(nbEleveMax);

  if (!normalizedNbParcours || !normalizedNbEleveMax) {
    throw new Error(
      "Choisissez d'abord le nombre de parcours et la taille max des groupes."
    );
  }

  if (!weekStart) {
    throw new Error("La semaine de planning est obligatoire.");
  }

  if (scopeType !== "all" && scopeType !== "selected") {
    throw new Error("Le type d'activite fixee est invalide.");
  }

  const normalizedActiviteId = parsePositiveInteger(activiteId);
  if (!normalizedActiviteId) {
    throw new Error("L'activite choisie est invalide.");
  }

  const normalizedIndexMoment = parseMomentIndex(indexMoment);
  const normalizedTargetIndexes =
    scopeType === "selected"
      ? parseTargetParcoursIndexes(targetParcoursIndexes)
      : [];

  if (scopeType === "selected" && normalizedTargetIndexes.length === 0) {
    throw new Error("Choisissez au moins un parcours pour cette activite fixee.");
  }

  const planningWeek = await planningWeekServices.ensurePlanningWeek(weekStart);
  const activite = await Activite.findByPk(normalizedActiviteId);

  if (!activite) {
    throw new Error("L'activite choisie n'existe pas.");
  }

  const existingFixedActivities = await PlanningFixedActivity.findAll({
    where: {
      planningWeekId: planningWeek.id,
    },
    include: [
      {
        model: Activite,
      },
    ],
  });

  const candidateFixedActivity = {
    id: "candidate",
    planningWeekId: planningWeek.id,
    activiteId: normalizedActiviteId,
    indexMoment: normalizedIndexMoment,
    scopeType,
    targetParcoursIndexes: serializeTargetParcoursIndexes(normalizedTargetIndexes),
    activite,
  };

  const resolvedFixedActivities = buildResolvedFixedActivities(
    [...existingFixedActivities, candidateFixedActivity],
    normalizedNbParcours
  );

  validateResolvedFixedActivities(
    resolvedFixedActivities,
    normalizedNbParcours,
    normalizedNbEleveMax
  );

  const fixedActivity = await PlanningFixedActivity.create({
    planningWeekId: planningWeek.id,
    activiteId: normalizedActiviteId,
    indexMoment: normalizedIndexMoment,
    scopeType,
    targetParcoursIndexes: serializeTargetParcoursIndexes(normalizedTargetIndexes),
  });

  const createdFixedActivity = await PlanningFixedActivity.findByPk(fixedActivity.id, {
    include: [
      {
        model: Activite,
      },
    ],
  });

  return formatFixedActivity(createdFixedActivity);
};

exports.deleteFixedActivity = async (fixedActivityId) => {
  const fixedActivity = await PlanningFixedActivity.findByPk(fixedActivityId);

  if (!fixedActivity) {
    throw new Error("L'activite fixee a supprimer n'existe pas.");
  }

  await fixedActivity.destroy();
  return true;
};
