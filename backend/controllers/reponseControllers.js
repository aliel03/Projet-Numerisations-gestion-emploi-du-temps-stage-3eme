const ReponseServices = require("../services/reponseServices");

exports.getReponsesByQuestions = async (req, res) => {
  const questionId = req.params.questionId;

  try {
    const reponse = await ReponseServices.getReponsesByQuestions(questionId);
    res.status(200).json(reponse);
  } catch (error) {
    res
      .status(404)
      .json({
        message: "Error aucune réponse n'a été trouvée pour cette question",
        error,
      });
  }
};

//permet d'avoir les réponses qu'ont été formulées par le tuteur de l'élève
exports.getReponsesForEleve = async (req, res) => {
  const eleveId = req.params.eleveId;

  try {
    const all_reponses = await ReponseServices.getReponsesForEleve(eleveId);
    res.status(200).json(all_reponses);
  } catch (error) {
    res
      .status(404)
      .json({
        message: "Error aucune réponse n'a été trouvée concernant cet élève",
        error,
      });
  }
};

// les réponses qu'ont été formulées pour une activité par son encadrant (comportement des élèves)
exports.getReponsesForActivie = async (req, res) => {
  const activiteId = req.params.activiteId;
  try {
    const all_reponses = await ReponseServices.getReponsesForActivie(
      activiteId
    );
    res.status(200).json(all_reponses);
  } catch (error) {
    res
      .status(404)
      .json({
        message:
          "Error aucune réponse n'a été trouvée concernant cette activité",
        error,
      });
  }
};

//les réponses d'un tuteur pour tous ses élèves
exports.getReponsesByTuteur = async (req, res) => {
  const profId = req.params.profId;

  try {
    const all_reponses = await ReponseServices.getReponsesByTuteur(profId);
    res.status(200).json(all_reponses);
  } catch (error) {
    res
      .status(404)
      .json({
        message: "Error aucune réponse n'a été trouvée concernant ce tuteur",
        error,
      });
  }
};

// réponses d'un encadrants pour toutes ses activités
exports.getResponsesByEncadrant = async (req, res) => {
  const profId = req.params.profId;

  try {
    const all_reponses = await ReponseServices.getReponsesByEncadrant(profId);
    res.status(200).json(all_reponses);
  } catch (error) {
    res
      .status(404)
      .json({
        message:
          "Error aucune réponse n'a été trouvée concernant cet encadrant",
        error,
      });
  }
};

// réponses questionnaire de satisfaction élève
exports.getResponsesByEleve = async (req, res) => {
  const eleveId = req.params.eleveId;

  try {
    const all_reponses = await ReponseServices.getReponsesByEleve(eleveId);
    res.status(200).json(all_reponses);
  } catch (error) {
    res
      .status(404)
      .json({
        message: "Error aucune réponse n'a été trouvée de la part de cet élève",
        error,
      });
  }
};

exports.getTuteurEvaluationComment = async (req, res) => {
  const eleveId = req.params.eleveId;
  const tuteurId = req.query.tuteurId;

  try {
    const comment = await ReponseServices.getTuteurEvaluationComment(
      eleveId,
      tuteurId
    );
    res.status(200).json(comment);
  } catch (error) {
    res.status(404).json({
      message: "Error aucun commentaire tuteur n'a ete trouve",
      error,
    });
  }
};

exports.getVisibleTuteurEvaluationCommentForEleve = async (req, res) => {
  const eleveId = req.params.eleveId;

  try {
    const comment =
      await ReponseServices.getVisibleTuteurEvaluationCommentForEleve(eleveId);
    res.status(200).json(comment);
  } catch (error) {
    res.status(404).json({
      message: "Error aucun commentaire tuteur n'a ete trouve pour cet eleve",
      error,
    });
  }
};

exports.upsertTuteurEvaluationComment = async (req, res) => {
  const eleveId = req.params.eleveId;
  const { contenu, tuteurId } = req.body;

  try {
    const comment = await ReponseServices.upsertTuteurEvaluationComment({
      eleveId,
      tuteurId,
      contenu,
    });
    res.status(200).json(comment);
  } catch (error) {
    res.status(500).json({
      message: "Error impossible d'enregistrer l'evaluation du tuteur",
      error,
    });
  }
};

