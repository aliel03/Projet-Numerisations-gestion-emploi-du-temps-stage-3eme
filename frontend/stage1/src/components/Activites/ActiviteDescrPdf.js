import React from "react";
import { Text, View } from "@react-pdf/renderer";
import { useState, useEffect } from "react";
import axiosInstance from "../../config/axiosConfig";
import EleveDescrPdf from "../Eleves/EleveDescrPdf";

function ActiviteDescrPdf(props) {
  const id = props.id;
  const indexMoment = props.indexMoment;
  const role = props.role;
  const couleur = props.couleur;

  const [activite, setActivite] = useState(null);
  const [eleves, setEleves] = useState(null);
  const [professeur, setProf] = useState(null);

  useEffect(async () => {
    await axiosInstance
      .get(`/activites/${id}`)
      .then((res) => {
        setActivite(res.data);
        axiosInstance
          .get(`/professeurs/${res.data.professeurId}`)
          .then((res) => {
            setProf(res.data);
          })
          .catch((err) => {
            console.error(err);
          });
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  useEffect(() => {
    axiosInstance
      .get(`/eleves/activite/${id}/${indexMoment}`)
      .then((res) => {
        setEleves(res.data);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [id, indexMoment]);

  return (
    activite && (
      <div>
        <View
          style={{
            backgroundColor: couleur,
            borderRadius: "10px",
            padding: "5px",
          }}
        >
          <Text>Activite : {activite.nom}</Text>
          <Text>Description : {activite.description}</Text>
          <Text>Nombre de réalisation: {activite.nb_realisations}</Text>
          <Text>Nombre d'élèves au maximum: {activite.nb_eleve_max}</Text>
          <Text>Lieu du déroulement de l'activité: {activite.lieu}</Text>
          <Text>
            Lieu de rendez-vous (là où on doit se rendre): {activite.lieu_rdv}
          </Text>
          {activite.commentaire_admin && (
            <Text>Commentaire admin : {activite.commentaire_admin}</Text>
          )}
          <Text>id : {activite.id}</Text>
          <Text>Encadrant : {professeur && professeur.nom}</Text>
          <Text>
            numéro de téléphone encadrant :{" "}
            {professeur && professeur.numero_tel}
          </Text>
        </View>
        {role === "prof" && eleves && (
          <View
            style={{
              backgroundColor: couleur,
              borderRadius: "10px",
              margin: "10px",
              padding: "5px",
              breakInside: "avoid",
            }}
          >
            <Text style={{ fontSize: "20px" }}>
              {eleves && "Liste des élèves pour l'activité"}
            </Text>
            {eleves &&
              eleves.map((eleve) => (
                <View key={eleve.id} style={{ margin: "10px" }}>
                  <EleveDescrPdf id={eleve.id} />
                </View>
              ))}
          </View>
        )}
      </div>
    )
  );
}

export default ActiviteDescrPdf;
