const ActiviteParcours = require("../models/ActiviteParcours");
const Activite = require("../models/Activite");
const Eleve = require("../models/Eleve");
const Parcours = require("../models/Parcours");
const Professeur = require("../models/Professeur");
const { Op } = require("sequelize");
const {
  generateRandomPassword,
  generatedPassword,
} = require("../utilities/passwordFunctions");
const bcrypt = require("bcrypt");
const emailTemplates = require("../utilities/emailTemplates");
const planningWeekServices = require("./planningWeekServices");

const parsePositiveInteger = (value) => {
  const parsedValue = Number.parseInt(value, 10);

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    return null;
  }

  return parsedValue;
};

const buildTutorAssignmentContext = async () => {
  const [tuteurs, assignedCounts] = await Promise.all([
    Professeur.findAll({
      where: {
        nb_eleve_tuteur: {
          [Op.gt]: 0,
        },
      },
      order: [
        ["nb_eleve_tuteur", "DESC"],
        ["id", "ASC"],
      ],
    }),
    Eleve.findAll({
      attributes: [
        "professeurId",
        [Eleve.sequelize.fn("COUNT", Eleve.sequelize.col("id")), "assignedCount"],
      ],
      where: {
        professeurId: {
          [Op.ne]: null,
        },
      },
      group: ["professeurId"],
      raw: true,
    }),
  ]);

  const currentLoads = new Map();

  assignedCounts.forEach((row) => {
    currentLoads.set(
      Number.parseInt(row.professeurId, 10),
      Number.parseInt(row.assignedCount, 10)
    );
  });

  return {
    tuteurs,
    currentLoads,
  };
};

const selectBestTuteur = (assignmentContext) => {
  const { tuteurs, currentLoads } = assignmentContext;

  return [...tuteurs]
    .filter((tuteur) => {
      return (currentLoads.get(tuteur.id) || 0) < tuteur.nb_eleve_tuteur;
    })
    .sort((leftTuteur, rightTuteur) => {
      const leftLoad = currentLoads.get(leftTuteur.id) || 0;
      const rightLoad = currentLoads.get(rightTuteur.id) || 0;

      if (leftLoad !== rightLoad) {
        return leftLoad - rightLoad;
      }

      if (leftTuteur.nb_eleve_tuteur !== rightTuteur.nb_eleve_tuteur) {
        return rightTuteur.nb_eleve_tuteur - leftTuteur.nb_eleve_tuteur;
      }

      return leftTuteur.id - rightTuteur.id;
    })[0];
};

const getPlanningWeekParcoursIds = async (weekStart) => {
  const planningWeek = weekStart
    ? await planningWeekServices.getPlanningWeekByStart(weekStart)
    : null;

  if (weekStart && !planningWeek) {
    throw new Error("Aucune semaine de planning trouvee");
  }

  if (!planningWeek) {
    return {
      planningWeek: null,
      parcoursIds: new Set(),
    };
  }

  const parcours = await Parcours.findAll({
    where: {
      planningWeekId: planningWeek.id,
    },
    attributes: ["id"],
    raw: true,
  });

  return {
    planningWeek,
    parcoursIds: new Set(
      parcours.map((item) => Number.parseInt(item.id, 10))
    ),
  };
};

exports.getAllEleves = async () => {
  const eleves = await Eleve.findAll();
  return eleves;
};

exports.getEleveById = async (eleveId) => {
  const eleve = await Eleve.findByPk(eleveId);
  return eleve;
};

