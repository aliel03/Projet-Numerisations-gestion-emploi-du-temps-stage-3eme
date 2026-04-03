const activiteService = require("../services/activiteServices");

exports.getAllActivites = async (req, res) => {
  try {
    const activites = await activiteService.getAllActivites();
    res.status(200).json(activites);
  } catch (err) {
    res
      .status(404)
      .json({ message: "Aucune activité n'a été trouvée", error: err });
  }
};

exports.getActivite = async (req, res) => {
  const activiteId = req.params.id;
  try {
    const activite = await activiteService.getActiviteById(activiteId);
    res.status(200).json(activite);
  } catch (err) {
    res.status(404).json({ message: "Error Activite non trouvée" });
  }
};

exports.getActiviteByEncadrant = async (req, res) => {
  const professesseurId = req.params.professeurId;
  try {
    const activite = await activiteService.getActiviteByEncadrant(
      professesseurId
    );
    res.status(200).json(activite);
  } catch (err) {
    res
      .status(404)
      .json({ message: "Error Aucune activité trouvé pour cet encadrant" });
  }
};

exports.addActivite = async (req, res) => {
  const {
    nom,
    description,
    nb_realisations,
    nb_eleve_max,
    l1,
    l2,
    ma1,
    ma2,
    me1,
    me2,
    j1,
    j2,
    v1,
    v2,
    lieu,
    lieu_rdv,
    commentaire_admin,
    professeurId,
  } = req.body;
  try {
    const activiteData = {
      nom,
      description,
      nb_realisations,
      nb_eleve_max,
      l1,
      l2,
      ma1,
      ma2,
      me1,
      me2,
      j1,
      j2,
      v1,
      v2,
      lieu,
      lieu_rdv,
      commentaire_admin,
      professeurId,
    };
    const activite = await activiteService.createActivite(activiteData);
    res.status(201).json({ message: "Activité créée avec succès", activite });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la création de l'activité", error });
  }
};

exports.updateActivite = async (req, res) => {
  const activiteId = req.params.id;
  const {
    nom,
    description,
    nb_realisations,
    nb_eleve_max,
    l1,
    l2,
    ma1,
    ma2,
    me1,
    me2,
    j1,
    j2,
    v1,
    v2,
    lieu,
    lieu_rdv,
    commentaire_admin,
    professeurId,
  } = req.body;
  try {
    const activiteData = {
      nom,
      description,
      nb_realisations,
      nb_eleve_max,
      l1,
      l2,
      ma1,
      ma2,
      me1,
      me2,
      j1,
      j2,
      v1,
      v2,
      lieu,
      lieu_rdv,
      commentaire_admin,
      professeurId,
    };
    const activite = await activiteService.updateActivite(
      activiteData,
      activiteId
    );
    res
      .status(201)
      .json({ message: "Activité modifiée avec succès", activite });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la modification de l'activité", error });
  }
};

exports.deleteActivite = async (req, res) => {
  const activiteId = req.params.id;

  try {
    await activiteService.deleteActiviteById(activiteId);
    res.status(200).json({ message: "Activité supprimée avec succès" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la suppression de l'activité", error });
  }
};

exports.deleteAllActivites = async (req, res) => {
  try {
    await activiteService.deleteAllActivites();
    res
      .status(200)
      .json({ message: "Toutes les activités ont été supprimées" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la suppression des activités", error });
  }
};
