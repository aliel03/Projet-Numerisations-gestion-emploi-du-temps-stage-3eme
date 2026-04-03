import { Link } from "react-router-dom";

function PlanningCard(props) {
  const item = props.item;
  const showParcours = props.showParcours;
  const parcoursLabel = props.parcoursLabel;
  const parcoursLabels = props.parcoursLabels || [];

  if (!item || !item.activite) {
    return null;
  }

  const professeur = item.activite.professeur;
  const nomEncadrant = professeur
    ? `${professeur.prenom} ${professeur.nom}`
    : "Non renseigne";

  return (
    <Link className="planning-card link" to={`/activite/${item.activiteId}`}>
      {showParcours &&
        (parcoursLabels.length > 0 ? (
          <div className="planning-card-badges">
            {parcoursLabels.map((label) => (
              <span className="planning-card-badge" key={label}>
                {label}
              </span>
            ))}
          </div>
        ) : (
          <span className="planning-card-badge">
            {parcoursLabel || `Parcours ${item.parcoursId}`}
          </span>
        ))}
      <span className="planning-card-title">{item.activite.nom}</span>
      <span className="planning-card-prof">Encadrant : {nomEncadrant}</span>
    </Link>
  );
}

export default PlanningCard;