// permet de faire la liste des élèves pour une activité à un moment donné
// activiteId : l'id de l'activité en question
// indexMoment : le moment dans la semaine : 0 = lundi matin, 1 lundi après-midi...
exports.getElevesByActMoment = async (activiteId, indexMoment, weekStart) => {
  //commence par récupérer les parcours ayant cette activité à ce moment
  // il peut y en avoir plusieurs car une meme activité peut apparaitre au meme moment sur plusieurs parcours
  //cas ou l'activité peut accueillir plusieurs élèves en même temps
  const planningWeek = weekStart
    ? await planningWeekServices.getPlanningWeekByStart(weekStart)
    : null;

  if (weekStart && !planningWeek) {
    return [];
  }

  const parcours = await ActiviteParcours.findAll({
    attributes: ["parcoursId"],
    where: {
      activiteId: activiteId,
      indexMoment: indexMoment,
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

  //ensuite on récupère les élèves qui ont un parcoursId appartenant aux parcours trouvé precedemment
  const eleves = [];
  for (const parc of parcours) {
    const eleve_found = await Eleve.findAll({
      where: {
        parcoursId: parc.dataValues.parcoursId,
      },
    });
    eleves.push(...eleve_found); // on rajoute tous les élèves trouvés
  }
  return eleves;
};

//permet de récupérer les élèves ayant le même parcours que l'élève passé en paramètre
exports.getGroupe = async (eleveId) => {
  //on récupère le parcours de l'élève
  const eleve = await Eleve.findByPk(eleveId);
  const parcours_commun = eleve.parcoursId;

  //on récupère les élèves ayant le même
  const groupe = await Eleve.findAll({
    where: {
      [Op.and]: {
        parcoursId: {
          [Op.ne]: null,
          [Op.eq]: parcours_commun,
        },
        id: {
          [Op.ne]: eleveId, // on ne récupère pas l'élève lui même
        },
      },
    },
  });

  console.log(groupe);

  return groupe;
};

exports.getElevesByEncadrant = async (professeurId, weekStart) => {
  const planningWeek = weekStart
    ? await planningWeekServices.getPlanningWeekByStart(weekStart)
    : null;

  if (weekStart && !planningWeek) {
    return [];
  }

  const activites = await ActiviteParcours.sequelize.models.activites.findAll({
    // Use the activity owner to find the students actually seen by this encadrant.
  });
  const activitesForEncadrant = await Activite.findAll({
    where: {
      professeurId,
    },
    attributes: ["id"],
    raw: true,
  });

  if (!activitesForEncadrant.length) {
    return [];
  }

  const activiteIds = activitesForEncadrant.map((activite) => activite.id);

  const activiteParcours = await ActiviteParcours.findAll({
    attributes: ["parcoursId"],
    where: {
      activiteId: {
        [Op.in]: activiteIds,
      },
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
    raw: true,
  });

  const uniqueParcoursIds = [
    ...new Set(
      activiteParcours.map((item) => Number.parseInt(item.parcoursId, 10))
    ),
  ].filter(Number.isInteger);

  if (!uniqueParcoursIds.length) {
    return [];
  }

  return await Eleve.findAll({
    where: {
      parcoursId: {
        [Op.in]: uniqueParcoursIds,
      },
    },
  });
};

//envoi mdp à l'élève pour lui permettre de se connecter
exports.sendPassword = async (eleveId) => {
  try {
    const eleve = await Eleve.findByPk(eleveId);

    // dans le cas ou l'élève n'a pas entré son mot de passe lui même (seul cas possible actuellement)
    //si l'élève choisi son mot de passe (cas test) il ne recevra pas de mot de passe
    if (!eleve.password) {
      const password = generatedPassword; // on généère un mot de passe au hazard
      const recipientEmail = eleve.email;

      //on envoie le mail avec le mot de passe
      await emailTemplates.sendPasswordEmail(recipientEmail, password);

      // on hash ensuite le mot de passe pour l'enregistrer dans la base de données
      const hashedPassword = await bcrypt.hash(password, 10);
      //on modifie le mot de passe de l'élève
      await eleve.update({
        password: hashedPassword,
      });
    }

    return { message: "Mot de passe envoyé à l'élève avec succès" };
  } catch (error) {
    throw new Error("Erreur lors de l'envoi de mot de passe à l'élève");
  }
};

//création d'un nouvel élève
exports.createEleve = async (eleveData, password) => {
  //dans le cas ou l'email ajouté est déjà dans la base de données on ne crée pas de nouvel élève
  const eleveExistant = await Eleve.findOne({
    where: {
      email: eleveData.email,
    },
  });

  if (eleveExistant) {
    return eleveExistant;
  }

  const nouvelEleve = await Eleve.create(eleveData);
  if (password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    nouvelEleve.update({
      password: hashedPassword,
    });
  }
  return nouvelEleve;
};

//Fonction pour attribuer un tuteur à un élève
//au moment ou celui-ci est confirmé par l'admin
exports.assignTuteur = async (eleve, existingContext = null) => {
  try {
    if (!eleve) {
      return false;
    }

    if (eleve.professeurId) {
      return true;
    }

    const assignmentContext = existingContext || (await buildTutorAssignmentContext());
    const selectedProfesseur = selectBestTuteur(assignmentContext);

    if (!selectedProfesseur) {
      return false;
    }

    await eleve.update({ professeurId: selectedProfesseur.id });
    assignmentContext.currentLoads.set(
      selectedProfesseur.id,
      (assignmentContext.currentLoads.get(selectedProfesseur.id) || 0) + 1
    );

    return true;
  } catch (error) {
    throw new Error("Error lors de l'attribution du tuteur");
  }
};

//Assigner un parcours disponible à un élève
exports.assignParcours = async (
  eleveId,
  nb_eleve_max,
  weekStart,
  options = {}
) => {
  const shouldMarkManualAdjustment = options.markManualAdjustment ?? true;
  const eleve = await Eleve.findByPk(eleveId);
  const planningWeek = weekStart
    ? await planningWeekServices.getPlanningWeekByStart(weekStart)
    : null;
  const parcoursWhere = {};

  if (weekStart && !planningWeek) {
    throw new Error("Aucune semaine de planning trouvee");
  }

  if (planningWeek) {
    parcoursWhere.planningWeekId = planningWeek.id;
  }

  const all_parcours = await Parcours.findAll({
    where: parcoursWhere,
  });

  const parcoursIds = all_parcours.map((parcours) => parcours.id);

  if (all_parcours.length === 0) {
    throw new Error("Aucun parcours disponible pour cette semaine");
  }

  // Comptage des parcours
  const counts = await Eleve.findAndCountAll({
    attributes: ["parcoursId"],
    group: ["parcoursId"],
    where:
      parcoursIds.length > 0
        ? {
            parcoursId: {
              [Op.in]: parcoursIds,
            },
          }
        : undefined,
  });

  // les parcours ayant été attribué à nb_eleve_max élèves
  const parc_not_available = [];

  for (let i = 0; i < counts.rows.length; i++) {
    const count = counts.count[i].count; // récupère le count pour le parcoursId d'indice i
    const parcoursId = counts.rows[i].parcoursId; // récupère le parcoursId d'indice i
    if (count >= nb_eleve_max) {
      parc_not_available.push(parcoursId);
    }
  }

  for (const parc of all_parcours) {
    let indicateur = 0; // permet de savoir si id du parcours apparait dans parc_not_available

    for (const parc_not of parc_not_available) {
      if (parc_not === parc.id) {
        indicateur++;
      }
    }

    if (indicateur === 0) {
      await eleve.update({
        parcoursId: parc.id, // on attribut ce parcours à l'élève
      });
      break;
    }
  }
  if (eleve.password) {
    await this.sendPassword(eleve.id);
  }

  if (weekStart && shouldMarkManualAdjustment) {
    await planningWeekServices.markWeekManualAdjustmentByStart(weekStart);
  }

  return eleve;
};

exports.assignTuteurToAllEleves = async () => {
  const assignmentContext = await buildTutorAssignmentContext();
  const eleves = await Eleve.findAll({
    where: {
      professeurId: null,
    },
    order: [
      ["id", "ASC"],
    ],
  });

  let assignedCount = 0;
  let unavailableCount = 0;

  for (const eleve of eleves) {
    const assigned = await exports.assignTuteur(eleve, assignmentContext);

    if (assigned) {
      assignedCount += 1;
    } else {
      unavailableCount += 1;
    }
  }

  return {
    totalPending: eleves.length,
    assignedCount,
    unavailableCount,
  };
};

exports.assignParcoursToAllEleves = async (nbEleveMax, weekStart) => {
  const normalizedNbEleveMax = parsePositiveInteger(nbEleveMax);

  if (!normalizedNbEleveMax) {
    throw new Error(
      "La taille maximale des groupes doit etre un entier strictement positif."
    );
  }

  if (!weekStart) {
    throw new Error("La semaine de planning est obligatoire.");
  }

  const { parcoursIds } = await getPlanningWeekParcoursIds(weekStart);
  const eleves = await Eleve.findAll({
    order: [
      ["id", "ASC"],
    ],
  });

  const elevesToAssign = eleves.filter((eleve) => {
    return !parcoursIds.has(Number.parseInt(eleve.parcoursId, 10));
  });

  let assignedCount = 0;

  for (const eleve of elevesToAssign) {
    await exports.assignParcours(eleve.id, normalizedNbEleveMax, weekStart, {
      markManualAdjustment: false,
    });
    assignedCount += 1;
  }

  if (assignedCount > 0) {
    await planningWeekServices.markWeekManualAdjustmentByStart(weekStart);
  }

  return {
    totalPending: elevesToAssign.length,
    assignedCount,
  };
};

exports.prepareWeekForEleves = async (nbEleveMax, weekStart) => {
  const tutorSummary = await exports.assignTuteurToAllEleves();
  const parcoursSummary = await exports.assignParcoursToAllEleves(
    nbEleveMax,
    weekStart
  );
  const { parcoursIds } = await getPlanningWeekParcoursIds(weekStart);
  const eleves = await Eleve.findAll({
    order: [["id", "ASC"]],
  });

  const readyCount = eleves.filter((eleve) => {
    return (
      Boolean(eleve.professeurId) &&
      parcoursIds.has(Number.parseInt(eleve.parcoursId, 10))
    );
  }).length;

  return {
    tutorSummary,
    parcoursSummary,
    readyCount,
    totalEleves: eleves.length,
  };
};

exports.updateEleve = async (eleveId, eleveData) => {
  const eleve = await Eleve.findByPk(eleveId);
  if (!eleve) {
    throw new Error("L'élève que vous souhaitez modifier n'existe pas");
  }
  await eleve.update(eleveData);
  return eleve;
};

exports.deleteEleve = async (eleveId) => {
  const eleve = await Eleve.findByPk(eleveId);
  if (!eleve) {
    throw new Error("L'élève que vous souhaitez supprimer n'existe pas");
  }
  await eleve.destroy();
};

exports.deleteAllEleve = async () => {
  const nb_eleve_supp = await Eleve.destroy({ where: {} });
  return nb_eleve_supp;
};
