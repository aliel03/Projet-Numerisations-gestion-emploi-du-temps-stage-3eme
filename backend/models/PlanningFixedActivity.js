const { DataTypes } = require("sequelize");
const db = require("../config/dbConfig");
const PlanningWeek = require("./PlanningWeek");
const Activite = require("./Activite");

const PlanningFixedActivity = db.define("PlanningFixedActivity", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  planningWeekId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "PlanningWeeks",
      key: "id",
    },
  },
  activiteId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "activites",
      key: "id",
    },
  },
  indexMoment: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  scopeType: {
    type: DataTypes.ENUM,
    values: ["all", "selected"],
    allowNull: false,
    defaultValue: "all",
  },
  targetParcoursIndexes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});

PlanningWeek.hasMany(PlanningFixedActivity, {
  foreignKey: "planningWeekId",
  onDelete: "CASCADE",
});

PlanningFixedActivity.belongsTo(PlanningWeek, {
  foreignKey: "planningWeekId",
  onDelete: "CASCADE",
});

Activite.hasMany(PlanningFixedActivity, {
  foreignKey: "activiteId",
  onDelete: "CASCADE",
});

PlanningFixedActivity.belongsTo(Activite, {
  foreignKey: "activiteId",
  onDelete: "CASCADE",
});

module.exports = PlanningFixedActivity;
