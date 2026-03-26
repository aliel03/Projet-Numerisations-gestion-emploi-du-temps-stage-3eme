class Moment {
  constructor(nb_eleve_max) {
    this.nb_eleve_max = nb_eleve_max; // le nombre d'élève maximum pour un parcours
    this.activite_dispo = new Map(); // va stocker les activité
  }

  //on ajoute id de l'activité et nb_eleve_max de l'activité
  addActivite(activite, dispo) {
    this.activite_dispo.set(activite, dispo);
  }

  reduceActiviteCapacity(activite, occupiedPlaces) {
    const currentValue = this.activite_dispo.get(activite);

    if (currentValue === undefined) {
      return;
    }

    const nextValue = currentValue - occupiedPlaces;

    if (nextValue >= this.nb_eleve_max) {
      this.activite_dispo.set(activite, nextValue);
      return;
    }

    this.activite_dispo.delete(activite);
  }

  // permet d'attribuer une activité à un parcours
  giveActivite(parc) {
    let activitePrise = null;
    for (const [activite, dispo] of this.activite_dispo) {
      let found = false;
      for (const act of parc) {
        // vérifie que l'activité n'apparait pas déjà dans le parcours donné
        if (act !== null && act === activite) {
          found = true;
          break;
        }
      }
      if (!found) {
        // si elle n'apparait pas déjà
        activitePrise = activite;
        const valeurActuelle = this.activite_dispo.get(activitePrise);
        if (
          valeurActuelle !== undefined &&
          valeurActuelle >= this.nb_eleve_max
        ) {
          // on regard qu'elle puisse bien prendre le nombre d'élèves minimum pour un parcours
          this.activite_dispo.set(
            activitePrise,
            valeurActuelle - this.nb_eleve_max
          ); // on lui enlève le nombre d'élève que l'activité va occuper pour ce moment
        }
        if (this.activite_dispo.get(activitePrise) < this.nb_eleve_max) {
          this.activite_dispo.delete(activitePrise); // on la supprime du moment dans le cas ou l'activité n'a pas assez de place pour accueil un nouveau groupe
          break;
        }
      }
    }
    return activitePrise;
  }

  isEmpty() {
    return this.activite_dispo.size === 0;
  }

  // détermine à quelle fréquence le moment peut occuper des élèves
  // utile à l'optimisation de la répartition des activité dans les moments
  occupeParcours() {
    let nbRetour = 0;
    for (const dispo of this.activite_dispo.values()) {
      nbRetour += dispo;
    }
    return nbRetour;
  }
}

module.exports = Moment;
