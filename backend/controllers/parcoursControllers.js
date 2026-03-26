const parcoursServices = require("../services/parcoursServices");

exports.getGenerationSummary = async (req, res) => {
  const { nbParcours, nbEleveMax, weekStart } = req.query;

  try {
    const summary = await parcoursServices.getGenerationSummary(
      nbParcours,
      nbEleveMax,
      weekStart
    );
    res.status(200).json(summary);
  } catch (err) {
    res.status(500).json({
      message: "Erreur lors de la recuperation du resume de generation",
    });
  }
};

//permet de générer des parcours
//nbParcours = nombre de parcours souhaité
//nbEleveMax est le nombre d'élève que peux au maximum avoir un parcours
exports.generateParcours = async (req, res) => {
  const { nbParcours, nbEleveMax, weekStart, mode } = req.body;
  try {
    const payload = await parcoursServices.validateGenerationPayload({
      nbParcours,
      nbEleveMax,
      weekStart,
      mode,
    });

    await parcoursServices.generateParcours(
      payload.nbParcours,
      payload.nbEleveMax,
      payload.weekStart
    );

    res
      .status(200)
      .json({ message: "Génération des emplois du temps a été un succés" });
  } catch (err) {
    const statusCode =
      err.message.includes("existe deja") || err.message.includes("Aucun planning")
        ? 409
        : err.message.includes("doit") ||
            err.message.includes("invalide") ||
            err.message.includes("Choisissez") ||
            err.message.includes("n'est pas") ||
            err.message.includes("ne peut pas") ||
            err.message.includes("trop de creneaux") ||
            err.message.includes("chevauchent")
          ? 400
          : 500;

    res.status(statusCode).json({
      message: err.message || "Error lors de la génération de parcours",
    });
  }
};
