const { DataTypes } = require("sequelize");
const db = require("../config/dbConfig");
const Parcours = require("./Parcours");

const PlanningWeek = db.define("PlanningWeek", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  weekStart: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    unique: true,
  },
  weekEnd: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM,
    values: ["brouillon", "genere", "valide"],
    allowNull: false,
    defaultValue: "brouillon",
  },
  hasManualAdjustments: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
});

PlanningWeek.hasMany(Parcours, {
  foreignKey: "planningWeekId",
  onDelete: "CASCADE",
});

Parcours.belongsTo(PlanningWeek, {
  foreignKey: "planningWeekId",
  onDelete: "CASCADE",
});

module.exports = PlanningWeek;