exports.getEncadrantEvaluationComment = async (req, res) => {
  const eleveId = req.params.eleveId;
  const encadrantId = req.query.encadrantId;

  try {
    const comment = await ReponseServices.getEncadrantEvaluationComment(
      eleveId,
      encadrantId
    );
    res.status(200).json(comment);
  } catch (error) {
    res.status(404).json({
      message: "Error aucun commentaire encadrant n'a ete trouve",
      error,
    });
  }
};

exports.getVisibleEncadrantEvaluationCommentForEleve = async (req, res) => {
  const eleveId = req.params.eleveId;

  try {
    const comment =
      await ReponseServices.getVisibleEncadrantEvaluationCommentForEleve(
        eleveId
      );
    res.status(200).json(comment);
  } catch (error) {
    res.status(404).json({
      message:
        "Error aucun commentaire encadrant n'a ete trouve pour cet eleve",
      error,
    });
  }
};

exports.upsertEncadrantEvaluationComment = async (req, res) => {
  const eleveId = req.params.eleveId;
  const { contenu, encadrantId } = req.body;

  try {
    const comment = await ReponseServices.upsertEncadrantEvaluationComment({
      eleveId,
      encadrantId,
      contenu,
    });
    res.status(200).json(comment);
  } catch (error) {
    res.status(500).json({
      message: "Error impossible d'enregistrer l'evaluation de l'encadrant",
      error,
    });
  }
};

// permet de savoir si réponses a déjà été formulée en fonction de facteur d'unicité
// si tuteur répond : ensemble (tuteurId-questionId-eleveConcerneId) doit être unique...
exports.getUniqueReponse = async (req, res) => {
  const {
    repondantEleveId,
    repondantProfId,
    eleveConcerneId,
    questionId,
    activiteId,
    indexMoment,
  } = req.query;
  try {
    const reponseData = {
      repondantEleveId: repondantEleveId ?? null,
      repondantProfId: repondantProfId ?? null,
      eleveConcerneId: eleveConcerneId ?? null,
      questionId: questionId,
      activiteId: activiteId ?? null,
      indexMoment: indexMoment ?? null,
    };

    const reponse = await ReponseServices.getUniqueReponse(reponseData);
    res.status(200).json(reponse);
  } catch (error) {
    res.status(404).json({ message: "Error aucune réponse trouvée", error });
  }
};

exports.addReponse = async (req, res) => {
  const {
    contenu,
    repondantEleveId,
    repondantProfId,
    eleveConcerneId,
    questionId,
    activiteId,
    indexMoment,
  } = req.body;
  try {
    const reponseData = {
      contenu,
      repondantEleveId,
      repondantProfId,
      eleveConcerneId,
      questionId,
      activiteId,
      indexMoment,
    };

    const new_reponse = await ReponseServices.addReponse(reponseData);
    res.status(201).json(new_reponse);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error impossible de créer une nouvelle réponse",
        error,
      });
  }
};

exports.updateReponse = async (req, res) => {
  const reponseId = req.params.id;
  const { contenu } = req.body;

  try {
    const reponseUpdated = await ReponseServices.updateReponse(
      reponseId,
      contenu
    );
    res.status(200).json(reponseUpdated);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error impossible de modifier la réponse", error });
  }
};

exports.deleteReponse = async (req, res) => {
  const reponseId = req.params.id;
  try {
    await ReponseServices.deleteReponse(reponseId);
    res.status(200).json({ message: "Réponse supprimé avec succés" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error impossible de supprimé la réponse", error });
  }
};

exports.deleteAllReponses = async (req, res) => {
  try {
    await ReponseServices.deleteAllReponses();
    res
      .status(200)
      .json({ message: "Les réponses ont été supprimées avec succés" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error impossible de supprimé les réponses", error });
  }
};
