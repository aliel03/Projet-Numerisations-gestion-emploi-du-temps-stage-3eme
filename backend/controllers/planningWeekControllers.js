const planningWeekServices = require("../services/planningWeekServices");

exports.getAllPlanningWeeks = async (req, res) => {
  try {
    const planningWeeks = await planningWeekServices.getAllPlanningWeeks();
    res.status(200).json(planningWeeks);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la recuperation des semaines de planning",
      error,
    });
  }
};

exports.updatePlanningWeekStatus = async (req, res) => {
  const weekStart = req.params.weekStart;
  const { status } = req.body;

  try {
    const planningWeek = await planningWeekServices.updatePlanningWeekStatus(
      weekStart,
      status
    );
    res.status(200).json(planningWeek);
  } catch (error) {
    const statusCode = error.message.includes("invalide") ? 400 : 500;

    res.status(statusCode).json({
      message: error.message || "Erreur lors de la mise a jour du statut",
    });
  }
};
