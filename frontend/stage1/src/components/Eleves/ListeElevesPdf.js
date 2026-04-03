import React from "react";
import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";
import EleveDescrPdf from "./EleveDescrPdf";

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
    fontSize: 30,
    color: "red",
  },
  section: {
    margin: 20,
    padding: 10,
    fontSize: 15,
    borderRadius: 10,
    backgroundColor: "#E3D3E4",
  },
});

function ListeEleves(props) {
  const eleves = props.eleves;
  const activiteId = props.activiteId;
  const professeur = props.professeur;
  const eleve = props.eleve;
  const title = props.title;
  const variant = props.variant || "default";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text>
            {title
              ? title
              : professeur
              ? "Liste des élèves dont " +
                professeur.nom +
                " " +
                professeur.prenom +
                " est tuteur : "
              : eleve
              ? "Liste des élèves du groupe de  " +
                eleve.nom +
                " " +
                eleve.prenom
              : activiteId
              ? "Liste des élèves pour l'activité " + activiteId
              : ""}
          </Text>
        </View>
        <View>
          {eleves &&
            eleves.map((eleve) => (
              <View key={eleve.id} style={styles.section}>
                {variant === "group-summary" ? (
                  <>
                    <Text>
                      {eleve.nom} {eleve.prenom}
                    </Text>
                    <Text>Email : {eleve.email}</Text>
                  </>
                ) : (
                  <EleveDescrPdf id={eleve.id} />
                )}
              </View>
            ))}
        </View>
      </Page>
    </Document>
  );
}

export default ListeEleves;
