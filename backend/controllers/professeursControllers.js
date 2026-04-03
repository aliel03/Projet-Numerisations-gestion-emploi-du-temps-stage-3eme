const professeurService = require("../services/professeurServices");
const { generatedPassword } = require("../utilities/passwordFunctions");
const bcrypt = require("bcrypt");

exports.getAllProfesseurs = async (req, res) => {
  try {
    const professeurs = await professeurService.getAllProfesseurs();
    res.json(professeurs);
  } catch (error) {
    res
      .status(500)
      .json({
        message:
          "Une erreur s'est produite lors de la récupération des professeurs.",
      });
  }
};

exports.getProfesseur = async (req, res) => {
  const eleveId = req.params.id;
  try {
    const professeur = await professeurService.getProfesseur(eleveId);
    res.json(professeur);
  } catch (error) {
    res
      .status(500)
      .json({
        message:
          "Une erreur s'est produite lors de la récupération de ce professeur.",
      });
  }
};

//permet d'obtenir les professeurs en fonction de leur rôle
exports.getProfByRole = async (req, res) => {
  const role = req.params.role;
  try {
    const profRole = await professeurService.getProfByRole(role);
    res.json(profRole);
  } catch (error) {
    res
      .status(404)
      .json({ message: "Aucun professeur trouvé pour ce role", error });
  }
};

//permet de retourner tous les élèves ayant le tuteur passé en paramètre
exports.getEleveByTuteur = async (req, res) => {
  const tuteurId = req.params.tuteurId;

  try {
    const eleves = await professeurService.getEleveByTuteur(tuteurId);
    res.status(200).json(eleves);
  } catch (error) {
    res
      .status(404)
      .json({ message: "Aucun élève trouvé ayant ce tuteur.", error });
  }
};

exports.addProfesseur = async (req, res) => {
  const {
    nom,
    prenom,
    email,
    numero_tel,
    metier,
    etablissement,
    role,
    nb_eleve_tuteur,
    password,
  } = req.body;
  if (role === "Admin") {
    return res.status(403).json({
      message:
        "La creation d'un compte admin n'est pas autorisee depuis le formulaire.",
    });
  }
  try {
    const profData = {
      nom,
      prenom,
      email,
      numero_tel,
      metier,
      etablissement,
      role,
      nb_eleve_tuteur,
    };
    const nouveauProfesseur = await professeurService.addProfesseur(
      profData,
      password
    );
    res.status(201).json(nouveauProfesseur);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Erreur lors de la création du professeur.", error });
  }
};

exports.updateProf = async (req, res) => {
  const id = req.params.id;
  const {
    nom,
    prenom,
    numero_tel,
    metier,
    etablissement,
    role,
    nb_eleve_tuteur,
    password,
  } = req.body;
  if (role === "Admin") {
    return res.status(403).json({
      message:
        "Le role admin ne peut pas etre attribue depuis cette interface.",
    });
  }
  try {
    const profData = {
      nom,
      prenom,
      numero_tel,
      metier,
      etablissement,
      role,
      nb_eleve_tuteur,
      password,
    };
    const profUpd = await professeurService.updateProf(id, profData);
    res.status(201).json(profUpd);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Erreur lors de la création du professeur.", error });
  }
};

exports.deleteProfesseur = async (req, res) => {
  const professeurId = req.params.id;

  try {
    await professeurService.deleteProfesseur(professeurId);
    res.status(200).json({ message: "Le professeur a bien été supprimé." });
  } catch (error) {
    res
      .status(500)
      .json({
        message:
          "Une erreur s'est produite lors de la suppression du professeur.",
      });
  }
};

exports.deleteAllProfesseurs = async (req, res) => {
  try {
    const nb_prof_supp = await professeurService.deleteAllProfesseurs();
    res
      .status(200)
      .json({ message: "Nombre de professeurs supprimés :", nb_prof_supp });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Erreur lors de la suppression de tous les professeurs.",
      });
  }
};
