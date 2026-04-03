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
  const totalParcours = Object.keys(parcours).length;

  const getSortedParcoursLabels = (parcoursIds) => {
    return [...parcoursIds]
      .map((parcoursId) => ({
        id: String(parcoursId),
        label: parcoursLabelMap[String(parcoursId)] || `Parcours ${parcoursId}`,
      }))
      .sort((leftItem, rightItem) => leftItem.label.localeCompare(rightItem.label))
      .map((item) => item.label);
  };

  const getItemsForMoment = (indexMoment) => {
    const groupedItems = new Map();

    Object.entries(parcours).forEach(([parcoursId, activites]) => {
      (activites || [])
        .filter((item) => item.indexMoment === indexMoment)
        .forEach((item) => {
          const key = `${item.activiteId}-${item.indexMoment}`;
          const currentGroup = groupedItems.get(key);

          if (!currentGroup) {
            groupedItems.set(key, {
              ...item,
              parcoursIds: [String(parcoursId)],
            });
            return;
          }

          if (!currentGroup.parcoursIds.includes(String(parcoursId))) {
            currentGroup.parcoursIds.push(String(parcoursId));
          }
        });
    });

    return [...groupedItems.values()].sort((leftItem, rightItem) => {
      const leftSize = leftItem.parcoursIds?.length || 0;
      const rightSize = rightItem.parcoursIds?.length || 0;

      if (leftSize !== rightSize) {
        return rightSize - leftSize;
      }

      const leftName = leftItem.activite?.nom || "";
      const rightName = rightItem.activite?.nom || "";

      return leftName.localeCompare(rightName);
    });
  };

  const getParcoursBadgeLabels = (item) => {
    const groupedParcoursLabels = getSortedParcoursLabels(
      item.parcoursIds || [item.parcoursId]
    );

    if (groupedParcoursLabels.length === totalParcours && totalParcours > 1) {
      return ["Tous les parcours", ...groupedParcoursLabels];
    }

    return groupedParcoursLabels;
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
                            parcoursLabels={getParcoursBadgeLabels(item)}
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
                            parcoursLabels={getParcoursBadgeLabels(item)}
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
