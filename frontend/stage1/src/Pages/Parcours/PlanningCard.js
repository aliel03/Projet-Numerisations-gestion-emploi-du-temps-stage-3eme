import { Link } from "react-router-dom";

function PlanningCard(props) {
  const item = props.item;
  const showParcours = props.showParcours;
  const parcoursLabel = props.parcoursLabel;

  if (!item || !item.activite) {
    return null;
  }

  const professeur = item.activite.professeur;
  const nomEncadrant = professeur
    ? `${professeur.prenom} ${professeur.nom}`
    : "Non renseigne";

  return (
    <Link className="planning-card link" to={`/activite/${item.activiteId}`}>
      {showParcours && (
        <span className="planning-card-badge">
          {parcoursLabel || `Parcours ${item.parcoursId}`}
        </span>
      )}
      <span className="planning-card-title">{item.activite.nom}</span>
      <span className="planning-card-prof">Encadrant : {nomEncadrant}</span>
    </Link>
  );
}

export default PlanningCard;
