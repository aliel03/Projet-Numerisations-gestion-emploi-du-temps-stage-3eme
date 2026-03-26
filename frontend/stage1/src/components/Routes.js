import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";

import Home from "../Pages/Home/Home";

import Login from "../Pages/Authentification/Login";

import Eleve from "../Pages/Eleves/Eleve";
import Eleves from "../Pages/Eleves/Eleves";
import EleveForm from "../Pages/Eleves/EleveForm";

import Professeurs from "../Pages/Professeurs/Professeurs";
import Professeur from "../Pages/Professeurs/Professeur";
import ProfForm from "../Pages/Professeurs/ProfForm";

import Activtes from "../Pages/Activites/Activites";
import ActiviteForm from "../Pages/Activites/ActiviteForm";
import Activite from "../Pages/Activites/Activite";

import ParcoursGeneration from "../Pages/Parcours/ParcoursGeneration";
import Parcours from "../Pages/Parcours/Parcours";

import QuestionForm from "../Pages/Questions/QuestionForm";
import Questions from "../Pages/Questions/Questions";

import ReponsesEleves from "../Pages/Reponses/ReponsesEleves";
import ReponsesProfesseurs from "../Pages/Reponses/ReponsesProfesseurs";
import ReponsesForAllEleves from "../Pages/Reponses/ReponsesForAllEleves";

function Rootes(props) {
  const user = props.user;
  const semaine = props.semaine;
  const setSemaine = props.setSemaine;

  const [nbEleveMax, setNbEleveMax] = useState(() => {
    const storedValue = localStorage.getItem("nbEleveMax");
    return storedValue ? parseInt(storedValue) : 0;
  });

  const updateNbEleveMax = (newNbEleveMax) => {
    setNbEleveMax(newNbEleveMax);
  };

  useEffect(() => {
    localStorage.setItem("nbEleveMax", nbEleveMax.toString());
  }, [nbEleveMax]);

  return (
    <Routes>
      <Route exact path="/" element={<Home user={user} />} />
      <Route path="/login/:personne" element={<Login />} />

      <Route path="/profForm" element={<ProfForm />} />
      <Route path="/professeurs" element={<Professeurs />} />
      <Route path="/professeur/:id" element={<Professeur />} />

      <Route path="/eleveForm" element={<EleveForm />} />
      <Route exact path="/eleves" element={<Eleves />} />
      <Route
        path="/eleve/:id"
        element={<Eleve nbEleveMax={nbEleveMax} semaine={semaine} />}
      />

      <Route
        path="/activiteForm"
        element={<ActiviteForm semaine={semaine} />}
      />
      <Route path="/activite/:id" element={<Activite semaine={semaine} />} />
      <Route path="/activites" element={<Activtes />} />

      <Route
        path="/parcoursGeneration"
        element={
          <ParcoursGeneration
            semaine={semaine}
            setSemaine={setSemaine}
            nbEleveMax={nbEleveMax}
            setNbEleveMax={updateNbEleveMax}
          />
        }
      />
      <Route
        path="/parcours"
        element={<Parcours semaine={semaine} setSemaine={setSemaine} />}
      />

      <Route path="/questionForm" element={<QuestionForm />} />
      <Route path="/questions" element={<Questions />} />

      <Route path="/reponsesEleves" element={<ReponsesEleves />} />
      <Route exact path="/reponses/:role/" element={<ReponsesProfesseurs />} />
      <Route exact path="/reponses/:profId" element={<ReponsesProfesseurs />} />
      <Route
        path="/reponses/foreleves/:profId"
        element={<ReponsesForAllEleves />}
      />
    </Routes>
  );
}

export default Rootes;
