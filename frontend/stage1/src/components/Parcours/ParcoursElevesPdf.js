import React from "react";
import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

const MOMENT_LABELS = [
  "Lundi Matin",
  "Lundi Apres-midi",
  "Mardi Matin",
  "Mardi Apres-midi",
  "Mercredi Matin",
  "Mercredi Apres-midi",
  "Jeudi Matin",
  "Jeudi Apres-midi",
  "Vendredi Matin",
  "Vendredi Apres-midi",
];

const styles = StyleSheet.create({
  page: {
    paddingTop: 32,
    paddingBottom: 36,
    paddingHorizontal: 28,
    backgroundColor: "#ffffff",
  },
  headerCard: {
    padding: 18,
    borderRadius: 18,
    backgroundColor: "#f6ebe4",
    marginBottom: 18,
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    color: "#3d3128",
  },
  subtitle: {
    marginTop: 6,
    fontSize: 11,
    color: "#6c584c",
  },
  summaryRow: {
    marginTop: 12,
    flexDirection: "row",
    gap: 12,
  },
  summaryItem: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: "#ffffff",
  },
  summaryLabel: {
    fontSize: 10,
    color: "#6c584c",
    textTransform: "uppercase",
  },
  summaryValue: {
    marginTop: 2,
    fontSize: 12,
    color: "#3d3128",
    fontWeight: 700,
  },
  section: {
    marginTop: 10,
  },
  sectionTitle: {
    marginBottom: 10,
    fontSize: 16,
    fontWeight: 700,
    color: "#3d3128",
  },
  emptyText: {
    fontSize: 11,
    color: "#6c584c",
  },
  eleveCard: {
    marginBottom: 10,
    padding: 12,
    borderRadius: 14,
    border: "1 solid #ead5c9",
    backgroundColor: "#fffaf7",
  },
  eleveTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: "#3d3128",
  },
  eleveLine: {
    marginTop: 4,
    fontSize: 10,
    color: "#5f4b40",
  },
  planningCard: {
    marginBottom: 10,
    padding: 12,
    borderRadius: 14,
    backgroundColor: "#f8f3ef",
    border: "1 solid #ead5c9",
  },
  planningMoment: {
    fontSize: 11,
    color: "#0c7b56",
    fontWeight: 700,
  },
  planningTitle: {
    marginTop: 5,
    fontSize: 13,
    color: "#3d3128",
    fontWeight: 700,
  },
  planningLine: {
    marginTop: 4,
    fontSize: 10,
    color: "#5f4b40",
  },
});

function ParcoursElevesPdf(props) {
  const parcoursLabel = props.parcoursLabel;
  const semaineLabel = props.semaineLabel;
  const eleves = props.eleves || [];
  const activites = props.activites || [];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerCard}>
          <Text style={styles.title}>Eleves du {parcoursLabel}</Text>
          <Text style={styles.subtitle}>Semaine : {semaineLabel}</Text>

          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Parcours</Text>
              <Text style={styles.summaryValue}>{parcoursLabel}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Eleves</Text>
              <Text style={styles.summaryValue}>{eleves.length}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Activites</Text>
              <Text style={styles.summaryValue}>{activites.length}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Liste des eleves</Text>
          {eleves.length === 0 ? (
            <Text style={styles.emptyText}>
              Aucun eleve n'est actuellement rattache a ce parcours.
            </Text>
          ) : (
            eleves.map((eleve) => (
              <View style={styles.eleveCard} key={eleve.id}>
                <Text style={styles.eleveTitle}>
                  {eleve.nom} {eleve.prenom}
                </Text>
                <Text style={styles.eleveLine}>Email : {eleve.email || "Non renseigne"}</Text>
                <Text style={styles.eleveLine}>
                  Telephone eleve : {eleve.numero_tel || "Non renseigne"}
                </Text>
                <Text style={styles.eleveLine}>
                  Telephone parent : {eleve.numero_tel_parent || "Non renseigne"}
                </Text>
                <Text style={styles.eleveLine}>
                  Etablissement : {eleve.etablissement || "Non renseigne"}
                </Text>
                <Text style={styles.eleveLine}>
                  Adresse : {eleve.adress || "Non renseigne"}
                </Text>
                <Text style={styles.eleveLine}>
                  Tuteur :{" "}
                  {eleve.tuteur
                    ? `${eleve.tuteur.prenom} ${eleve.tuteur.nom}`
                    : "Non attribue"}
                </Text>
                {eleve.tuteur && (
                  <>
                    <Text style={styles.eleveLine}>
                      Email tuteur : {eleve.tuteur.email || "Non renseigne"}
                    </Text>
                    <Text style={styles.eleveLine}>
                      Telephone tuteur : {eleve.tuteur.numero_tel || "Non renseigne"}
                    </Text>
                  </>
                )}
              </View>
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Planning du parcours</Text>
          {activites.length === 0 ? (
            <Text style={styles.emptyText}>
              Aucune activite n'est encore associee a ce parcours.
            </Text>
          ) : (
            activites.map((act, index) => (
              <View style={styles.planningCard} key={`${act.activiteId}-${act.indexMoment}-${index}`}>
                <Text style={styles.planningMoment}>
                  {MOMENT_LABELS[act.indexMoment] || `Moment ${act.indexMoment}`}
                </Text>
                <Text style={styles.planningTitle}>
                  {act.activite?.nom || `Activite ${act.activiteId}`}
                </Text>
                <Text style={styles.planningLine}>
                  Encadrant :{" "}
                  {act.activite?.professeur
                    ? `${act.activite.professeur.prenom} ${act.activite.professeur.nom}`
                    : "Non renseigne"}
                </Text>
                <Text style={styles.planningLine}>
                  Lieu : {act.activite?.lieu || "Non renseigne"}
                </Text>
                <Text style={styles.planningLine}>
                  Point de rendez-vous : {act.activite?.lieu_rdv || "Non renseigne"}
                </Text>
                <Text style={styles.planningLine}>
                  Description : {act.activite?.description || "Non renseignee"}
                </Text>
              </View>
            ))
          )}
        </View>
      </Page>
    </Document>
  );
}

export default ParcoursElevesPdf;
