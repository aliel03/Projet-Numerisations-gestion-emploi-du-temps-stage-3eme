const { DataTypes } = require("sequelize");
const db = require("../config/dbConfig");
const Parcours = require("./Parcours");
const Activite = require("./Activite");

const ActiviteParcours = db.define("activiteParcours", {
  parcoursId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: Parcours,
      key: "id",
    },
  },
  activiteId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: Activite,
      key: "id",
    },
  },
  indexMoment: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

Parcours.belongsToMany(Activite, {
  through: ActiviteParcours,
  foreignKey: "parcoursId",
  otherKey: "activiteId",
});

Activite.belongsToMany(Parcours, {
  through: ActiviteParcours,
  foreignKey: "activiteId",
  otherKey: "parcoursId",
});

ActiviteParcours.belongsTo(Parcours, {
  foreignKey: "parcoursId",
});

Parcours.hasMany(ActiviteParcours, {
  foreignKey: "parcoursId",
});

ActiviteParcours.belongsTo(Activite, {
  foreignKey: "activiteId",
});

Activite.hasMany(ActiviteParcours, {
  foreignKey: "activiteId",
});

module.exports = ActiviteParcours;
