export const getPlanningWeekStatusLabel = (status) => {
  switch (status) {
    case "valide":
      return "Semaine validee";
    case "genere":
      return "Semaine generee";
    case "brouillon":
    default:
      return "Semaine en brouillon";
  }
};

export const getPlanningWeekStatusMessage = (planningWeek) => {
  if (!planningWeek) {
    return "Aucune semaine de planning n'est encore chargee.";
  }

  if (planningWeek.status === "valide") {
    return planningWeek.hasManualAdjustments
      ? "Cette semaine a ete retouchee manuellement puis validee."
      : "Cette semaine est prete et marquee comme validee.";
  }

  if (planningWeek.hasManualAdjustments) {
    return "Cette semaine a ete generee automatiquement puis modifiee manuellement.";
  }

  if (planningWeek.status === "genere") {
    return "Cette semaine a ete generee automatiquement et n'a pas encore ete retouchee.";
  }

  return "Cette semaine est encore en construction et peut etre ajustee.";
};
