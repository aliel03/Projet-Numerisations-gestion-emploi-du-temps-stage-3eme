const planningFixedActivityServices = require("../services/planningFixedActivityServices");

exports.getFixedActivitiesByWeek = async (req, res) => {
  try {
    const fixedActivities =
      await planningFixedActivityServices.getFixedActivitiesByWeekStart(
        req.query.weekStart
      );
    res.status(200).json(fixedActivities);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la recuperation des activites fixees",
    });
  }
};

exports.createFixedActivity = async (req, res) => {
  try {
    const fixedActivity = await planningFixedActivityServices.createFixedActivity(
      req.body
    );
    res.status(201).json(fixedActivity);
  } catch (error) {
    const statusCode = error.message?.includes("invalide") ? 400 : 409;
    res.status(statusCode).json({
      message:
        error.message || "Erreur lors de la creation de l'activite fixee",
    });
  }
};

exports.deleteFixedActivity = async (req, res) => {
  try {
    await planningFixedActivityServices.deleteFixedActivity(req.params.id);
    res.status(200).json({
      message: "L'activite fixee a bien ete supprimee",
    });
  } catch (error) {
    res.status(404).json({
      message:
        error.message || "Erreur lors de la suppression de l'activite fixee",
    });
  }
};
