export const getAlphabetLabel = (index) => {
  let currentIndex = index;
  let label = "";

  while (currentIndex >= 0) {
    label = String.fromCharCode(65 + (currentIndex % 26)) + label;
    currentIndex = Math.floor(currentIndex / 26) - 1;
  }

  return label;
};

export const buildParcoursLabelMap = (parcoursIds = []) => {
  const uniqueIds = [];

  parcoursIds.forEach((parcoursId) => {
    const key = String(parcoursId);
    if (!uniqueIds.includes(key)) {
      uniqueIds.push(key);
    }
  });

  return uniqueIds.reduce((labelMap, parcoursId, index) => {
    labelMap[parcoursId] = `Parcours ${getAlphabetLabel(index)}`;
    return labelMap;
  }, {});
};

export const getParcoursDisplayName = (parcoursId, labelMap = {}) => {
  return labelMap[String(parcoursId)] || `Parcours ${parcoursId}`;
};
