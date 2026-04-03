const Parcours = require("../../models/Parcours");
const ActiviteParcours = require("../../models/ActiviteParcours");
const { activiteByMoment } = require("./momentFunctions");

const buildParcoursState = (parcours) => {
  return {
    id: parcours.id,
    assignmentCount: 0,
    activiteIds: new Set(),
    assignmentsByMoment: new Map(),
  };
};

const registerAssignment = (parcoursState, associationPayload) => {
  parcoursState.assignmentsByMoment.set(
    associationPayload.indexMoment,
    associationPayload
  );
  parcoursState.activiteIds.add(associationPayload.activiteId);
  parcoursState.assignmentCount += 1;
};

const unregisterAssignment = (parcoursState, associationPayload) => {
  parcoursState.assignmentsByMoment.delete(associationPayload.indexMoment);
  parcoursState.activiteIds.delete(associationPayload.activiteId);
  parcoursState.assignmentCount -= 1;
};

const orderParcoursStatesForMoment = (parcoursStates, indexMoment) => {
  return [...parcoursStates]
    .filter((parcoursState) => !parcoursState.assignmentsByMoment.has(indexMoment))
    .sort((leftState, rightState) => {
      if (leftState.assignmentCount !== rightState.assignmentCount) {
        return leftState.assignmentCount - rightState.assignmentCount;
      }

      return leftState.id - rightState.id;
    });
};

const findRebalanceCandidate = (sourceState, targetState) => {
  const sourceAssignments = [...sourceState.assignmentsByMoment.values()]
    .filter((associationPayload) => !associationPayload.isFixed)
    .sort((leftAssignment, rightAssignment) => {
      return leftAssignment.indexMoment - rightAssignment.indexMoment;
    });

  return sourceAssignments.find((associationPayload) => {
    return (
      !targetState.assignmentsByMoment.has(associationPayload.indexMoment) &&
      !targetState.activiteIds.has(associationPayload.activiteId)
    );
  });
};

const rebalanceParcoursAssignments = (parcoursStates) => {
  if (parcoursStates.length <= 1) {
    return;
  }

  let hasRebalanced = true;

  while (hasRebalanced) {
    hasRebalanced = false;

    const orderedStates = [...parcoursStates].sort((leftState, rightState) => {
      if (leftState.assignmentCount !== rightState.assignmentCount) {
        return leftState.assignmentCount - rightState.assignmentCount;
      }

      return leftState.id - rightState.id;
    });

    const lowestState = orderedStates[0];
    const highestState = orderedStates[orderedStates.length - 1];

    if (
      !lowestState ||
      !highestState ||
      highestState.assignmentCount - lowestState.assignmentCount <= 1
    ) {
      return;
    }

    const candidate = findRebalanceCandidate(highestState, lowestState);

    if (!candidate) {
      return;
    }

    unregisterAssignment(highestState, candidate);
    candidate.parcoursId = lowestState.id;
    registerAssignment(lowestState, candidate);
    hasRebalanced = true;
  }
};

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

    const parcoursStates = tableau_parcours.map((parcours) =>
      buildParcoursState(parcours)
    );
    const associationPayloads = [];

    for (const fixedActivity of fixedActivities) {
      for (const parcoursIndex of fixedActivity.affectedParcoursIndexes) {
        const parcours = tableau_parcours[parcoursIndex];
        const parcoursState = parcoursStates[parcoursIndex];

        if (!parcours || !parcoursState) {
          continue;
        }

        const associationPayload = {
          parcoursId: parcours.id,
          activiteId: fixedActivity.activiteId,
          indexMoment: fixedActivity.indexMoment,
          isFixed: true,
        };

        associationPayloads.push(associationPayload);
        registerAssignment(parcoursState, associationPayload);
      }
    }

    // Récupère les moments et leurs activités
    const moments_pleins = await activiteByMoment(nb_eleve_max, fixedActivities);
    for (let j = 0; j < moments_pleins.length; j++) {
      const orderedParcoursStates = orderParcoursStatesForMoment(
        parcoursStates,
        j
      );

      // On remplit d'abord les parcours les moins charges pour garder un planning
      // aussi equilibré que possible quand la capacite est limitee.
      for (const parcoursState of orderedParcoursStates) {
        const newActParcours = moments_pleins[j].giveActivite([
          ...parcoursState.activiteIds,
        ]);

        if (newActParcours !== null) {
          const associationPayload = {
            parcoursId: parcoursState.id,
            activiteId: newActParcours,
            indexMoment: j,
            isFixed: false,
          };

          associationPayloads.push(associationPayload);
          registerAssignment(parcoursState, associationPayload);
        }
      }
    }

    rebalanceParcoursAssignments(parcoursStates);

    if (associationPayloads.length > 0) {
      await ActiviteParcours.bulkCreate(
        associationPayloads.map(({ isFixed, ...associationPayload }) => {
          return associationPayload;
        })
      );
    }
  } catch (error) {
    console.error("Une erreur s'est produite :", error);
    throw new Error(
      "Une erreur s'est produite lors de l'association des parcours aux activités."
    );
  }
}
module.exports = associeParcoursActivite;
