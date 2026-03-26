const ActiviteParcours = require("../models/ActiviteParcours");
const Activite = require("../models/Activite");
const Eleve = require("../models/Eleve");
const Professeur = require("../models/Professeur");
const { Sequelize } = require("sequelize");
const Parcours = require("../models/Parcours");
const planningWeekServices = require("./planningWeekServices");

const enrichActiviteParcours = async (activiteParcours) => {
  const activite = await Activite.findByPk(activiteParcours.activiteId, {
    include: [
      {
        model: Professeur,
        attributes: ["id", "nom", "prenom", "role"],
      },
    ],
  });

  return {
    parcoursId: activiteParcours.parcoursId,
    activiteId: activiteParcours.activiteId,
    indexMoment: activiteParcours.indexMoment,
    activite: activite
      ? {
          id: activite.id,
          nom: activite.nom,
          description: activite.description,
          nb_realisations: activite.nb_realisations,
          nb_eleve_max: activite.nb_eleve_max,
          lieu: activite.lieu,
          lieu_rdv: activite.lieu_rdv,
          professeurId: activite.professeurId,
          professeur: activite.Professeur
            ? {
                id: activite.Professeur.id,
                nom: activite.Professeur.nom,
                prenom: activite.Professeur.prenom,
                role: activite.Professeur.role,
              }
            : null,
        }
      : null,
  };
};

exports.getAllActivitesParcours = async (weekStart) => {
  const include = [];

  if (weekStart) {
    const planningWeek = await planningWeekServices.getPlanningWeekByStart(
      weekStart
    );

    if (!planningWeek) {
      return [];
    }

    include.push({
      model: Parcours,
      where: {
        planningWeekId: planningWeek.id,
      },
      attributes: [],
    });
  }

  const allActivitesParcours = await ActiviteParcours.findAll({ include });
  return allActivitesParcours;
};

exports.getActiviteByParcours = async (parcoursId) => {
  const actOfParc = await ActiviteParcours.findAll({
    where: {
      parcoursId: parcoursId,
    },
    order: [[Sequelize.literal("indexMoment"), "ASC"]],
  });
  return await Promise.all(
    actOfParc.map((activiteParcours) =>
      enrichActiviteParcours(activiteParcours)
    )
  );
};

exports.getActParcByProf = async (profId, weekStart) => {
  //on commence par chercher les activités dont le prof est tuteur
  const activites = await Activite.findAll({
    where: {
      professeurId: profId,
    },
  });

  const planningWeek = weekStart
    ? await planningWeekServices.getPlanningWeekByStart(weekStart)
    : null;

  const tab_moments = {};

  if (weekStart && !planningWeek) {
    for (let i = 0; i < 10; i++) {
      tab_moments[i] = [];
    }
    return tab_moments;
  }

  for (let i = 0; i < 10; i++) {
    tab_moments[i] = []; // tableau de moment avec chaque case = {activités avec l'id du moment = i}
    // pour toutes les activités du prof on les cherche dans ActiviteParcours en fonction de l'index du moment
    for (const act of activites) {
      const act_present = await ActiviteParcours.findAll({
        where: {
          activiteId: act.id,
          indexMoment: i,
        },
        include: planningWeek
          ? [
              {
                model: Parcours,
                where: {
                  planningWeekId: planningWeek.id,
                },
                attributes: [],
              },
            ]
          : [],
      });
      if (act_present.length > 0) {
        // si cette activité et ce moment existe on les retourne
        tab_moments[i].push(act_present);
      }
    }
  }
  return tab_moments;
};

exports.getActiviteParcByEleve = async (eleveId) => {
  const eleve = await Eleve.findByPk(eleveId);
  const parc_of_el = eleve.parcoursId;
  // on recherche uniquement les activiteParcours du parcoursId associé à l'élève
  const activite_parc = await ActiviteParcours.findAll({
    where: {
      parcoursId: parc_of_el,
    },
    order: [[Sequelize.literal("indexMoment"), "ASC"]],
  });
  return activite_parc;
};

exports.associateActiviteParcours = async (
  parcoursId,
  activiteId,
  indexMoment
) => {
  await ActiviteParcours.destroy({
    where: {
      parcoursId,
      indexMoment,
    },
  });

  await ActiviteParcours.destroy({
    where: {
      parcoursId,
      activiteId,
    },
  });

  const newAssociation = await ActiviteParcours.create({
    parcoursId,
    activiteId,
    indexMoment,
  });

  await planningWeekServices.markWeekManualAdjustmentByParcoursId(parcoursId);
  return newAssociation;
};

exports.associateActToAllParc = async (activiteId, indexMoment, weekStart) => {
  const planningWeek = await planningWeekServices.getPlanningWeekByStart(
    weekStart
  );

  if (!planningWeek) {
    throw new Error("Aucune semaine de planning trouvee");
  }

  const all_parcs = await Parcours.findAll({
    where: {
      planningWeekId: planningWeek.id,
    },
  });

  for (const parc of all_parcs) {
    // on supprime l'activité du parcours de ce moment la
    await ActiviteParcours.destroy({
      where: {
        parcoursId: parc.id,
        indexMoment,
      },
    });

    await ActiviteParcours.destroy({
      where: {
        parcoursId: parc.id,
        activiteId,
      },
    });

    await ActiviteParcours.create({
      parcoursId: parc.id,
      activiteId,
      indexMoment,
    });
  }

  await planningWeekServices.markWeekManualAdjustmentByStart(weekStart);
  return true;
};

exports.deleteActiviteParcoursAssociation = async (parcoursId, activiteId) => {
  const deletedCount = await ActiviteParcours.destroy({
    where: {
      parcoursId,
      activiteId,
    },
  });

  if (deletedCount === 0) {
    throw new Error("Aucune association activité-parcours trouvée");
  }

  await planningWeekServices.markWeekManualAdjustmentByParcoursId(parcoursId);
  return deletedCount;
};
