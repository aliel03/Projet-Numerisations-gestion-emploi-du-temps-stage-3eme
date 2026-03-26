const ActiviteParcours = require("../models/ActiviteParcours");
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
exports.assignTuteur = async (eleve) => {
  // chercher les professeur qui ont déjà des élèves et retourne le professeurId
  //ainsi que le nombre d'élèves dont il est déjà tuteur
  try {
    const counts = await Eleve.findAndCountAll({
      attributes: ["professeurId"],
      group: "professeurId",
    });

    const avaibleProfs = [];
    const notAvaibleProfs = [];

    //pour tous les professesseur étant déjà tuteur d'au moins un èléve
    // on regard le nombre d'élèves max qu'ils peuvent avoir
    // si il est supèrieur au nombre d'élèves dont ils sont déjà tuteur, on le rajoute dans avaibleProfs
    // sinon on l'ajoute dans notAvaibleProfs
    for (let i = 0; i < counts.rows.length; i++) {
      const professeurId = counts.rows[i].professeurId;

      if (professeurId !== null) {
        const prof = await Professeur.findByPk(professeurId);

        if (prof.dataValues.nb_eleve_tuteur > counts.count[i].count) {
          avaibleProfs.push(professeurId);
        } else {
          notAvaibleProfs.push(professeurId);
        }
      }
    }

    //on récupère tous les profs (même les encadrants car ils ont 0 comme nb_eleve_tuteur)
    const allProfs = await Professeur.findAll();
    for (const item of allProfs) {
      if (item.nb_eleve_tuteur > 0) {
        let indicateur = 0;
        for (const profNot of notAvaibleProfs) {
          if (profNot === item.id) {
            indicateur++;
          }
        }
        if (indicateur === 0) {
          // si le tuteur n'apparait pas au moins une fois dans notAvaibleProfs
          avaibleProfs.push(item.id); // on le rajoute dans allProfs
        }
      }
    }
    if (avaibleProfs.length === 0) {
      return false; // Retourne false si aucun tuteur disponible
    }

    const selectedProfesseur = avaibleProfs[0];

    await eleve.update({ professeurId: selectedProfesseur }); // on modifie l'élève pour lui attribuer un tuteur

    return true; // Retourne true si l'attribution du tuteur est réussi
  } catch (error) {
    throw new Error("Error lors de l'attribution du tuteur");
  }
};

//Assigner un parcours disponible à un élève
exports.assignParcours = async (eleveId, nb_eleve_max, weekStart) => {
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

  if (weekStart) {
    await planningWeekServices.markWeekManualAdjustmentByStart(weekStart);
  }

  return eleve;
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
