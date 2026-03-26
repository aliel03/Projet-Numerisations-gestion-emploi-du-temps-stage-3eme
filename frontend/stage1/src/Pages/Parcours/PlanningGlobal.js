import PlanningCard from "./PlanningCard";

const jours = [
  { label: "Lundi", matinIndex: 0, apresMidiIndex: 1 },
  { label: "Mardi", matinIndex: 2, apresMidiIndex: 3 },
  { label: "Mercredi", matinIndex: 4, apresMidiIndex: 5 },
  { label: "Jeudi", matinIndex: 6, apresMidiIndex: 7 },
  { label: "Vendredi", matinIndex: 8, apresMidiIndex: 9 },
];

function PlanningGlobal(props) {
  const parcours = props.parcours || {};
  const parcoursLabelMap = props.parcoursLabelMap || {};

  const getItemsForMoment = (indexMoment) => {
    return Object.values(parcours).flatMap((activites) =>
      (activites || []).filter((item) => item.indexMoment === indexMoment)
    );
  };

  return (
    <section className="planning-global-section">
      <h2>Planning global des activites</h2>
      <p className="planning-global-subtitle">
        Cliquez sur une activite pour ouvrir sa fiche complete et gerer ses
        parcours.
      </p>

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
                const items = getItemsForMoment(jour.matinIndex);

                return (
                  <td key={`${jour.label}-matin`} className="planning-global-cell">
                    <div className="planning-global-cell-content">
                      {items.length > 0 ? (
                        items.map((item, index) => (
                          <PlanningCard
                            key={`${item.activiteId}-${item.indexMoment}-${index}`}
                            item={item}
                            showParcours={true}
                            parcoursLabel={parcoursLabelMap[String(item.parcoursId)]}
                          />
                        ))
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
                const items = getItemsForMoment(jour.apresMidiIndex);

                return (
                  <td
                    key={`${jour.label}-apres-midi`}
                    className="planning-global-cell"
                  >
                    <div className="planning-global-cell-content">
                      {items.length > 0 ? (
                        items.map((item, index) => (
                          <PlanningCard
                            key={`${item.activiteId}-${item.indexMoment}-${index}`}
                            item={item}
                            showParcours={true}
                            parcoursLabel={parcoursLabelMap[String(item.parcoursId)]}
                          />
                        ))
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

export default PlanningGlobal;
