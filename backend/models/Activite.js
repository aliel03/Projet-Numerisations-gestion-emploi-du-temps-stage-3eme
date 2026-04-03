const { DataTypes } = require("sequelize");
const db = require("../config/dbConfig");
const Professeur = require("./Professeur");
const Parcours = require("./Parcours");

const Activite = db.define("activites", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nom: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  nb_realisations: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  nb_eleve_max: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  l1: {
    type: DataTypes.INTEGER, // 1 si dispo 0 sinon
    allowNull: false,
  },
  l2: {
    type: DataTypes.INTEGER, // 1 si dispo 0 sinon
    allowNull: false,
  },
  ma1: {
    type: DataTypes.INTEGER, // 1 si dispo 0 sinon
    allowNull: false,
  },
  ma2: {
    type: DataTypes.INTEGER, // 1 si dispo 0 sinon
    allowNull: false,
  },
  me1: {
    type: DataTypes.INTEGER, // 1 si dispo 0 sinon
    allowNull: false,
  },
  me2: {
    type: DataTypes.INTEGER, // 1 si dispo 0 sinon
    allowNull: false,
  },
  j1: {
    type: DataTypes.INTEGER, // 1 si dispo 0 sinon
    allowNull: false,
  },
  j2: {
    type: DataTypes.INTEGER, // 1 si dispo 0 sinon
    allowNull: false,
  },
  v1: {
    type: DataTypes.INTEGER, // 1 si dispo 0 sinon
    allowNull: false,
  },
  v2: {
    type: DataTypes.INTEGER, // 1 si dispo 0 sinon
    allowNull: false,
  },
  lieu: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  lieu_rdv: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  commentaire_admin: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: "",
  },
  professeurId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Professeurs",
      key: "id",
    },
  },
});

Activite.belongsTo(Professeur, {
  foreignKey: "professeurId",
  onDelete: "CASCADE",
});

module.exports = Activite;
