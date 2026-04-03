import { useState, useEffect } from "react";
import { Document, Page, View, StyleSheet, Text } from "@react-pdf/renderer";
import axiosInstance from "../../config/axiosConfig";
import EleveDescrPdf from "./EleveDescrPdf";
import ActiviteDescrPdf from "../Activites/ActiviteDescrPdf";

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "white",
    alignItems: "left",
    paddingBottom: 50,
    paddingTop: 50,
  },
  header: {
    marginTop: 20,
    marginBottom: 20,
    textAlign: "center",
    fontSize: 25,
    backgroundColor: "#E3D3E4",
    padding: 15,
    marginLeft: 100,
    marginRight: 100,
    borderRadius: 20,
  },
  section: {
    margin: 20,
    padding: 10,
    fontSize: 15,
    borderRadius: 10,
    backgroundColor: "#E3D3E4",
  },
  title: {
    margin: 10,
    paddingBottom: 10,
    textAlign: "center",
    fontSize: "20px",
    borderTop: 3,
    paddingTop: 20,
  },
});

function ElevePdf(props) {
  const id = props.id;

  const tab_moments = [
    "Lundi Matin",
    "Lundi Aprés-midi",
    "Mardi Matin",
    "Mardi Aprés-midi",
    "Mercredi Matin",
    "Mercredi Aprés-midi",
    "Jeudi Matin",
    "Jeudi Aprés-midi",
    "Vendredi Matin",
    "Vendredi Aprés-midi",
  ];

  const moments_colors = [
    "#D0FCB3",
    "#9EC9A8",
    "#85B0A3",
    "#6C969D",
    "#6A7780",
    "#685762",
    "#826F75",
    "#9B8787",
    "#B59F99",
    "#CEB6AB",
  ];

  const [eleve, setEleve] = useState(null);
  const [activites, setActivites] = useState(null);
  const [tuteur, setTuteur] = useState(null);

  useEffect(() => {
    axiosInstance
      .get(`/eleves/${id}`)
      .then((res) => {
        setEleve(res.data);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  useEffect(() => {
    if (eleve && eleve.parcoursId) {
      axiosInstance
        .get(`/activiteparcours/${eleve.parcoursId}`)
        .then((res) => {
          setActivites(res.data);
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }, [!eleve]);

  useEffect(() => {
    if (eleve && parseInt(eleve.professeurId)) {
      axiosInstance
        .get(`/professeurs/${parseInt(eleve.professeurId)}`)
        .then((res) => {
          setTuteur(res.data);
        })
        .then((err) => {
          console.error(err);
        });
    }
  }, [!eleve]);

  return (
    eleve && (
      <Document>
        <Page>
          <Text style={styles.header}>{eleve.nom + " " + eleve.prenom}</Text>
          <View style={styles.section}>
            <EleveDescrPdf id={eleve.id} />
          </View>
          <View>
            {activites && (
              <>
                <Text style={styles.title}>Mon parcours : </Text>
                {activites.map((act) => (
                  <View key={act.activiteId} style={{ margin: "20" }}>
                    <View>
                      <Text
                        style={{
                          color: moments_colors[act.indexMoment],
                          paddingBottom: "12px",
                        }}
                      >
                        {tab_moments && tab_moments[act.indexMoment]}
                      </Text>
                    </View>
                    <ActiviteDescrPdf
                      key={act.activiteId}
                      id={act.activiteId}
                      couleur={moments_colors[act.indexMoment]}
                      style={{ backgroundColor: "#cfbba5" }}
                    />
                  </View>
                ))}
              </>
            )}
          </View>
          {tuteur && (
            <View>
              <Text style={styles.title}>
                Mon tuteur {tuteur.nom + " " + tuteur.prenom + " :"}
              </Text>
              <View style={styles.section}>
                <Text> email : {tuteur.email}</Text>
                <Text> numéro de téléphone: {tuteur.numero_tel}</Text>
                <Text> metier : {tuteur.metier}</Text>
                <Text> etablissement : {tuteur.etablissement}</Text>
              </View>
            </View>
          )}
        </Page>
      </Document>
    )
  );
}

export default ElevePdf;
