const ActiviteParcoursServices = require("../services/activiteParcoursServices");
const ParcoursServices = require("../services/parcoursServices");

exports.getAllActivitesParcours = async (req, res) => {
  try {
    const allActParc = await ActiviteParcoursServices.getAllActivitesParcours(
      req.query.weekStart
    );
    res.json(allActParc);
  } catch (err) {
    res
      .status(404)
      .json({ message: "Aucune activité - parcours n'a été trouvé" });
  }
};

//pour chaque parcours retourne la liste de ses activité et l'index du moment de celle-ci
exports.getActivitesByAllParcours = async (req, res) => {
  try {
    const actAllParc = {};
    const allParc = await ParcoursServices.getAllParcours(req.query.weekStart);
    for (const actParc of allParc) {
      const allActParc = await ActiviteParcoursServices.getActiviteByParcours(
        actParc.id
      );
      actAllParc[actParc.id] = allActParc;
    }
    res.json(actAllParc);
  } catch (err) {
    res
      .status(404)
      .json({ message: "Aucune activité - parcours n'a été trouvé" });
  }
};

// retourne activités d'un pracours passé en paramètre
exports.getActiviteByParcours = async (req, res) => {
  const parcoursId = req.params.parcoursId;
  try {
    const actOfParc = await ActiviteParcoursServices.getActiviteByParcours(
      parcoursId
    );
    res.json(actOfParc);
  } catch (err) {
    res
      .status(404)
      .json({ message: "Aucune activtié n'est lié à ce parcours" });
  }
};

// retourne le parcours pour un prof, les activités qu'il encadre et l'index du moment durant lequel il les encadre
exports.getActiviteParcByProf = async (req, res) => {
  const prof_id = req.params.profId;
  try {
    const parcours_pr = await ActiviteParcoursServices.getActParcByProf(
      prof_id,
      req.query.weekStart
    );
    res.status(200).json(parcours_pr);
  } catch (err) {
    res
      .status(400)
      .json({
        message: "Error aucune activtié parcours trouvé pour ce professeur ",
      });
  }
};

//retourne l'emploi du temps d'un élève passé en paramètre
exports.getActiviteParcByEleve = async (req, res) => {
  const eleve_id = req.params.eleveId;
  try {
    const activtie_parcours_el =
      await ActiviteParcoursServices.getActiviteParcByEleve(eleve_id);
    res.status(200).json(activtie_parcours_el);
  } catch (err) {
    res
      .status(400)
      .json({ message: "Error aucun parcours trouvé pour cet élève " });
  }
};

// on peut créer une activité à un moment précis si on le souhaite quand les parcours sont déjà créés
exports.associateActiviteParcours = async (req, res) => {
  const { parcoursId, activiteId, indexMoment } = req.body;
  try {
    const newAsso = await ActiviteParcoursServices.associateActiviteParcours(
      parcoursId,
      activiteId,
      indexMoment
    );
    res.json(newAsso);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Impossible de créer une nouvelle association", err });
  }
};

exports.associateActToAllParc = async (req, res) => {
  const { activiteId, indexMoment, weekStart } = req.body;
  try {
    const reponse = await ActiviteParcoursServices.associateActToAllParc(
      activiteId,
      indexMoment,
      weekStart
    );
    if (reponse) {
      res.json({
        message: "L'activité à été ajoutée à tous les parcours avec succés",
      });
    }
  } catch (error) {
    res
      .status(500)
      .json({
        message:
          "Un problème est survenu lors de l'ajout de l'activité dans les parcours",
        error,
      });
  }
};

exports.deleteActiviteParcoursAssociation = async (req, res) => {
  const { parcoursId, activiteId } = req.query;

  try {
    await ActiviteParcoursServices.deleteActiviteParcoursAssociation(
      parcoursId,
      activiteId
    );
    res.status(200).json({
      message: "L'association entre l'activité et le parcours a été supprimée",
    });
  } catch (error) {
    res.status(404).json({
      message: "Aucune association activité-parcours trouvée à supprimer",
      error,
    });
  }
};
