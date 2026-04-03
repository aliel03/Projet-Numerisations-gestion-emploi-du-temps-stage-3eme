import { useEffect } from "react";
import { useState } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import axiosInstance from "../../config/axiosConfig";
import ListeEleves from "./ListeElevesPdf";
import {
  buildParcoursLabelMap,
  getParcoursDisplayName,
} from "../../utils/parcoursLabels";

function EleveGroupe(props) {
  const id = props.id;
  const eleveP = props.eleve;
  const semaine = localStorage.getItem("semaineStage");

  const [groupe, setGroupe] = useState(null);
  const [parcoursLabelMap, setParcoursLabelMap] = useState({});

  useEffect(() => {
    axiosInstance
      .get(`/eleves/groupe/${id}`)
      .then((res) => {
        setGroupe(res.data);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  useEffect(() => {
    if (!semaine) {
      return;
    }

    axiosInstance
      .get("/activiteparcours/parcours", {
        params: {
          weekStart: semaine,
        },
      })
      .then((res) => {
        setParcoursLabelMap(buildParcoursLabelMap(Object.keys(res.data || {})));
      })
      .catch((err) => {
        console.error(err);
      });
  }, [semaine]);

  const parcoursDisplayName = getParcoursDisplayName(
    eleveP?.parcoursId,
    parcoursLabelMap
  );
  const groupeDisplayName = parcoursDisplayName.replace("Parcours", "Groupe");
  const groupeFileName = `${groupeDisplayName
    .toLowerCase()
    .replace(/\s+/g, "-")}.pdf`;

  return (
    groupe &&
    groupe.length > 0 && (
      <div className="contain-groupe">
        <div className="ensemble-groupe groupe-download-only">
          <PDFDownloadLink
            className="link pdf"
            document={
              <ListeEleves
                eleves={groupe}
                eleve={eleveP}
                title={`Liste des eleves du ${groupeDisplayName}`}
                variant="group-summary"
              />
            }
            fileName={groupeFileName}
          >
            {({ blob, url, loading, error }) =>
              loading ? (
                "Téléchargement en cours..."
              ) : (
                <>
                  <i className="fa-solid fa-circle-down fa-xl"></i> Télécharger
                  le groupe
                </>
              )
            }
          </PDFDownloadLink>
        </div>
      </div>
    )
  );
}

export default EleveGroupe;
