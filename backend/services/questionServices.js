const Question = require("../models/Question");
const { Op } = require("sequelize");

const SYSTEM_TUTEUR_EVALUATION_CONTENT =
  "__SYSTEM_TUTEUR_EVALUATION_COMMENT__";
const SYSTEM_ENCADRANT_EVALUATION_CONTENT =
  "__SYSTEM_ENCADRANT_EVALUATION_COMMENT__";

exports.SYSTEM_TUTEUR_EVALUATION_CONTENT = SYSTEM_TUTEUR_EVALUATION_CONTENT;
exports.SYSTEM_ENCADRANT_EVALUATION_CONTENT =
  SYSTEM_ENCADRANT_EVALUATION_CONTENT;

const SYSTEM_EVALUATION_CONTENTS = [
  SYSTEM_TUTEUR_EVALUATION_CONTENT,
  SYSTEM_ENCADRANT_EVALUATION_CONTENT,
];

exports.getAllQuestions = async () => {
  const allQuestions = await Question.findAll({
    where: {
      contenu: {
        [Op.notIn]: SYSTEM_EVALUATION_CONTENTS,
      },
    },
  });
  return allQuestions;
};

exports.getQuestionsByQuestionnaire = async (questionnaire) => {
  const questionByQuestionnaire = await Question.findAll({
    where: {
      questionnaire: questionnaire,
      contenu: {
        [Op.notIn]: SYSTEM_EVALUATION_CONTENTS,
      },
    },
  });
  return questionByQuestionnaire;
};

const getSystemEvaluationContent = (questionnaire) => {
  return questionnaire === "Encadrant"
    ? SYSTEM_ENCADRANT_EVALUATION_CONTENT
    : SYSTEM_TUTEUR_EVALUATION_CONTENT;
};

exports.ensureEvaluationQuestion = async (questionnaire = "Tuteur") => {
  const systemContent = getSystemEvaluationContent(questionnaire);

  const [question] = await Question.findOrCreate({
    where: {
      contenu: systemContent,
      questionnaire,
    },
    defaults: {
      contenu: systemContent,
      questionnaire,
    },
  });

  return question;
};

exports.ensureTuteurEvaluationQuestion = async () =>
  exports.ensureEvaluationQuestion("Tuteur");

exports.ensureEncadrantEvaluationQuestion = async () =>
  exports.ensureEvaluationQuestion("Encadrant");

exports.addQuestion = async (questionData) => {
  const newQuestion = await Question.create(questionData);
  return newQuestion;
};

exports.updateQuestion = async (questionId, questionData) => {
  const question = await Question.findByPk(questionId);
  const rows = await question.update(questionData);
  return rows;
};

exports.deleteQuestion = async (questionId) => {
  await Question.destroy({
    where: {
      id: questionId,
    },
  });
};
