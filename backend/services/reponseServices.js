const Reponse = require("../models/Reponses");
const Question = require("../models/Question");
const QuestionServices = require("./questionServices");
const ProfesseurServices = require("./professeurServices");
const Activite = require("../models/Activite");

//permet de récupérer les réponses à une question spécifique
exports.getReponsesByQuestions = async (questionId) => {
  const question_reponses = [];
  const question = await Question.findByPk(questionId);
  question_reponses.push({ question: question.contenu });
  const reponses_of_questions = await Reponse.findAll({
    where: {
      questionId: questionId,
    },
  });
  question_reponses.push({ reponses: reponses_of_questions });
  return question_reponses;
};

// le questionnaire à passer en paramètre est soit "Tuteur"
// soit "Encadrant" pour récupérer les réponses associées à l'élève
exports.getReponsesForEleve = async (eleveId, questionnaire = "Encadrant") => {
  const questions_questionnaire =
    await QuestionServices.getQuestionsByQuestionnaire(questionnaire);
  const questions_reponses = [];

  for (const quest_questionnaire of questions_questionnaire) {
    const contenu = quest_questionnaire.contenu;
    const questionId = quest_questionnaire.id;

    const reponses = await Reponse.findAll({
      where: {
        eleveConcerneId: eleveId,
        questionId,
      },
    });

    if (reponses !== null && reponses !== undefined && reponses.length > 0) {
      const new_ques_rep = {
        contenu,
        reponses,
      };
      questions_reponses.push(new_ques_rep);
    }
  }
  return questions_reponses;
};

//permet de récupérer les réponses qu'on été données pour une activité
exports.getReponsesForActivie = async (activiteId) => {
  const questions_encadrant =
    await QuestionServices.getQuestionsByQuestionnaire("Encadrant");
  const questions_reponses = {};

  for (const quest of questions_encadrant) {
    const contenu = quest.contenu;
    const questionId = quest.id;

    const reponses = await Reponse.findAll({
      where: {
        activiteId,
        questionId,
      },
    });
    if (reponses !== null && reponses !== undefined && reponses.length > 0) {
      questions_reponses[questionId] = {
        contenu: contenu,
        reponses: reponses,
      };
    }
  }
  return questions_reponses;
};

//permet de récupérer toutes les réponses qu'a effectué un tuteur sur ses élèves
exports.getReponsesByTuteur = async (profId) => {
  const tuteur_questions_reponse = {};

  const eleves_respo = await ProfesseurServices.getEleveByTuteur(profId);
  for (const eleve of eleves_respo) {
    const eleveId = eleve.id;
    const reponse_for_el = await this.getReponsesForEleve(eleveId, "Tuteur");
    tuteur_questions_reponse[eleveId] = reponse_for_el;
  }

  return tuteur_questions_reponse;
};

//permet de récupérer les réponses qu'un encadrant a effectué sur chacune de ses activités
exports.getReponsesByEncadrant = async (profId) => {
  const encadrant_questions_reponses = {};

  const activite_respo = await Activite.findAll({
    where: {
      professeurId: profId,
    },
  });

  for (const act of activite_respo) {
    const activiteId = act.id;
    const reponses = await this.getReponsesForActivie(activiteId);
    encadrant_questions_reponses[activiteId] = reponses;
  }

  return encadrant_questions_reponses;
};

//permet de récupérer les réponses d'un élèves au questionnaire élève
exports.getReponsesByEleve = async (eleveId) => {
  const questions_eleves = await QuestionServices.getQuestionsByQuestionnaire(
    "Eleve"
  );
  const eleve_question_reponse = {};

  for (const quest of questions_eleves) {
    const questionId = quest.id;
    const contenu = quest.contenu;

    const reponses = await Reponse.findAll({
      where: {
        questionId,
        repondantEleveId: eleveId,
      },
    });
    eleve_question_reponse[questionId] = {
      question: contenu,
      reponses: reponses,
    };
  }
  return eleve_question_reponse;
};

exports.getUniqueReponse = async (reponseDate) => {
  const reponse = await Reponse.findOne({
    where: reponseDate,
  });

  return reponse;
};

exports.addReponse = async (reponseData) => {
  const new_reponse = await Reponse.create(reponseData);
  return new_reponse;
};

exports.updateReponse = async (reponseId, newContenu) => {
  const reponse_a_modif = await Reponse.findByPk(reponseId);
  await reponse_a_modif.update({
    contenu: newContenu,
  });
  return reponse_a_modif;
};

exports.deleteReponse = async (reponseId) => {
  await Reponse.destroy(reponseId);
};

exports.deleteAllReponses = async () => {
  await Reponse.destroy({ where: {} });
};
