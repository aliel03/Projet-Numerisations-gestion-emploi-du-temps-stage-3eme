import PlanningCard from "./PlanningCard";
import { getParcoursDisplayName } from "../../utils/parcoursLabels";

const jours = [
  { label: "Lundi", matinIndex: 0, apresMidiIndex: 1 },
  { label: "Mardi", matinIndex: 2, apresMidiIndex: 3 },
  { label: "Mercredi", matinIndex: 4, apresMidiIndex: 5 },
  { label: "Jeudi", matinIndex: 6, apresMidiIndex: 7 },
  { label: "Vendredi", matinIndex: 8, apresMidiIndex: 9 },
];

function PlanningParcours(props) {
  const parcours = props.parcours || {};
  const parcoursSelectionne = props.parcoursSelectionne;
  const parcoursLabelMap = props.parcoursLabelMap || {};
  const activitesParcours = parcoursSelectionne
    ? parcours[parcoursSelectionne] || []
    : [];

  const getItemForMoment = (indexMoment) => {
    return activitesParcours.find((item) => item.indexMoment === indexMoment);
  };

  return (
    <section className="planning-global-section">
      <h2>
        Planning du {getParcoursDisplayName(parcoursSelectionne, parcoursLabelMap)}
      </h2>
      <p className="planning-global-subtitle">
        Cliquez sur une activite pour ouvrir sa fiche complete.
      </p>
      {activitesParcours.length === 0 && (
        <p className="planning-global-subtitle">
          Aucune activite n&apos;est encore associee a ce parcours.
        </p>
      )}

      <div className="planning-global-table-container">
        <table className="planning-global-table">
          <thead>
            <tr>
              <th>Moment</th>
              {jours.map((jour) => (
                <th key={jour.label}>{jour.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="planning-global-row-label">Matin</td>
              {jours.map((jour) => {
                const item = getItemForMoment(jour.matinIndex);

                return (
                  <td key={`${jour.label}-matin`} className="planning-global-cell">
                    <div className="planning-global-cell-content">
                      {item ? (
                        <PlanningCard item={item} />
                      ) : (
                        <span className="planning-empty-cell">Aucune activite</span>
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>
            <tr>
              <td className="planning-global-row-label">Apres-midi</td>
              {jours.map((jour) => {
                const item = getItemForMoment(jour.apresMidiIndex);

                return (
                  <td
                    key={`${jour.label}-apres-midi`}
                    className="planning-global-cell"
                  >
                    <div className="planning-global-cell-content">
                      {item ? (
                        <PlanningCard item={item} />
                      ) : (
                        <span className="planning-empty-cell">Aucune activite</span>
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default PlanningParcours;
