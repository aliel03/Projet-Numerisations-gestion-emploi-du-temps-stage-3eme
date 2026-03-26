const PlanningWeek = require("../models/PlanningWeek");
const Parcours = require("../models/Parcours");
const VALID_STATUSES = ["brouillon", "genere", "valide"];

const parseDateOnly = (dateString) => {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const formatDateOnly = (date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const addDaysToDate = (dateString, daysToAdd) => {
  const date = parseDateOnly(dateString);
  date.setDate(date.getDate() + daysToAdd);
  return formatDateOnly(date);
};

const validateWeekStart = (weekStart) => {
  if (!weekStart) {
    throw new Error("La semaine de planning est obligatoire");
  }

  const parsedDate = parseDateOnly(weekStart);
  if (Number.isNaN(parsedDate.getTime())) {
    throw new Error("Le format de semaine est invalide");
  }

  return weekStart;
};

const validateStatus = (status) => {
  if (!VALID_STATUSES.includes(status)) {
    throw new Error("Le statut de semaine demande est invalide");
  }

  return status;
};

exports.getAllPlanningWeeks = async () => {
  return await PlanningWeek.findAll({
    order: [["weekStart", "DESC"]],
  });
};

exports.getPlanningWeekByStart = async (weekStart) => {
  if (!weekStart) {
    return null;
  }

  return await PlanningWeek.findOne({
    where: {
      weekStart,
    },
  });
};

exports.ensurePlanningWeek = async (weekStart) => {
  const normalizedWeekStart = validateWeekStart(weekStart);
  const weekEnd = addDaysToDate(normalizedWeekStart, 6);

  const [planningWeek] = await PlanningWeek.findOrCreate({
    where: {
      weekStart: normalizedWeekStart,
    },
    defaults: {
      weekEnd,
      status: "brouillon",
      hasManualAdjustments: false,
    },
  });

  if (planningWeek.weekEnd !== weekEnd) {
    await planningWeek.update({ weekEnd });
  }

  return planningWeek;
};

exports.updatePlanningWeekStatus = async (weekStart, status) => {
  const normalizedWeekStart = validateWeekStart(weekStart);
  const normalizedStatus = validateStatus(status);
  const planningWeek = await exports.ensurePlanningWeek(normalizedWeekStart);

  const nextValues = {
    status: normalizedStatus,
  };

  if (normalizedStatus === "genere") {
    nextValues.hasManualAdjustments = false;
  }

  await planningWeek.update(nextValues);
  return planningWeek;
};

exports.markWeekGenerated = async (weekStart) => {
  const planningWeek = await exports.ensurePlanningWeek(weekStart);

  await planningWeek.update({
    status: "genere",
    hasManualAdjustments: false,
  });

  return planningWeek;
};

exports.markWeekManualAdjustmentByStart = async (weekStart) => {
  if (!weekStart) {
    return null;
  }

  const planningWeek = await exports.getPlanningWeekByStart(weekStart);

  if (!planningWeek) {
    return null;
  }

  await planningWeek.update({
    status: "brouillon",
    hasManualAdjustments: true,
  });

  return planningWeek;
};

exports.markWeekManualAdjustmentByParcoursId = async (parcoursId) => {
  if (!parcoursId) {
    return null;
  }

  const planningWeek = await PlanningWeek.findOne({
    include: [
      {
        model: Parcours,
        required: true,
        where: {
          id: parcoursId,
        },
        attributes: [],
      },
    ],
  });

  if (!planningWeek) {
    return null;
  }

  await planningWeek.update({
    status: "brouillon",
    hasManualAdjustments: true,
  });

  return planningWeek;
};
