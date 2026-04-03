import { useState, useEffect, useContext } from "react";
import axiosInstance from "../../config/axiosConfig";
import ActiviteDescr from "../Activites/ActiviteDescr";
import ParcProfPdf from "./ParcProfPdf";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { MomentsContext } from "../../utils/tabMoments";
import {
  buildParcoursLabelMap,
  getParcoursDisplayName,
} from "../../utils/parcoursLabels";

function ParcProf(props) {
  const id = props.profId;
  const professeur = props.professeur;

  const { tab_moments } = useContext(MomentsContext);

  const [parcoursLabelMap, setParcoursLabelMap] = useState({});

  const [activites, setActivites] = useState(null);

  const buildPdfFileName = () => {
    const nom = professeur?.nom || "";
    const prenom = professeur?.prenom || "";
    const safeValue = `${nom}_${prenom}`
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");

    return safeValue ? `parcours_${safeValue}.pdf` : `parcours_${id}.pdf`;
  };

  useEffect(() => {
    const semaine = localStorage.getItem("semaineStage");

    axiosInstance
      .get(`/activiteparcours/professeur/${id}`, {
        params: semaine
          ? {
              weekStart: semaine,
            }
          : undefined,
      })
      .then((activitesResponse) => {
        const responseData = activitesResponse.data || {};
        setActivites(responseData);

        const parcoursIds = [];

        Object.values(responseData).forEach((moments) => {
          (moments || []).forEach((moment) => {
            const activitesDuMoment = Array.isArray(moment) ? moment : [moment];

            activitesDuMoment.forEach((activite) => {
              if (activite && activite.parcoursId) {
                parcoursIds.push(activite.parcoursId);
              }
            });
          });
        });

        setParcoursLabelMap(buildParcoursLabelMap(parcoursIds));
      })
      .catch((err) => {
        console.error(err);
      });
  }, [id]);

  const parcoursGroups = {};

  Object.entries(activites || {}).forEach(([index, moments]) => {
    const momentLabel = tab_moments && tab_moments[index];

    (moments || []).forEach((moment) => {
      const activitesDuMoment = Array.isArray(moment) ? moment : [moment];

      activitesDuMoment.forEach((activite, activiteIndex) => {
        if (!activite?.parcoursId) {
          return;
        }

        const parcoursId = String(activite.parcoursId);

        if (!parcoursGroups[parcoursId]) {
          parcoursGroups[parcoursId] = [];
        }

        parcoursGroups[parcoursId].push({
          ...activite,
          momentLabel,
          uniqueKey: `${parcoursId}-${index}-${activite.activiteId}-${activiteIndex}`,
        });
      });
    });
  });

  const orderedParcoursIds = Object.keys(parcoursGroups).sort((firstId, secondId) =>
    getParcoursDisplayName(firstId, parcoursLabelMap).localeCompare(
      getParcoursDisplayName(secondId, parcoursLabelMap),
      "fr"
    )
  );

  return (
    <div className="parcours-prof-content">
      <div className="parcours-prof-header">
        <p className="parcours-prof-text">
          Retrouvez ici les activites qui vous concernent pour la semaine.
        </p>
      </div>

      <div className="parcours-prof-grid">
        {orderedParcoursIds.map((parcoursId) => (
          <section className="parcours-prof-column" key={parcoursId}>
            <h3 className="parcours-prof-column-title">
              {getParcoursDisplayName(parcoursId, parcoursLabelMap)}
            </h3>
            <div className="parcours-prof-column-list">
              {parcoursGroups[parcoursId].map((activite) => (
                <div className="activite-prof" key={activite.uniqueKey}>
                  <ActiviteDescr id={activite.activiteId} />
                  <p className="activite-prof-label">{activite.momentLabel}</p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="parcours-prof-footer">
        <PDFDownloadLink
          className="link parcours-prof-download"
          document={
            <ParcProfPdf
              activites={activites}
              nom={professeur.nom}
              tab_moments={tab_moments}
              prenom={professeur.prenom}
            />
          }
          fileName={buildPdfFileName()}
        >
          {({ loading }) =>
            loading ? "Téléchargement en cours..." : "Télécharger le parcours"
          }
        </PDFDownloadLink>
      </div>
    </div>
  );
}

export default ParcProf;
