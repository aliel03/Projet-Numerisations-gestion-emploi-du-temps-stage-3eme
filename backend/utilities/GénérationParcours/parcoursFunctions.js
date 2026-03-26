const Parcours = require("../../models/Parcours");
const ActiviteParcours = require("../../models/ActiviteParcours");
const { activiteByMoment } = require("./momentFunctions");

//paramètre : nombre de parcours souhaité à indiquer par l'admin
//permet de créer des parcours en récupérant des activtiés pour chaque moment de la semaine si cela est possible
async function associeParcoursActivite(
  nb_parcours,
  nb_eleve_max,
  planningWeekId,
  fixedActivities = []
) {
  try {
    // Création des parcours
    var tableau_parcours = [];
    for (let i = 0; i < nb_parcours; i++) {
      const newParcours = await Parcours.create({ planningWeekId });
      tableau_parcours.push(newParcours);
    }

    for (const fixedActivity of fixedActivities) {
      for (const parcoursIndex of fixedActivity.affectedParcoursIndexes) {
        const parcours = tableau_parcours[parcoursIndex];

        if (!parcours) {
          continue;
        }

        await ActiviteParcours.create({
          parcoursId: parcours.id,
          activiteId: fixedActivity.activiteId,
          indexMoment: fixedActivity.indexMoment,
        });
      }
    }

    // Récupère les moments et leurs activités
    const moments_pleins = await activiteByMoment(nb_eleve_max, fixedActivities);
    for (let j = 0; j < moments_pleins.length; j++) {
      //on parcours les moments de la semaine
      for (
        let j_parcours = 0;
        j_parcours < tableau_parcours.length;
        j_parcours++
      ) {
        const parcoursId = tableau_parcours[j_parcours].id;
        const activites = await ActiviteParcours.findAll({
          where: {
            parcoursId: parcoursId,
          },
        });

        //Permet d'avoir toutes les id d'activité d'un parcours
        //utile pour la fonction giveActivite de Moment
        const idActivites = [];
        for (const act of activites) {
          idActivites.push(act.activiteId);
        }

        const hasActiviteOnMoment = activites.some(
          (activiteParcours) => activiteParcours.indexMoment === j
        );

        if (hasActiviteOnMoment) {
          continue;
        }

        //permet récupération d'une activité pour un moment donné s'il y en a de dispo encore pour ce moment
        const newActParcours = moments_pleins[j].giveActivite(idActivites);

        if (newActParcours !== null) {
          // création d'une activite_parcours
          const parcId = tableau_parcours[j_parcours].id;
          await ActiviteParcours.create({
            parcoursId: parcId,
            activiteId: newActParcours,
            indexMoment: j,
          });
        }
      }
    }
  } catch (error) {
    console.error("Une erreur s'est produite :", error);
    throw new Error(
      "Une erreur s'est produite lors de l'association des parcours aux activités."
    );
  }
}
module.exports = associeParcoursActivite;
